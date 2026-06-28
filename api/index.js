import express from 'express';
import cors from 'cors';
import { waitUntil } from '@vercel/functions';
import { getData, saveData, runExclusive } from './db.js';
import webpush from 'web-push';

const app = express();

app.use(cors());
app.use(express.json());

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Scoring function
function calculatePoints(guessA, guessB, resultA, resultB) {
  // If either the guess or the result contains null/undefined/NaN, no points can be computed yet
  if (
    guessA === null || guessA === undefined || isNaN(guessA) ||
    guessB === null || guessB === undefined || isNaN(guessB) ||
    resultA === null || resultA === undefined || isNaN(resultA) ||
    resultB === null || resultB === undefined || isNaN(resultB)
  ) {
    return 0;
  }

  // 1. Exact score (Placar Exato)
  if (guessA === resultA && guessB === resultB) {
    return 25;
  }

  const guessWinner = guessA > guessB ? 'A' : (guessB > guessA ? 'B' : 'Draw');
  const resultWinner = resultA > resultB ? 'A' : (resultB > resultA ? 'B' : 'Draw');

  // If the winner is wrong, 0 points
  if (guessWinner !== resultWinner) {
    return 0;
  }

  // If it is a draw (and not exact, which was checked above)
  if (resultWinner === 'Draw') {
    return 15; // Draw with different score
  }

  // Winner is correct. Check sub-criteria
  const guessDiff = guessA - guessB;
  const resultDiff = resultA - resultB;
  const isDiffCorrect = guessDiff === resultDiff;

  const winnerTeam = resultWinner; // 'A' or 'B'
  const loserTeam = resultWinner === 'A' ? 'B' : 'A';

  const guessWinnerGoals = winnerTeam === 'A' ? guessA : guessB;
  const resultWinnerGoals = winnerTeam === 'A' ? resultA : resultB;
  const isWinnerGoalsCorrect = guessWinnerGoals === resultWinnerGoals;

  const guessLoserGoals = loserTeam === 'A' ? guessA : guessB;
  const resultLoserGoals = loserTeam === 'A' ? resultA : resultB;
  const isLoserGoalsCorrect = guessLoserGoals === resultLoserGoals;

  if (isDiffCorrect) {
    return 18; // Winner + Goal Difference
  }
  if (isWinnerGoalsCorrect) {
    return 15; // Winner + Winner's Goals
  }
  if (isLoserGoalsCorrect) {
    return 12; // Winner + Loser's Goals
  }

  return 10; // Winner only
}

let lastSyncTimes = {};
let syncPromises = {};

const ALL_LEAGUES = ['fifa.world', 'bra.1', 'uefa.champions', 'eng.1', 'esp.1'];

function getActiveLeaguesFromDb(db) {
  const activeLeagues = new Set();
  const now = Date.now();
  if (!db.matches) return activeLeagues;

  for (const match of db.matches) {
    const matchTime = new Date(match.date).getTime();
    const startDiff = (matchTime - now) / 60000;
    const isLive = match.status === 'live';
    const isUpcoming = match.status === 'pending' && startDiff >= -10 && startDiff <= 15;

    if (isLive || isUpcoming) {
      const league = match.league || 'fifa.world';
      if (ALL_LEAGUES.includes(league)) {
        activeLeagues.add(league);
      }
    }
  }

  return activeLeagues;
}

async function runServerSideSyncCycle() {
  if (!vapidPublic) {
    await initVapidKeys();
  }

  await checkAndSendPushReminders();

  const dbBefore = await getData();
  const pendingBefore = (dbBefore.pendingPushNotifications || []).length;

  const activeLeagues = getActiveLeaguesFromDb(dbBefore);
  const leaguesToSync = activeLeagues.size > 0 ? [...activeLeagues] : ALL_LEAGUES;

  for (const league of leaguesToSync) {
    try {
      await syncWithWorldCupAPI(league, true);
    } catch (err) {
      console.error(`Error syncing league ${league}:`, err);
    }
  }

  const dbAfter = await getData();
  const pendingAfter = (dbAfter.pendingPushNotifications || []).length;

  return {
    activeLeagues: [...activeLeagues],
    synced: leaguesToSync,
    pendingBefore,
    pendingAfter,
    newlyQueued: Math.max(0, pendingAfter - pendingBefore)
  };
}

function isCronAuthorized(req) {
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET) {
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
  }
  return true;
}

const STADIUM_OFFSETS = {
  "1": -6, // Mexico City
  "2": -6, // Guadalajara
  "3": -6, // Monterrey
  "4": -5, // Dallas (CDT)
  "5": -5, // Houston (CDT)
  "6": -5, // Kansas City (CDT)
  "7": -4, // Atlanta (EDT)
  "8": -4, // Miami (EDT)
  "9": -4, // Boston (EDT)
  "10": -4, // Philadelphia (EDT)
  "11": -4, // NY/NJ (EDT)
  "12": -4, // Toronto (EDT)
  "13": -7, // Vancouver (PDT)
  "14": -7, // Seattle (PDT)
  "15": -7, // San Francisco (PDT)
  "16": -7  // Los Angeles (PDT)
};

const STADIUMS_DATA = {
  "1": { name: "Estadio Azteca", city: "Cidade do México", country: "México", capacity: 83000 },
  "2": { name: "Estadio Akron", city: "Guadalajara", country: "México", capacity: 48000 },
  "3": { name: "Estadio BBVA", city: "Monterrey", country: "México", capacity: 53500 },
  "4": { name: "AT&T Stadium", city: "Dallas (Arlington)", country: "Estados Unidos", capacity: 94000 },
  "5": { name: "NRG Stadium", city: "Houston", country: "Estados Unidos", capacity: 72000 },
  "6": { name: "Arrowhead Stadium", city: "Kansas City", country: "Estados Unidos", capacity: 73000 },
  "7": { name: "Mercedes-Benz Stadium", city: "Atlanta", country: "Estados Unidos", capacity: 75000 },
  "8": { name: "Hard Rock Stadium", city: "Miami", country: "Estados Unidos", capacity: 65000 },
  "9": { name: "Gillette Stadium", city: "Boston (Foxborough)", country: "Estados Unidos", capacity: 65000 },
  "10": { name: "Lincoln Financial Field", city: "Filadélfia", country: "Estados Unidos", capacity: 69000 },
  "11": { name: "MetLife Stadium", city: "Nova York/Nova Jersey", country: "Estados Unidos", capacity: 82500 },
  "12": { name: "BMO Field", city: "Toronto", country: "Canadá", capacity: 45000 },
  "13": { name: "BC Place", city: "Vancouver", country: "Canadá", capacity: 54000 },
  "14": { name: "Lumen Field", city: "Seattle", country: "Estados Unidos", capacity: 69000 },
  "15": { name: "Levi's Stadium", city: "San Francisco (Santa Clara)", country: "Estados Unidos", capacity: 71000 },
  "16": { name: "SoFi Stadium", city: "Los Angeles", country: "Estados Unidos", capacity: 70000 }
};

function parseDate(localDateStr, stadiumId) {
  try {
    const [datePart, timePart] = localDateStr.split(' ');
    const [month, day, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    // Cria data em formato UTC neutro
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    
    // Subtrai o fuso horário local do estádio para converter para o UTC absoluto real
    const offset = STADIUM_OFFSETS[stadiumId] || -5;
    utcDate.setUTCHours(utcDate.getUTCHours() - offset);
    
    return utcDate.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

const TEAM_MAP = {
  "Algeria": "Argélia",
  "Argentina": "Argentina",
  "Australia": "Austrália",
  "Austria": "Áustria",
  "Belgium": "Bélgica",
  "Bosnia and Herzegovina": "Bósnia e Herzegovina",
  "Bosnia-Herzegovina": "Bósnia e Herzegovina",
  "Bosnia": "Bósnia e Herzegovina",
  "Brazil": "Brasil",
  "Canada": "Canadá",
  "Cape Verde": "Cabo Verde",
  "Cabo Verde": "Cabo Verde",
  "Colombia": "Colômbia",
  "Croatia": "Croácia",
  "Curaçao": "Curaçao",
  "Curacao": "Curaçao",
  "Czech Republic": "República Tcheca",
  "Czechia": "República Tcheca",
  "República Checa": "República Tcheca",
  "Democratic Republic of the Congo": "República Democrática do Congo",
  "DR Congo": "República Democrática do Congo",
  "Congo DR": "República Democrática do Congo",
  "Ecuador": "Equador",
  "Egypt": "Egito",
  "England": "Inglaterra",
  "France": "França",
  "Germany": "Alemanha",
  "Ghana": "Gana",
  "Haiti": "Haiti",
  "Iran": "Irã",
  "IR Iran": "Irã",
  "Iraq": "Iraque",
  "Ivory Coast": "Costa do Marfim",
  "Cote d'Ivoire": "Costa do Marfim",
  "Japan": "Japão",
  "Jordan": "Jordânia",
  "Mexico": "México",
  "Morocco": "Marrocos",
  "Netherlands": "Holanda",
  "New Zealand": "Nova Zelândia",
  "Norway": "Noruega",
  "Panama": "Panamá",
  "Paraguay": "Paraguai",
  "Portugal": "Portugal",
  "Qatar": "Catar",
  "Saudi Arabia": "Arábia Saudita",
  "Scotland": "Escócia",
  "Senegal": "Senegal",
  "South Africa": "África do Sul",
  "South Korea": "Coreia do Sul",
  "Korea Republic": "Coreia do Sul",
  "Spain": "Espanha",
  "Sweden": "Suécia",
  "Switzerland": "Suíça",
  "Tunisia": "Tunísia",
  "Turkey": "Turquia",
  "Türkiye": "Turquia",
  "United States": "Estados Unidos",
  "USA": "Estados Unidos",
  "Uruguay": "Uruguai",
  "Uzbekistan": "Uzbequistão",
  "Russia": "Rússia",
  "Ukraine": "Ucrânia",
  "Wales": "País de Gales",
  "Poland": "Polônia",
  "Denmark": "Dinamarca",
  "Serbia": "Sérvia",
  "Slovakia": "Eslováquia",
  "Slovenia": "Eslovênia",
  "Romania": "Romênia",
  "Georgia": "Geórgia",
  "Greece": "Grécia",
  "Finland": "Finlândia",
  "Hungary": "Hungria",
  "Iceland": "Islândia",
  "Northern Ireland": "Irlanda do Norte",
  "Republic of Ireland": "Irlanda",
  "Albania": "Albânia",
  "North Macedonia": "Macedônia do Norte",
  "Bulgaria": "Búlgária",
  // Brazilian teams normalizations
  "Athletico-PR": "Athletico Paranaense",
  "Athletico Paranaense": "Athletico Paranaense",
  "Atlético-PR": "Athletico Paranaense",
  "Atletico-PR": "Athletico Paranaense",
  "Atlético Mineiro": "Atlético-MG",
  "Atlético-MG": "Atlético-MG",
  "Atletico-MG": "Atlético-MG",
  "Atletico Mineiro": "Atlético-MG",
  "Red Bull Bragantino": "Red Bull Bragantino",
  "RB Bragantino": "Red Bull Bragantino",
  "Bragantino": "Red Bull Bragantino",
  "Vasco da Gama": "Vasco da Gama",
  "Vasco": "Vasco da Gama",
  "Botafogo-RJ": "Botafogo",
  "Coritiba-PR": "Coritiba",
  "Cuiabá-MT": "Cuiabá",
  "Cuiaba": "Cuiabá",
  "Goiás-GO": "Goiás",
  "Goias": "Goiás",
  "América-MG": "América Mineiro",
  "América Mineiro": "América Mineiro",
  "America-MG": "América Mineiro",
  "Ceará-CE": "Ceará",
  "Ceara": "Ceará"
};

function normalizeTeam(name) {
  if (!name) return "";
  const trimmed = name.trim();
  if (TEAM_MAP[trimmed]) return TEAM_MAP[trimmed];
  return trimmed;
}

function translateTeam(name) {
  if (!name) return "";
  const trimmed = name.trim();
  if (TEAM_MAP[trimmed]) return TEAM_MAP[trimmed];
  
  let translated = trimmed;
  // Translate placeholders on the fly
  translated = translated.replace(/Winner Match (\d+)/i, 'Vencedor do Jogo $1');
  translated = translated.replace(/Loser Match (\d+)/i, 'Perdedor do Jogo $1');
  translated = translated.replace(/Winner Group ([A-L])/i, '1º do Grupo $1');
  translated = translated.replace(/Runner-up Group ([A-L])/i, '2º do Grupo $1');
  translated = translated.replace(/3rd Group ([A-L/]+)/i, '3º do Grupo $1');
  translated = translated.replace(/Group ([A-L])/i, 'Grupo $1');
  
  return translated;
}

async function fetchTeamLogo(teamName) {
  try {
    const url = `https://site.web.api.espn.com/apis/site/v2/sports/soccer/apis/search/v2?query=${encodeURIComponent(teamName)}&limit=5`; // wait, let's use the correct URL
    // Wait, let's write: https://site.web.api.espn.com/apis/search/v2
    const correctUrl = `https://site.web.api.espn.com/apis/search/v2?query=${encodeURIComponent(teamName)}&limit=5`;
    const res = await fetch(correctUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const teamResult = data.results?.find(r => r.type === 'team');
    if (teamResult && teamResult.contents && teamResult.contents.length > 0) {
      const match = teamResult.contents.find(t => t.sport === 'soccer');
      if (match && match.image && match.image.default) {
        return match.image.default;
      }
      const first = teamResult.contents[0];
      if (first.image && first.image.default) {
        return first.image.default;
      }
    }
  } catch (e) {
    console.error(`Failed to fetch logo for ${teamName}:`, e.message);
  }
  return null;
}

async function migrateDatabaseTeamNames() {
  try {
    const db = await getData();
    let changed = false;
    if (db.matches && Array.isArray(db.matches)) {
      for (const match of db.matches) {
        const translatedA = translateTeam(match.teamA);
        const translatedB = translateTeam(match.teamB);
        if (match.teamA !== translatedA) {
          match.teamA = translatedA;
          changed = true;
        }
        if (match.teamB !== translatedB) {
          match.teamB = translatedB;
          changed = true;
        }
        
        // Convert stadium country
        if (match.stadiumCountry === 'United States' || match.stadiumCountry === 'USA') {
          match.stadiumCountry = 'Estados Unidos';
          changed = true;
        } else if (match.stadiumCountry === 'Mexico') {
          match.stadiumCountry = 'México';
          changed = true;
        } else if (match.stadiumCountry === 'Canada') {
          match.stadiumCountry = 'Canadá';
          changed = true;
        }
      }
    }
    if (changed) {
      await saveData(db);
      console.log('Database team names migrated successfully to Portuguese.');
    }
  } catch (err) {
    console.error('Failed to run database team names migration:', err);
  }
}

async function deduplicateDatabaseMatches() {
  try {
    await runExclusive(async () => {
      const db = await getData();
      if (!db.matches || !Array.isArray(db.matches)) return;

      const uniqueMatches = [];
      let changed = false;

      // Group matches by ID first
      const groups = {};
      for (const match of db.matches) {
        if (!match.id) continue;
        if (!groups[match.id]) {
          groups[match.id] = [];
        }
        groups[match.id].push(match);
      }

      for (const id in groups) {
        const list = groups[id];
        if (list.length > 1) {
          // Sort to keep the best one:
          // prefer manuallyUpdated, finished, or the one with scores
          list.sort((a, b) => {
            if (a.manuallyUpdated && !b.manuallyUpdated) return -1;
            if (!a.manuallyUpdated && b.manuallyUpdated) return 1;
            if (a.status === 'finished' && b.status !== 'finished') return -1;
            if (a.status !== 'finished' && b.status === 'finished') return 1;
            if (a.scoreA !== null && b.scoreA === null) return -1;
            if (a.scoreA === null && b.scoreA !== null) return 1;
            return 0;
          });
          uniqueMatches.push(list[0]);
          changed = true;
          console.log(`Deduplicating match ${id}, keeping the best of ${list.length} instances`);
        } else {
          uniqueMatches.push(list[0]);
        }
      }

      if (changed) {
        db.matches = uniqueMatches;
        await saveData(db);
        console.log('Database matches deduplicated successfully.');
      } else {
        console.log('No duplicate matches found in database.');
      }
    });
  } catch (err) {
    console.error('Failed to run database matches deduplication:', err);
  }
}

// Run database migrations asynchronously on startup
migrateDatabaseTeamNames();
deduplicateDatabaseMatches();
restoreScorersFromLocalBackup();


async function fetchMatchDetailsFromESPN(league, espnEventId) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/summary?event=${espnEventId}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    const comp = data.header?.competitions?.[0];
    if (!comp || !comp.details) return null;

    const homeId = comp.competitors?.find(c => c.homeAway === 'home')?.team?.id;
    const awayId = comp.competitors?.find(c => c.homeAway === 'away')?.team?.id;

    const extract = (teamId) => {
      if (!teamId) return "null";
      const goals = comp.details
        .filter(d => d.scoringPlay === true && d.team && String(d.team.id) === String(teamId))
        .map(d => {
          const athlete = d.participants?.[0]?.athlete;
          const name = athlete ? athlete.displayName : "Unknown";
          const time = d.clock ? d.clock.displayValue : "";

          let suffix = "";
          if (d.ownGoal) {
            suffix = " (GC)";
          } else if (d.penaltyKick) {
            suffix = " (P)";
          }

          return `"${name} ${time}${suffix}"`;
        });
      if (goals.length === 0) return "null";
      return `{${goals.join(',')}}`;
    };

    return {
      homeScorers: extract(homeId),
      awayScorers: extract(awayId)
    };
  } catch (err) {
    console.error(`Failed to fetch details for event ${espnEventId}:`, err);
    return null;
  }
}

async function restoreScorersFromLocalBackup() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const localDbPath = path.join(__dirname, '../data/db.json');
    const localContent = await fs.readFile(localDbPath, 'utf-8');
    const localDb = JSON.parse(localContent);

    await runExclusive(async () => {
      const db = await getData();
      let changed = false;

      for (const match of db.matches) {
        const currentHome = match.home_scorers;
        const currentAway = match.away_scorers;
        if (!currentHome || currentHome === 'null' || currentHome === '{}' ||
            !currentAway || currentAway === 'null' || currentAway === '{}') {
          
          const backup = localDb.matches.find(m => 
            m.id === match.id || 
            (m.teamA === match.teamA && m.teamB === match.teamB && m.date === match.date)
          );

          if (backup && backup.home_scorers && backup.home_scorers !== 'null' && backup.home_scorers !== '{}') {
            match.home_scorers = backup.home_scorers;
            match.away_scorers = backup.away_scorers;
            changed = true;
            console.log(`Restored scorers for match ${match.id} (${match.teamA} vs ${match.teamB}) from local backup.`);
          }
        }
      }

      if (changed) {
        await saveData(db);
        console.log('Database matches updated with restored scorers.');
      }
    });
  } catch (err) {
    console.error('Failed to restore scorers from local backup:', err);
  }
}


function extractScorers(competition, teamId) {
  if (!competition.details) return "null";
  
  const goals = competition.details
    .filter(d => d.scoringPlay === true && d.type && (d.type.text === "Goal" || d.type.text === "Own Goal" || d.type.text === "Penalty Goal"))
    .filter(d => String(d.team.id) === String(teamId))
    .map(d => {
      const athlete = d.athletesInvolved && d.athletesInvolved[0];
      const name = athlete ? athlete.displayName : "Unknown";
      const time = d.clock ? d.clock.displayValue : "";
      
      let suffix = "";
      if (d.type.text === "Own Goal") {
        suffix = " (GC)";
      } else if (d.penaltyKick) {
        suffix = " (P)";
      }
      
      return `"${name} ${time}${suffix}"`;
    });
  
  if (goals.length === 0) return "null";
  return `{${goals.join(',')}}`;
}

async function syncWithWorldCupAPI(league = 'fifa.world', force = false) {
  const now = Date.now();
  const lastSync = lastSyncTimes[league] || 0;
  if (!force && (now - lastSync < 30000)) {
    // Cache de 30 segundos por campeonato
    return;
  }

  // Se já houver sincronização ativa para esta liga, aguarda a promessa terminar
  if (syncPromises[league]) {
    await syncPromises[league];
    return;
  }

  let resolveSync;
  syncPromises[league] = new Promise(resolve => { resolveSync = resolve; });

  try {
    // Build URLs based on selected league
    let urls = [];
    if (league === 'fifa.world') {
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200&lang=pt');
    } else if (league === 'bra.1') {
      // Fetch in two parts due to 300 items limit (380 matches in total)
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?dates=20260401-20260815&limit=250&lang=pt');
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?dates=20260816-20261215&limit=250&lang=pt');
    } else if (league === 'uefa.champions') {
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard?dates=20250901-20260615&limit=250&lang=pt');
    } else if (league === 'eng.1') {
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=20250801-20260531&limit=250&lang=pt');
    } else if (league === 'esp.1') {
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard?dates=20250801-20260531&limit=250&lang=pt');
    } else {
      // Fallback
      urls.push(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=20260101-20261231&limit=300&lang=pt`);
    }

    const allEvents = [];
    for (const url of urls) {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(20000)
      });
      if (!res.ok) {
        console.error(`ESPN API returned error for url ${url}:`, res.status);
        continue;
      }
      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        allEvents.push(...data.events);
      }
    }

    if (allEvents.length === 0) return;

    const updatedMatchesToNotify = [];
    await runExclusive(async () => {
      const db = await getData();
      let dbChanged = false;

      for (const e of allEvents) {
        const comp = e.competitions[0];
        const homeCompetitor = comp.competitors.find(c => c.homeAway === 'home');
        const awayCompetitor = comp.competitors.find(c => c.homeAway === 'away');
        if (!homeCompetitor || !awayCompetitor) continue;

        const espnHome = normalizeTeam(homeCompetitor.team.displayName);
        const espnAway = normalizeTeam(awayCompetitor.team.displayName);

        // Find match in DB
        const targetId = `espn_${e.id}`;
        let match = db.matches.find(m => m.id === targetId);
        if (!match) {
          match = db.matches.find(m => {
            const mLeague = m.league || 'fifa.world';
            if (mLeague !== league) return false;

            const dbHome = normalizeTeam(m.teamA);
            const dbAway = normalizeTeam(m.teamB);
            const teamsMatch = (dbHome === espnHome && dbAway === espnAway) || (dbHome === espnAway && dbAway === espnHome);
            if (teamsMatch) return true;

            const dateDiffMin = Math.abs(new Date(m.date) - new Date(e.date)) / 60000;
            if (dateDiffMin < 60) {
              const isKnockout = m.group === 'R32' || m.group === 'R16' || m.group === 'QF' || m.group === 'SF' || m.group === '3RD' || m.group === 'FINAL';
              const espnIsKnockout = espnHome.includes("Winner") || espnHome.includes("Place") || espnAway.includes("Winner") || espnAway.includes("Place");
              if (isKnockout || espnIsKnockout) return true;
            }
            return false;
          });
        }


        // Map ESPN status to DB status
        let newStatus = 'pending';
        const espnState = e.status.type.state;
        const espnStateName = e.status.type.name;

        if (espnState === 'post') {
          newStatus = 'finished';
        } else if (espnState === 'in' || espnStateName === 'STATUS_IN_PROGRESS' || espnStateName === 'STATUS_LIVE_HOVER') {
          newStatus = 'live';
        }

        // Extract match clock/minute info from ESPN
        let matchClock = null;
        let clockUpdatedAt = match ? match.clockUpdatedAt : null;
        if (newStatus === 'live') {
          // shortDetail gives nicely formatted strings like "1st Half 23'", "HT", "2nd Half 67'"
          matchClock = e.status?.type?.shortDetail || e.status?.displayClock || null;
          if (!match || match.matchClock !== matchClock || !clockUpdatedAt) {
            clockUpdatedAt = new Date().toISOString();
          }
        } else if (newStatus === 'finished') {
          matchClock = 'FT';
          clockUpdatedAt = null;
        }

        const scoreA = homeCompetitor.score === 'null' || homeCompetitor.score === null || homeCompetitor.score === undefined ? null : parseInt(homeCompetitor.score);
        const scoreB = awayCompetitor.score === 'null' || awayCompetitor.score === null || awayCompetitor.score === undefined ? null : parseInt(awayCompetitor.score);

        let homeScorers = extractScorers(comp, homeCompetitor.team.id);
        let awayScorers = extractScorers(comp, awayCompetitor.team.id);

        if (!match) {
          // Create new match in DB if it doesn't exist
          match = {
            id: `espn_${e.id}`,
            teamA: espnHome,
            teamB: espnAway,
            teamALogo: homeCompetitor.team.logo || null,
            teamBLogo: awayCompetitor.team.logo || null,
            date: new Date(e.date).toISOString(),
            scoreA: scoreA,
            scoreB: scoreB,
            status: newStatus,
            matchClock: matchClock,
            clockUpdatedAt: clockUpdatedAt,
            home_scorers: homeScorers,
            away_scorers: awayScorers,
            group: e.competitions[0].groups || '', 
            matchday: String(e.competitions[0].status?.period || '1'),
            stadiumName: e.competitions[0].venue ? e.competitions[0].venue.displayName : '',
            stadiumCity: e.competitions[0].venue && e.competitions[0].venue.address ? e.competitions[0].venue.address.city : '',
            stadiumCountry: e.competitions[0].venue && e.competitions[0].venue.address ? e.competitions[0].venue.address.country : '',
            stadiumCapacity: 0,
            league: league,
            createdAt: new Date().toISOString()
          };
          db.matches.push(match);
          dbChanged = true;
        } else {
          // Skip manually updated matches
          if (match.manuallyUpdated) {
            continue;
          }

          const isHomeTeamA = normalizeTeam(homeCompetitor.team.displayName) === normalizeTeam(match.teamA);
          const logoA = isHomeTeamA ? homeCompetitor.team.logo : awayCompetitor.team.logo;
          const logoB = isHomeTeamA ? awayCompetitor.team.logo : homeCompetitor.team.logo;

          const realTeamA = isHomeTeamA ? espnHome : espnAway;
          const realTeamB = isHomeTeamA ? espnAway : espnHome;

          const realScoreA = isHomeTeamA ? scoreA : scoreB;
          const realScoreB = isHomeTeamA ? scoreB : scoreA;
          
          let realHomeScorers = isHomeTeamA ? homeScorers : awayScorers;
          let realAwayScorers = isHomeTeamA ? awayScorers : homeScorers;

          // If the ESPN API returned "null" for scorers but we ALREADY have scorers in the database, keep them!
          if (realHomeScorers === 'null' && match.home_scorers && match.home_scorers !== 'null' && match.home_scorers !== '{}') {
            realHomeScorers = match.home_scorers;
          }
          if (realAwayScorers === 'null' && match.away_scorers && match.away_scorers !== 'null' && match.away_scorers !== '{}') {
            realAwayScorers = match.away_scorers;
          }

          const oldMatch = { ...match };
          if (
            match.status !== newStatus || 
            match.scoreA !== realScoreA || 
            match.scoreB !== realScoreB || 
            match.home_scorers !== realHomeScorers || 
            match.away_scorers !== realAwayScorers ||
            match.teamALogo !== (logoA || null) ||
            match.teamBLogo !== (logoB || null) ||
            match.teamA !== realTeamA ||
            match.teamB !== realTeamB ||
            match.matchClock !== matchClock ||
            match.clockUpdatedAt !== clockUpdatedAt
          ) {
            match.scoreA = realScoreA;
            match.scoreB = realScoreB;
            match.status = newStatus;
            match.matchClock = matchClock;
            match.clockUpdatedAt = clockUpdatedAt;
            match.home_scorers = realHomeScorers;
            match.away_scorers = realAwayScorers;
            match.teamALogo = logoA || null;
            match.teamBLogo = logoB || null;
            match.teamA = realTeamA;
            match.teamB = realTeamB;
            dbChanged = true;
            updatedMatchesToNotify.push({ oldMatch, newMatch: { ...match } });
          }
        }

        // Se o jogo acabou e ainda não computou os palpites localmente
        if (newStatus === 'finished' && db.guesses.some(g => g.matchId === match.id && g.points === null && (!g.status || g.status === 'approved'))) {
          db.guesses = db.guesses.map(guess => {
            if (guess.matchId === match.id) {
              if (guess.status === 'pending' || guess.status === 'rejected') {
                return { ...guess, points: null };
              }
              const isHomeTeamA = normalizeTeam(homeCompetitor.team.displayName) === normalizeTeam(match.teamA);
              const finalScoreA = isHomeTeamA ? scoreA : scoreB;
              const finalScoreB = isHomeTeamA ? scoreB : scoreA;
              const points = calculatePoints(guess.scoreA, guess.scoreB, finalScoreA, finalScoreB);
              return { ...guess, points };
            }
            return guess;
          });
          dbChanged = true;
        }
      }

      if (dbChanged) {
        await saveData(db);
        if (updatedMatchesToNotify.length > 0) {
          for (const item of updatedMatchesToNotify) {
            await checkAndSendPushNotificationsForMatch(item.oldMatch, item.newMatch);
          }
          await dispatchPendingNotifications();
        }
      }
    });

    lastSyncTimes[league] = now;
    console.log(`Database successfully synced with ESPN API for league: ${league}`);
  } catch (error) {
    console.error(`Error syncing with ESPN API for league ${league}:`, error);
  } finally {
    delete syncPromises[league];
    if (resolveSync) resolveSync();
  }
}



// 1. Auth Endpoint (Login / Cadastro simples)
app.post('/api/login', async (req, res) => {
  const { name, code } = req.body;

  if (!name || !code) {
    return res.status(400).json({ error: 'Nome e código são obrigatórios.' });
  }

  const trimmedName = name.trim();
  const upperCode = code.trim().toUpperCase();

  if (upperCode !== 'JOGAR' && upperCode !== 'ADMIN') {
    return res.status(401).json({ error: 'Código de acesso inválido.' });
  }

  const role = upperCode === 'ADMIN' ? 'admin' : 'player';

  try {
    let user;
    await runExclusive(async () => {
      const db = await getData();
      
      // Check if user already exists
      user = db.users.find(u => u.name.toLowerCase() === trimmedName.toLowerCase());
      
      if (!user) {
        // Add new user
        user = {
          id: generateId(),
          name: trimmedName,
          role: role,
          createdAt: new Date().toISOString()
        };
        db.users.push(user);
        await saveData(db);
      } else {
        // If user exists, optionally update role if logged in with admin code
        if (role === 'admin' && user.role !== 'admin') {
          user.role = 'admin';
          await saveData(db);
        }
      }
    });

    res.json({ id: user.id, name: user.name, role: user.role, notificationSettings: user.notificationSettings || null });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro no servidor durante o login.' });
  }
});

// 2. Obter todas as partidas e os palpites do usuário atual
app.get('/api/matches', async (req, res) => {
  const { userName, league = 'fifa.world' } = req.query;

  try {
    // Sync em background com waitUntil para o push completar antes do serverless encerrar.
    waitUntil(
      syncWithWorldCupAPI(league).catch(err => console.error('Background sync error:', err))
    );
    const db = await getData();
    // Filter matches for the selected league
    const matches = db.matches.filter(m => (m.league || 'fifa.world') === league);
    const guesses = db.guesses;

    // Map matches and attach current user's guess, and list of other guesses if match is locked
    const matchesWithGuesses = matches.map(match => {
      const isLocked = match.status === 'finished' || new Date(match.date) < new Date();
      
      const userGuess = guesses.find(g => g.matchId === match.id && g.userName.toLowerCase() === userName?.toString().toLowerCase());
      
      // Other users' guesses (visible only if match has started/finished, or if the user has already guessed, to avoid copying)
      // Actually, standard pool rule: show other guesses only if match is locked/started
      let otherGuesses = [];
      if (isLocked) {
        otherGuesses = guesses
          .filter(g => g.matchId === match.id && g.userName.toLowerCase() !== userName?.toString().toLowerCase() && (!g.status || g.status === 'approved'))
          .map(g => ({
            userName: g.userName,
            scoreA: g.scoreA,
            scoreB: g.scoreB,
            points: g.points
          }));
      }

      return {
        ...match,
        userGuess: userGuess ? { scoreA: userGuess.scoreA, scoreB: userGuess.scoreB, points: userGuess.points, status: userGuess.status } : null,
        otherGuesses
      };
    });

    res.json(matchesWithGuesses);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Erro ao buscar partidas.' });
  }
});

async function getEspnEventIdForMatch(match, league) {
  try {
    let urls = [];
    if (league === 'fifa.world') {
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200&lang=pt');
    } else if (league === 'bra.1') {
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?dates=20260401-20260815&limit=250&lang=pt');
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?dates=20260816-20261215&limit=250&lang=pt');
    } else if (league === 'uefa.champions') {
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard?dates=20250901-20260615&limit=250&lang=pt');
    } else if (league === 'eng.1') {
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=20250801-20260531&limit=250&lang=pt');
    } else if (league === 'esp.1') {
      urls.push('https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard?dates=20250801-20260531&limit=250&lang=pt');
    } else {
      urls.push(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=20260101-20261231&limit=300&lang=pt`);
    }

    const normA = normalizeTeam(match.teamA);
    const normB = normalizeTeam(match.teamB);

    for (const url of urls) {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        for (const e of data.events) {
          const comp = e.competitions?.[0];
          const home = comp?.competitors?.find(c => c.homeAway === 'home')?.team?.displayName;
          const away = comp?.competitors?.find(c => c.homeAway === 'away')?.team?.displayName;
          if (!home || !away) continue;

          const normHome = normalizeTeam(home);
          const normAway = normalizeTeam(away);

          if ((normHome === normA && normAway === normB) || (normHome === normB && normAway === normA)) {
            return e.id;
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to map match to ESPN event ID:', err);
  }
  return null;
}

// 2.5. Obter estatísticas e detalhes da partida (ESPN)
app.get('/api/matches/:id/stats', async (req, res) => {
  const { id } = req.params;
  const { league = 'fifa.world' } = req.query;

  try {
    let espnEventId = null;

    if (id.startsWith('espn_')) {
      espnEventId = id.substring(5);
    } else {
      const db = await getData();
      const match = db.matches.find(m => m.id === id);
      if (!match) {
        return res.status(404).json({ error: 'Partida não encontrada.' });
      }
      espnEventId = await getEspnEventIdForMatch(match, league);
    }

    if (!espnEventId) {
      return res.status(404).json({ error: 'Estatísticas não disponíveis para esta partida.' });
    }

    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/summary?event=${espnEventId}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      return res.status(500).json({ error: 'Erro ao obter dados do ESPN.' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Failed to fetch stats for match ${id}:`, error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas da partida.' });
  }
});


// 2.6. Obter classificação geral da liga (ESPN)
app.get('/api/standings', async (req, res) => {
  const { league = 'fifa.world' } = req.query;

  try {
    const url = `https://site.api.espn.com/apis/v2/sports/soccer/${league}/standings`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      return res.status(500).json({ error: 'Erro ao obter dados de classificação do ESPN.' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Failed to fetch standings for league ${league}:`, error);
    res.status(500).json({ error: 'Erro ao buscar classificação da liga.' });
  }
});


// 3. Cadastrar nova partida (Admin)
app.post('/api/matches', async (req, res) => {
  const { teamA, teamB, date, requesterRole, league = 'fifa.world' } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem cadastrar jogos.' });
  }

  if (!teamA || !teamB || !date) {
    return res.status(400).json({ error: 'Times A e B e data são obrigatórios.' });
  }

  try {
    const translatedA = translateTeam(teamA.trim());
    const translatedB = translateTeam(teamB.trim());

    // Fetch logos concurrently
    const [logoA, logoB] = await Promise.all([
      fetchTeamLogo(translatedA).catch(() => null),
      fetchTeamLogo(translatedB).catch(() => null)
    ]);

    const newMatch = {
      id: generateId(),
      teamA: translatedA,
      teamB: translatedB,
      teamALogo: logoA || null,
      teamBLogo: logoB || null,
      date: new Date(date).toISOString(),
      scoreA: null,
      scoreB: null,
      status: 'pending', // pending, finished
      league: league,
      createdAt: new Date().toISOString()
    };

    await runExclusive(async () => {
      const db = await getData();
      db.matches.push(newMatch);
      await saveData(db);
    });

    res.status(201).json(newMatch);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Erro ao criar partida.' });
  }
});

// 4. Registrar palpite
app.post('/api/guesses', async (req, res) => {
  const { userName, matchId, scoreA, scoreB, requesterRole } = req.body;

  if (!userName || !matchId || scoreA === undefined || scoreB === undefined) {
    return res.status(400).json({ error: 'Palpite incompleto.' });
  }

  try {
    let resultGuess;
    let errorResponse = null;

    await runExclusive(async () => {
      const db = await getData();
      const match = db.matches.find(m => m.id === matchId);

      if (!match) {
        errorResponse = { status: 404, error: 'Partida não encontrada.' };
        return;
      }

      // Check if match already finished
      if (match.status === 'finished' && requesterRole !== 'admin') {
        errorResponse = { status: 400, error: 'As apostas para este jogo já estão encerradas.' };
        return;
      }

      const hasStarted = new Date(match.date) < new Date() || match.status === 'live';
      const status = hasStarted ? (requesterRole === 'admin' ? 'approved' : 'pending') : 'approved';
      const guessClock = hasStarted ? (match.matchClock || '0\'') : null;
      const matchScoreAtGuess = (hasStarted && match.scoreA !== null && match.scoreB !== null) ? `${match.scoreA}-${match.scoreB}` : null;

      // Find or create guess
      let guess = db.guesses.find(g => g.matchId === matchId && g.userName.toLowerCase() === userName.toLowerCase());

      if (guess) {
        // Durante o jogo, não permite alterar palpite existente (apenas admin)
        if (hasStarted && requesterRole !== 'admin') {
          errorResponse = { status: 400, error: 'Você já palpitou neste jogo. Não é possível alterar o palpite com a partida em andamento.' };
          return;
        }

        guess.scoreA = parseInt(scoreA);
        guess.scoreB = parseInt(scoreB);
        guess.updatedAt = new Date().toISOString();
        guess.status = status;
        if (hasStarted) {
          guess.guessClock = guessClock;
          guess.matchScoreAtGuess = matchScoreAtGuess;
        } else {
          delete guess.guessClock;
          delete guess.matchScoreAtGuess;
        }
      } else {
        guess = {
          id: `${userName.toLowerCase()}_${matchId}`,
          userName: userName.trim(),
          matchId,
          scoreA: parseInt(scoreA),
          scoreB: parseInt(scoreB),
          points: null,
          createdAt: new Date().toISOString(),
          status
        };
        if (hasStarted) {
          guess.guessClock = guessClock;
          guess.matchScoreAtGuess = matchScoreAtGuess;
        }
        db.guesses.push(guess);
      }

      // Se o jogo já acabou, calcula os pontos do palpite imediatamente (apenas se aprovado)
      if (match.status === 'finished' && guess.status === 'approved') {
        guess.points = calculatePoints(guess.scoreA, guess.scoreB, match.scoreA, match.scoreB);
      } else {
        guess.points = null;
      }

      await saveData(db);
      resultGuess = guess;
    });

    if (errorResponse) {
      return res.status(errorResponse.status).json({ error: errorResponse.error });
    }

    res.json(resultGuess);
  } catch (error) {
    console.error('Error saving guess:', error);
    res.status(500).json({ error: 'Erro ao salvar palpite.' });
  }
});

// 5. Definir placar oficial do jogo e calcular pontos (Admin)
app.post('/api/results', async (req, res) => {
  const { matchId, scoreA, scoreB, requesterRole } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem inserir resultados.' });
  }

  if (scoreA === undefined || scoreB === undefined) {
    return res.status(400).json({ error: 'Placares inválidos.' });
  }

  const finalScoreA = parseInt(scoreA);
  const finalScoreB = parseInt(scoreB);

  try {
    let resultMatch;
    let errorResponse = null;

    let oldMatchForPush = null;
    let newMatchForPush = null;

    await runExclusive(async () => {
      const db = await getData();
      const match = db.matches.find(m => m.id === matchId);

      if (!match) {
        errorResponse = { status: 404, error: 'Partida não encontrada.' };
        return;
      }

      oldMatchForPush = { ...match };

      // Update match result
      match.scoreA = finalScoreA;
      match.scoreB = finalScoreB;
      match.status = 'finished';
      match.resultUpdatedAt = new Date().toISOString();
      match.manuallyUpdated = true;

      // Calculate points for all guesses for this match (only approved ones)
      db.guesses = db.guesses.map(guess => {
        if (guess.matchId === matchId) {
          if (guess.status === 'pending' || guess.status === 'rejected') {
            return { ...guess, points: null };
          }
          const points = calculatePoints(guess.scoreA, guess.scoreB, finalScoreA, finalScoreB);
          return {
            ...guess,
            points
          };
        }
        return guess;
      });

      await saveData(db);
      resultMatch = match;
      newMatchForPush = { ...match };
    });

    if (oldMatchForPush && newMatchForPush) {
      await checkAndSendPushNotificationsForMatch(oldMatchForPush, newMatchForPush);
      await dispatchPendingNotifications();
    }

    if (errorResponse) {
      return res.status(errorResponse.status).json({ error: errorResponse.error });
    }

    res.json({ message: 'Resultado registrado e pontos calculados com sucesso!', match: resultMatch });
  } catch (error) {
    console.error('Error recording result:', error);
    res.status(500).json({ error: 'Erro ao registrar resultado.' });
  }
});

// 5.1 Reativar Sincronização Automática (Admin)
app.post('/api/admin/matches/unlock-sync', async (req, res) => {
  const { matchId, requesterRole } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem reativar a sincronização.' });
  }

  try {
    let resultMatch;
    let errorResponse = null;

    await runExclusive(async () => {
      const db = await getData();
      const match = db.matches.find(m => m.id === matchId);

      if (!match) {
        errorResponse = { status: 404, error: 'Partida não encontrada.' };
        return;
      }

      match.manuallyUpdated = false;
      await saveData(db);
      resultMatch = match;
    });

    if (errorResponse) {
      return res.status(errorResponse.status).json({ error: errorResponse.error });
    }

    res.json({ message: 'Sincronização automática reativada!', match: resultMatch });
  } catch (error) {
    console.error('Error unlocking sync:', error);
    res.status(500).json({ error: 'Erro ao reativar sincronização.' });
  }
});

// 6. Obter Ranking de Classificação
app.get('/api/ranking', async (req, res) => {
  const { league = 'fifa.world' } = req.query;

  try {
    const db = await getData();
    const users = db.users;
    const guesses = db.guesses;

    // Filter matches that belong to this league
    const leagueMatches = db.matches.filter(m => (m.league || 'fifa.world') === league);
    const leagueMatchIds = new Set(leagueMatches.map(m => m.id));

    // Calculate scores for each user
    const ranking = users.map(user => {
      const userGuesses = guesses.filter(g => 
        g.userName.toLowerCase() === user.name.toLowerCase() && 
        g.points !== null &&
        (!g.status || g.status === 'approved') &&
        leagueMatchIds.has(g.matchId)
      );
      
      // Determine pointsAdjustment for this league
      let pointsAdjustment = 0;
      if (user.pointsAdjustment !== undefined) {
        if (typeof user.pointsAdjustment === 'object' && user.pointsAdjustment !== null) {
          pointsAdjustment = parseInt(user.pointsAdjustment[league]) || 0;
        } else if (league === 'fifa.world') {
          // Backward compatibility for when it was a single number
          pointsAdjustment = parseInt(user.pointsAdjustment) || 0;
        }
      }

      const totalPoints = userGuesses.reduce((sum, g) => sum + g.points, 0);
      const exactScores = userGuesses.filter(g => g.points === 25).length;
      const winnerDiff = userGuesses.filter(g => g.points === 18).length;
      const winnerGoals = userGuesses.filter(g => g.points === 15 || g.points === 12).length;
      const winnerOnly = userGuesses.filter(g => g.points === 10).length;
      const totalGuesses = guesses.filter(g => 
        g.userName.toLowerCase() === user.name.toLowerCase() &&
        (!g.status || g.status === 'approved') &&
        leagueMatchIds.has(g.matchId)
      ).length;

      // Live projection
      let livePoints = 0;
      let projectedExactScores = 0;
      let projectedWinnerDiff = 0;
      let projectedWinnerGoals = 0;
      let projectedWinnerOnly = 0;

      const liveMatches = leagueMatches.filter(m => m.status === 'live');
      liveMatches.forEach(match => {
        const guess = guesses.find(g => g.matchId === match.id && g.userName.toLowerCase() === user.name.toLowerCase());
        if (guess && (!guess.status || guess.status === 'approved') && match.scoreA !== null && match.scoreB !== null) {
          const pts = calculatePoints(guess.scoreA, guess.scoreB, match.scoreA, match.scoreB);
          livePoints += pts;
          if (pts === 25) projectedExactScores++;
          else if (pts === 18) projectedWinnerDiff++;
          else if (pts === 15 || pts === 12) projectedWinnerGoals++;
          else if (pts === 10) projectedWinnerOnly++;
        }
      });

      return {
        userId: user.id,
        userName: user.name,
        totalPoints: totalPoints + pointsAdjustment,
        projectedPoints: totalPoints + pointsAdjustment + livePoints,
        exactScores,
        winnerDiff,
        winnerGoals,
        winnerOnly,
        projectedExactScores: exactScores + projectedExactScores,
        projectedWinnerDiff: winnerDiff + projectedWinnerDiff,
        projectedWinnerGoals: winnerGoals + projectedWinnerGoals,
        projectedWinnerOnly: winnerOnly + projectedWinnerOnly,
        totalGuesses,
        pointsAdjustment
      };
    });

    // Sort ranking: Points (desc), Exact Scores (desc), Total Guesses (desc - reward activity)
    ranking.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.exactScores !== a.exactScores) {
        return b.exactScores - a.exactScores;
      }
      return b.totalGuesses - a.totalGuesses;
    });

    res.json(ranking);
  } catch (error) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking.' });
  }
});

// 6.1 Ajustar Pontuação Manualmente (Admin)
app.post('/api/users/adjust-points', async (req, res) => {
  const { userId, pointsAdjustment, league = 'fifa.world', requesterRole } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem ajustar pontuações.' });
  }

  if (userId === undefined || pointsAdjustment === undefined) {
    return res.status(400).json({ error: 'Dados incompletos para ajuste de pontos.' });
  }

  try {
    let resultUser;
    let errorResponse = null;

    await runExclusive(async () => {
      const db = await getData();
      const user = db.users.find(u => u.id === userId);

      if (!user) {
        errorResponse = { status: 404, error: 'Usuário não encontrado.' };
        return;
      }

      // Convert old single-number pointsAdjustment to object if needed
      if (!user.pointsAdjustment || typeof user.pointsAdjustment !== 'object') {
        const oldAdj = typeof user.pointsAdjustment === 'number' ? user.pointsAdjustment : 0;
        user.pointsAdjustment = { 'fifa.world': oldAdj };
      }

      user.pointsAdjustment[league] = parseInt(pointsAdjustment) || 0;
      await saveData(db);
      resultUser = user;
    });

    if (errorResponse) {
      return res.status(errorResponse.status).json({ error: errorResponse.error });
    }

    res.json({ message: 'Pontuação ajustada com sucesso!', user: resultUser });
  } catch (error) {
    console.error('Error adjusting points:', error);
    res.status(500).json({ error: 'Erro ao ajustar pontuação.' });
  }
});

// 6.1.1 Obter palpites pendentes de aprovação (Admin)
app.get('/api/admin/guesses/pending', async (req, res) => {
  const { league = 'fifa.world', requesterRole } = req.query;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem visualizar palpites pendentes.' });
  }

  try {
    const db = await getData();
    const matches = db.matches.filter(m => (m.league || 'fifa.world') === league);
    const matchIds = new Set(matches.map(m => m.id));

    const pendingGuesses = db.guesses
      .filter(g => g.status === 'pending' && matchIds.has(g.matchId))
      .map(g => {
        const match = matches.find(m => m.id === g.matchId);
        return {
          id: g.id,
          userName: g.userName,
          matchId: g.matchId,
          scoreA: g.scoreA,
          scoreB: g.scoreB,
          guessClock: g.guessClock,
          matchScoreAtGuess: g.matchScoreAtGuess,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
          teamA: match ? match.teamA : '',
          teamB: match ? match.teamB : '',
          teamALogo: match ? match.teamALogo : null,
          teamBLogo: match ? match.teamBLogo : null
        };
      });

    res.json(pendingGuesses);
  } catch (error) {
    console.error('Error fetching pending guesses:', error);
    res.status(500).json({ error: 'Erro ao buscar palpites pendentes.' });
  }
});

// 6.1.2 Aprovar palpite (Admin)
app.post('/api/admin/guesses/approve', async (req, res) => {
  const { guessId, requesterRole } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem aprovar palpites.' });
  }

  try {
    let resultGuess;
    let errorResponse = null;

    await runExclusive(async () => {
      const db = await getData();
      const guess = db.guesses.find(g => g.id === guessId);

      if (!guess) {
        errorResponse = { status: 404, error: 'Palpite não encontrado.' };
        return;
      }

      const match = db.matches.find(m => m.id === guess.matchId);
      guess.status = 'approved';

      // If the match is already finished, calculate points immediately
      if (match && match.status === 'finished') {
        guess.points = calculatePoints(guess.scoreA, guess.scoreB, match.scoreA, match.scoreB);
      } else {
        guess.points = null;
      }

      await saveData(db);
      resultGuess = guess;
    });

    if (errorResponse) {
      return res.status(errorResponse.status).json({ error: errorResponse.error });
    }

    res.json({ message: 'Palpite aprovado com sucesso!', guess: resultGuess });
  } catch (error) {
    console.error('Error approving guess:', error);
    res.status(500).json({ error: 'Erro ao aprovar palpite.' });
  }
});

// 6.1.3 Rejeitar palpite (Admin)
app.post('/api/admin/guesses/reject', async (req, res) => {
  const { guessId, requesterRole } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem rejeitar palpites.' });
  }

  try {
    let resultGuess;
    let errorResponse = null;

    await runExclusive(async () => {
      const db = await getData();
      const guess = db.guesses.find(g => g.id === guessId);

      if (!guess) {
        errorResponse = { status: 404, error: 'Palpite não encontrado.' };
        return;
      }

      guess.status = 'rejected';
      guess.points = null;

      await saveData(db);
      resultGuess = guess;
    });

    if (errorResponse) {
      return res.status(errorResponse.status).json({ error: errorResponse.error });
    }

    res.json({ message: 'Palpite rejeitado com sucesso!', guess: resultGuess });
  } catch (error) {
    console.error('Error rejecting guess:', error);
    res.status(500).json({ error: 'Erro ao rejeitar palpite.' });
  }
});

// 6.2 Recalcular Todos os Pontos do Bolão (Admin)
app.post('/api/admin/recalculate', async (req, res) => {
  const { requesterRole, league = 'fifa.world' } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem recalcular os pontos.' });
  }

  try {
    let count = 0;
    await runExclusive(async () => {
      const db = await getData();

      // Filter matches that belong to this league
      const leagueMatchIds = new Set(db.matches.filter(m => (m.league || 'fifa.world') === league).map(m => m.id));

      db.guesses = db.guesses.map(guess => {
        // Skip guesses not belonging to the league
        if (!leagueMatchIds.has(guess.matchId)) {
          return guess;
        }

        const match = db.matches.find(m => m.id === guess.matchId);
        if (!match) {
          return guess;
        }

        if (guess.status === 'pending' || guess.status === 'rejected') {
          const oldPoints = guess.points;
          if (oldPoints !== null) {
            count++;
          }
          return { ...guess, points: null };
        }

        if (match.status === 'finished') {
          const points = calculatePoints(guess.scoreA, guess.scoreB, match.scoreA, match.scoreB);
          if (guess.points !== points) {
            count++;
          }
          return { ...guess, points };
        } else {
          // Para jogos não encerrados, a pontuação oficial deve ser nula
          const oldPoints = guess.points;
          if (oldPoints !== null) {
            count++;
          }
          return { ...guess, points: null };
        }
      });

      await saveData(db);
    });

    res.json({ message: `Recálculo concluído com sucesso! ${count} palpites atualizados para a liga ${league}.` });
  } catch (error) {
    console.error('Error recalculating points:', error);
    res.status(500).json({ error: 'Erro ao recalcular pontos.' });
  }
});

// 7. Backup - Exportar / Importar dados completos (Admin)
app.get('/api/data/export', async (req, res) => {
  const { requesterRole } = req.query;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem exportar dados.' });
  }

  try {
    const db = await getData();
    res.json(db);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao exportar dados.' });
  }
});

app.post('/api/data/import', async (req, res) => {
  const { data, requesterRole } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem importar dados.' });
  }

  if (!data || !data.matches || !data.guesses || !data.users) {
    return res.status(400).json({ error: 'Formato de dados de backup inválido.' });
  }

  try {
    await runExclusive(async () => {
      await saveData(data);
    });
    res.json({ message: 'Dados importados com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao importar dados.' });
  }
});

// 8. Importar Tabela de Campeonatos (Admin)
app.post('/api/copa2026/sync', async (req, res) => {
  const { requesterRole, league = 'fifa.world' } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem carregar jogos.' });
  }

  try {
    lastSyncTimes[league] = 0; // Reseta cache para forçar a busca na API pública agora
    await syncWithWorldCupAPI(league);
    const db = await getData();
    const count = db.matches.filter(m => (m.league || 'fifa.world') === league).length;
    res.json({ message: `Jogos sincronizados com sucesso! Total no sistema para esta liga: ${count} partidas.` });
  } catch (error) {
    console.error('Error manual sync matches:', error);
    res.status(500).json({ error: 'Erro ao sincronizar jogos.' });
  }
});

// 9. Simular Progresso dos Jogos (Admin - Testes e Demonstrações)
app.post('/api/copa2026/simulate-live', async (req, res) => {
  const { requesterRole, league = 'fifa.world' } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem simular jogos.' });
  }

  try {
    let message = '';
    let resultMatches = [];
    let errorResponse = null;

    let oldMatchForPush = null;
    let newMatchForPush = null;

    await runExclusive(async () => {
      const db = await getData();
      const leagueMatches = db.matches.filter(m => (m.league || 'fifa.world') === league);
      
      if (leagueMatches.length === 0) {
        errorResponse = { status: 400, error: `Nenhum jogo cadastrado para simular na liga ${league}.` };
        return;
      }

      let changed = false;

      // Procura por um jogo ao vivo para atualizar nesta liga
      let liveMatch = leagueMatches.find(m => m.status === 'live');

      if (liveMatch) {
        oldMatchForPush = { ...liveMatch };
        // 50% de chance de gol, 50% de encerrar a partida
        if (Math.random() > 0.5) {
          const isTeamA = Math.random() > 0.5;
          if (isTeamA) {
            liveMatch.scoreA = (liveMatch.scoreA || 0) + 1;
          } else {
            liveMatch.scoreB = (liveMatch.scoreB || 0) + 1;
          }
          message = `GOL! Placar atualizado: ${liveMatch.teamA} ${liveMatch.scoreA} x ${liveMatch.scoreB} ${liveMatch.teamB}`;
        } else {
          liveMatch.status = 'finished';
          message = `FIM DE JOGO! Placar oficial: ${liveMatch.teamA} ${liveMatch.scoreA} x ${liveMatch.scoreB} ${liveMatch.teamB}. Pontuações calculadas!`;

          // Calcula pontos para todos os palpites (apenas os aprovados)
          db.guesses = db.guesses.map(guess => {
            if (guess.matchId === liveMatch.id) {
              if (guess.status === 'pending' || guess.status === 'rejected') {
                return { ...guess, points: null };
              }
              const points = calculatePoints(guess.scoreA, guess.scoreB, liveMatch.scoreA, liveMatch.scoreB);
              return { ...guess, points };
            }
            return guess;
          });
        }
        newMatchForPush = { ...liveMatch };
        changed = true;
      } else {
        // Nenhum jogo ao vivo, inicia um pendente
        let pendingMatch = leagueMatches.find(m => m.status === 'pending');
        if (pendingMatch) {
          oldMatchForPush = { ...pendingMatch };
          pendingMatch.status = 'live';
          pendingMatch.scoreA = 0;
          pendingMatch.scoreB = 0;
          message = `BOLA ROLANDO! O jogo ${pendingMatch.teamA} vs ${pendingMatch.teamB} começou e está AO VIVO!`;
          newMatchForPush = { ...pendingMatch };
          changed = true;
        } else {
          message = 'Todos os jogos cadastrados já estão encerrados!';
        }
      }

      if (changed) {
        await saveData(db);
      }
      resultMatches = db.matches.filter(m => (m.league || 'fifa.world') === league);
    });

    if (oldMatchForPush && newMatchForPush) {
      await checkAndSendPushNotificationsForMatch(oldMatchForPush, newMatchForPush);
      await dispatchPendingNotifications();
    }

    if (errorResponse) {
      return res.status(errorResponse.status).json({ error: errorResponse.error });
    }

    res.json({ message, matches: resultMatches });
  } catch (error) {
    console.error('Error simulating live match:', error);
    res.status(500).json({ error: 'Erro ao simular progresso do jogo.' });
  }
});

// --- WEB PUSH CONFIGURATION & ROUTING ---
let vapidPublic = '';
let vapidPrivate = '';

async function initVapidKeys() {
  const db = await getData();
  if (!db.vapidKeys) {
    const keys = webpush.generateVAPIDKeys();
    db.vapidKeys = keys;
    await saveData(db);
    console.log('Generated new VAPID keys and saved to DB.');
  }
  vapidPublic = db.vapidKeys.publicKey;
  vapidPrivate = db.vapidKeys.privateKey;
  
  webpush.setVapidDetails(
    'mailto:admin@bolao-futebol.local',
    vapidPublic,
    vapidPrivate
  );
  console.log('Web Push VAPID keys set successfully.');
}

// Initialize VAPID keys
initVapidKeys().catch(console.error);

// Send Web Push Notification to a user
async function sendPushNotification(userName, payload) {
  const db = await getData();
  if (!db.pushSubscriptions || db.pushSubscriptions.length === 0) {
    return { sent: 0, failed: 0, total: 0, errors: [] };
  }
  
  const userSubs = db.pushSubscriptions.filter(s => s.userName.toLowerCase() === userName.toLowerCase());
  if (userSubs.length === 0) {
    return { sent: 0, failed: 0, total: 0, errors: [] };
  }

  const payloadString = JSON.stringify(payload);
  const deadEndpoints = [];
  const errors = [];
  let sent = 0;
  let failed = 0;
  
  const promises = userSubs.map(async (sub) => {
    try {
      await webpush.sendNotification(sub.subscription, payloadString);
      sent++;
    } catch (err) {
      failed++;
      if (err.statusCode === 410 || err.statusCode === 404) {
        deadEndpoints.push(sub.subscription.endpoint);
      } else {
        const endpointHint = sub.subscription.endpoint.slice(-12);
        errors.push({ endpoint: endpointHint, message: err.message || String(err), statusCode: err.statusCode });
        console.error(`Error sending push to ${userName} (${endpointHint}):`, err.message || err);
      }
    }
  });
  
  await Promise.all(promises);
  
  if (deadEndpoints.length > 0) {
    await runExclusive(async () => {
      const dbUpdate = await getData();
      dbUpdate.pushSubscriptions = dbUpdate.pushSubscriptions.filter(
        s => !deadEndpoints.includes(s.subscription.endpoint)
      );
      await saveData(dbUpdate);
      console.log(`Cleaned up ${deadEndpoints.length} expired push subscriptions.`);
    });
  }

  return { sent, failed, total: userSubs.length, errors };
}

async function enqueuePushNotification(userName, payload, dedupeKey = null) {
  let added = false;
  await runExclusive(async () => {
    const db = await getData();
    if (!db.pendingPushNotifications) {
      db.pendingPushNotifications = [];
    }

    if (dedupeKey && db.pendingPushNotifications.some(p => p.dedupeKey === dedupeKey)) {
      return;
    }

    db.pendingPushNotifications.push({
      id: generateId(),
      userName,
      payload,
      dedupeKey,
      createdAt: new Date().toISOString(),
      attempts: 0
    });
    added = true;
    await saveData(db);
  });
  return added;
}

async function dispatchPendingNotifications(userName = null) {
  if (!vapidPublic) {
    await initVapidKeys();
  }

  const db = await getData();
  let pending = [...(db.pendingPushNotifications || [])];
  if (userName) {
    const target = userName.toLowerCase();
    pending = pending.filter(p => p.userName.toLowerCase() === target);
  }

  if (pending.length === 0) {
    return { dispatched: 0, failed: 0, remaining: 0, processed: 0 };
  }

  let dispatched = 0;
  let failed = 0;
  const dispatchedIds = new Set();
  const stillPending = [...(db.pendingPushNotifications || [])];

  for (const item of pending) {
    const result = await sendPushNotification(item.userName, item.payload);
    const idx = stillPending.findIndex(p => p.id === item.id);
    if (idx === -1) continue;

    if (result.sent > 0) {
      dispatched++;
      dispatchedIds.add(item.id);
      stillPending.splice(idx, 1);
      continue;
    }

    stillPending[idx] = {
      ...stillPending[idx],
      attempts: (stillPending[idx].attempts || 0) + 1,
      lastAttemptAt: new Date().toISOString()
    };

    const tooOld = Date.now() - new Date(item.createdAt).getTime() > 24 * 60 * 60 * 1000;
    if (stillPending[idx].attempts >= 10 || tooOld) {
      stillPending.splice(idx, 1);
    }
    failed++;
  }

  await runExclusive(async () => {
    const dbUpdate = await getData();
    dbUpdate.pendingPushNotifications = stillPending;
    await saveData(dbUpdate);
  });

  return {
    dispatched,
    failed,
    remaining: stillPending.length,
    processed: pending.length
  };
}

// Compare old and new match and queue goal/start/finish alerts
async function checkAndSendPushNotificationsForMatch(oldMatch, newMatch) {
  if (!oldMatch) return 0;

  const scoreAChanged = newMatch.scoreA !== oldMatch.scoreA;
  const scoreBChanged = newMatch.scoreB !== oldMatch.scoreB;
  const statusChanged = newMatch.status !== oldMatch.status;

  if (!scoreAChanged && !scoreBChanged && !statusChanged) return 0;

  const db = await getData();
  const users = db.users || [];
  const subscribedUsers = new Set(
    (db.pushSubscriptions || []).map(s => s.userName.toLowerCase())
  );

  let queued = 0;

  for (const user of users) {
    if (!subscribedUsers.has(user.name.toLowerCase())) continue;

    const settings = user.notificationSettings || {
      goals: true,
      matchStarted: true,
      matchFinished: true
    };

    if (settings.goals && newMatch.status === 'live' && (scoreAChanged || scoreBChanged)) {
      const goalsA = (newMatch.scoreA || 0) - (oldMatch.scoreA || 0);
      const goalsB = (newMatch.scoreB || 0) - (oldMatch.scoreB || 0);

      let title = "⚽ GOL!";
      let body = "";
      if (goalsA > 0) {
        body = `Gol do ${newMatch.teamA}! Placar: ${newMatch.teamA} ${newMatch.scoreA} x ${newMatch.scoreB} ${newMatch.teamB}`;
      } else if (goalsB > 0) {
        body = `Gol do ${newMatch.teamB}! Placar: ${newMatch.teamA} ${newMatch.scoreA} x ${newMatch.scoreB} ${newMatch.teamB}`;
      } else {
        title = "🖥️ Placar Alterado (VAR)";
        body = `Placar atualizado: ${newMatch.teamA} ${newMatch.scoreA} x ${newMatch.scoreB} ${newMatch.teamB}`;
      }

      const added = await enqueuePushNotification(
        user.name,
        { title, body, url: `/?match=${newMatch.id}` },
        `match:${newMatch.id}:score:${newMatch.scoreA}-${newMatch.scoreB}:${user.name.toLowerCase()}`
      );
      if (added) queued++;
    }

    if (settings.matchStarted && statusChanged && newMatch.status === 'live') {
      const added = await enqueuePushNotification(
        user.name,
        {
          title: "⏱️ Bola Rolando!",
          body: `Começou: ${newMatch.teamA} vs ${newMatch.teamB}`,
          url: `/?match=${newMatch.id}`
        },
        `match:${newMatch.id}:start:${user.name.toLowerCase()}`
      );
      if (added) queued++;
    }

    if (settings.matchFinished && statusChanged && newMatch.status === 'finished') {
      const added = await enqueuePushNotification(
        user.name,
        {
          title: "🏁 Fim de Jogo!",
          body: `Resultado Final: ${newMatch.teamA} ${newMatch.scoreA} x ${newMatch.scoreB} ${newMatch.teamB}`,
          url: `/?match=${newMatch.id}`
        },
        `match:${newMatch.id}:finish:${newMatch.scoreA}-${newMatch.scoreB}:${user.name.toLowerCase()}`
      );
      if (added) queued++;
    }
  }

  return queued;
}

// Endpoints
app.get('/api/notifications/vapid-public-key', async (req, res) => {
  if (!vapidPublic) {
    await initVapidKeys();
  }
  res.json({ publicKey: vapidPublic });
});

app.post('/api/notifications/subscribe', async (req, res) => {
  const { subscription, userName } = req.body;
  if (!subscription || !userName) {
    return res.status(400).json({ error: 'Faltam assinatura ou usuário.' });
  }
  try {
    await runExclusive(async () => {
      const db = await getData();
      if (!db.pushSubscriptions) {
        db.pushSubscriptions = [];
      }
      
      const idx = db.pushSubscriptions.findIndex(s => s.subscription.endpoint === subscription.endpoint);
      if (idx >= 0) {
        db.pushSubscriptions[idx].userName = userName;
      } else {
        db.pushSubscriptions.push({ userName, subscription });
      }
      await saveData(db);
    });
    waitUntil(
      dispatchPendingNotifications(userName).catch(err =>
        console.error(`Failed to dispatch pending notifications for ${userName}:`, err)
      )
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    res.status(500).json({ error: 'Erro ao registrar assinatura.' });
  }
});

app.post('/api/notifications/test', async (req, res) => {
  const { userName, endpoint } = req.body;
  if (!userName) {
    return res.status(400).json({ error: 'Falta o nome de usuário.' });
  }
  try {
    const db = await getData();
    const userSubs = (db.pushSubscriptions || []).filter(
      s => s.userName.toLowerCase() === userName.toLowerCase()
    );
    const thisDeviceRegistered = endpoint
      ? userSubs.some(s => s.subscription.endpoint === endpoint)
      : false;

    if (userSubs.length === 0) {
      return res.status(404).json({
        error: 'Nenhum dispositivo registrado para este usuário. Use "Sincronizar Dispositivo" neste aparelho.',
        totalDevices: 0,
        thisDeviceRegistered: false
      });
    }

    const result = await sendPushNotification(userName, {
      title: '🔔 Teste de Notificação!',
      body: 'Parabéns! Suas notificações push do Bolão de Futebol estão configuradas e funcionando corretamente.',
      url: '/'
    });

    res.json({
      success: result.sent > 0,
      ...result,
      totalDevices: userSubs.length,
      thisDeviceRegistered
    });
  } catch (err) {
    console.error('Failed to send test push:', err);
    res.status(500).json({ error: 'Erro ao enviar notificação de teste.' });
  }
});

app.get('/api/notifications/device-status', async (req, res) => {
  const { userName, endpoint } = req.query;
  if (!userName || !endpoint) {
    return res.status(400).json({ error: 'Faltam userName ou endpoint.' });
  }
  try {
    const db = await getData();
    const userSubs = (db.pushSubscriptions || []).filter(
      s => s.userName.toLowerCase() === userName.toLowerCase()
    );
    const thisDeviceRegistered = userSubs.some(s => s.subscription.endpoint === endpoint);
    res.json({
      totalDevices: userSubs.length,
      thisDeviceRegistered
    });
  } catch (err) {
    console.error('Failed to check device status:', err);
    res.status(500).json({ error: 'Erro ao verificar dispositivo.' });
  }
});

app.post('/api/users/settings', async (req, res) => {
  const { userName, settings } = req.body;
  if (!userName || !settings) {
    return res.status(400).json({ error: 'Faltam dados de configurações.' });
  }
  try {
    await runExclusive(async () => {
      const db = await getData();
      const user = db.users.find(u => u.name.toLowerCase() === userName.toLowerCase());
      if (user) {
        user.notificationSettings = settings;
        await saveData(db);
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user settings:', error);
    res.status(500).json({ error: 'Erro ao salvar configurações.' });
  }
});

app.get('/api/sync-cron', async (req, res) => {
  if (!isCronAuthorized(req)) {
    console.log('Unauthorized cron access attempt.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Cron sync triggered.');

  try {
    const { getLock, releaseLock } = await import('./db.js');
    const lockAcquired = await getLock('cron_active', 50);
    if (!lockAcquired) {
      console.log('Another cron instance is already running. Skipping execution.');
      return res.status(200).json({ message: 'Another cron instance is running.' });
    }

    const result = await runServerSideSyncCycle();

    await releaseLock('cron_active');
    console.log('Cron sync complete.', result);
    return res.status(200).json({ message: 'Sync complete. Notifications queued.', ...result });
  } catch (error) {
    console.error('Error in cron handler:', error);
    try {
      const { releaseLock } = await import('./db.js');
      await releaseLock('cron_active');
    } catch (lockErr) {
      console.error('Failed to release lock in error handler:', lockErr);
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/notifications/dispatch-pending', async (req, res) => {
  if (!isCronAuthorized(req)) {
    console.log('Unauthorized dispatch access attempt.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { getLock, releaseLock } = await import('./db.js');
    const lockAcquired = await getLock('push_dispatch_active', 50);
    if (!lockAcquired) {
      return res.status(200).json({ message: 'Another dispatch is already running.' });
    }

    const result = await dispatchPendingNotifications();
    await releaseLock('push_dispatch_active');

    console.log('Pending notifications dispatched.', result);
    return res.status(200).json({
      message: 'Pending notifications processed.',
      ...result
    });
  } catch (error) {
    console.error('Error dispatching pending notifications:', error);
    try {
      const { releaseLock } = await import('./db.js');
      await releaseLock('push_dispatch_active');
    } catch (lockErr) {
      console.error('Failed to release dispatch lock:', lockErr);
    }
    return res.status(500).json({ error: 'Erro ao enviar notificações pendentes.' });
  }
});

// Helper do scheduler para verificar palpites pendentes
async function checkAndSendPushReminders() {
  try {
    const db = await getData();
    const now = Date.now();
    
    if (!db.matches || db.matches.length === 0) return;
    
    if (!db.sentPushReminders) {
      db.sentPushReminders = {};
    }
    
    let dbChanged = false;
    
    for (const match of db.matches) {
      if (match.status !== 'pending') continue;
      
      const matchTime = new Date(match.date).getTime();
      const diffMs = matchTime - now;
      const diffMins = diffMs / 60000;
      
      if (diffMins <= 0) continue;
      
      const matchId = match.id;
      if (!db.sentPushReminders[matchId]) {
        db.sentPushReminders[matchId] = {};
      }
      
      const thresholds = [
        { time: 60, key: 'remind1h', label: '1 hora' },
        { time: 30, key: 'remind30m', label: '30 minutos' },
        { time: 15, key: 'remind15m', label: '15 minutos' },
        { time: 5, key: 'remind5m', label: '5 minutos' }
      ];
      
      for (const t of thresholds) {
        if (db.sentPushReminders[matchId][t.time]) continue;
        
        // Window check: time - 3 to time + 1 minutes
        if (diffMins >= t.time - 3 && diffMins <= t.time + 1) {
          const usersWithoutGuess = db.users.filter(user => {
            const hasGuess = db.guesses.some(
              g => g.matchId === matchId && g.userName.toLowerCase() === user.name.toLowerCase()
            );
            return !hasGuess;
          });
          
          if (usersWithoutGuess.length > 0) {
            for (const user of usersWithoutGuess) {
              const settings = user.notificationSettings || {
                betReminders: true,
                remind1h: true,
                remind30m: true,
                remind15m: true,
                remind5m: true
              };
              
              if (settings[t.key]) {
                const added = await enqueuePushNotification(
                  user.name,
                  {
                    title: "📝 Palpite Pendente!",
                    body: `O jogo ${match.teamA} vs ${match.teamB} começa em ${t.label}. Não esqueça de palpitar!`,
                    url: `/?match=${matchId}`
                  },
                  `reminder:${matchId}:${t.time}:${user.name.toLowerCase()}`
                );
                if (added) {
                  // counted via queue
                }
              }
            }
          }
          
          db.sentPushReminders[matchId][t.time] = true;
          dbChanged = true;
        }
      }
    }
    
    if (dbChanged) {
      await runExclusive(async () => {
        const latestDb = await getData();
        if (!latestDb.sentPushReminders) {
          latestDb.sentPushReminders = {};
        }
        latestDb.sentPushReminders = {
          ...latestDb.sentPushReminders,
          ...db.sentPushReminders
        };
        await saveData(latestDb);
      });
    }
  } catch (error) {
    console.error('Error in push reminder scheduler:', error);
  }
}

// Scheduler server-side: roda sync + enfileira alertas; dispatch é feito em seguida
if (!process.env.VERCEL) {
  setInterval(async () => {
    try {
      await runServerSideSyncCycle();
      await dispatchPendingNotifications();
    } catch (err) {
      console.error('Local sync/dispatch cycle error:', err);
    }
  }, 60000);
}

export default app;

