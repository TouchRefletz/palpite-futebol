import express from 'express';
import cors from 'cors';
import { getData, saveData } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Scoring function
function calculatePoints(guessA, guessB, resultA, resultB) {
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

let lastSyncTime = 0;

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

async function syncWithWorldCupAPI() {
  const now = Date.now();
  if (now - lastSyncTime < 30000) {
    // Cache de 30 segundos para evitar sobrecarregar a API pública
    return;
  }

  try {
    const res = await fetch('https://worldcup26.ir/get/games', {
      signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) {
      console.error('WorldCup26 API returned error:', res.status);
      return;
    }

    const data = await res.json();
    if (!data.games || !Array.isArray(data.games)) return;

    const db = await getData();
    let dbChanged = false;

    for (const game of data.games) {
      const matchId = `wc_${game.id}`;
      
      // Mapeia nomes das seleções
      const teamA = game.home_team_name_en || game.home_team_label;
      const teamB = game.away_team_name_en || game.away_team_label;
      if (!teamA || !teamB) continue;

      const date = parseDate(game.local_date, game.stadium_id);
      const scoreA = game.home_score === 'null' || game.home_score === null ? null : parseInt(game.home_score);
      const scoreB = game.away_score === 'null' || game.away_score === null ? null : parseInt(game.away_score);
      
      let newStatus = 'pending';
      if (game.finished === 'TRUE' || game.time_elapsed === 'finished') {
        newStatus = 'finished';
      } else if (game.time_elapsed === 'live' || (game.finished === 'FALSE' && game.time_elapsed !== 'notstarted' && scoreA !== null)) {
        newStatus = 'live';
      }

      // Dados de estádio e detalhados
      const stadiumInfo = STADIUMS_DATA[game.stadium_id] || { name: `Estádio ${game.stadium_id}`, city: "Desconhecida", country: "Desconhecido", capacity: 0 };

      let match = db.matches.find(m => m.id === matchId);

      if (!match) {
        match = {
          id: matchId,
          teamA,
          teamB,
          date,
          scoreA,
          scoreB,
          status: newStatus,
          home_scorers: game.home_scorers,
          away_scorers: game.away_scorers,
          group: game.group,
          matchday: game.matchday,
          stadiumName: stadiumInfo.name,
          stadiumCity: stadiumInfo.city,
          stadiumCountry: stadiumInfo.country,
          stadiumCapacity: stadiumInfo.capacity,
          createdAt: new Date().toISOString()
        };
        db.matches.push(match);
        dbChanged = true;
      } else {
        if (
          match.status !== newStatus || 
          match.scoreA !== scoreA || 
          match.scoreB !== scoreB || 
          match.home_scorers !== game.home_scorers || 
          match.away_scorers !== game.away_scorers ||
          match.date !== date
        ) {
          match.scoreA = scoreA;
          match.scoreB = scoreB;
          match.status = newStatus;
          match.date = date;
          match.home_scorers = game.home_scorers;
          match.away_scorers = game.away_scorers;
          match.group = game.group;
          match.matchday = game.matchday;
          match.stadiumName = stadiumInfo.name;
          match.stadiumCity = stadiumInfo.city;
          match.stadiumCountry = stadiumInfo.country;
          match.stadiumCapacity = stadiumInfo.capacity;
          dbChanged = true;
        }
      }

      // Se o jogo acabou na API e ainda não computou os palpites localmente
      if (newStatus === 'finished' && db.guesses.some(g => g.matchId === match.id && g.points === null)) {
        db.guesses = db.guesses.map(guess => {
          if (guess.matchId === match.id) {
            const points = calculatePoints(guess.scoreA, guess.scoreB, scoreA, scoreB);
            return { ...guess, points };
          }
          return guess;
        });
        dbChanged = true;
      }
    }

    if (dbChanged) {
      await saveData(db);
    }
    lastSyncTime = now;
    console.log('Database successfully synced with WorldCup26.ir API.');
  } catch (error) {
    console.error('Error syncing with WorldCup26 API:', error);
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
    const db = await getData();
    
    // Check if user already exists
    let user = db.users.find(u => u.name.toLowerCase() === trimmedName.toLowerCase());
    
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

    res.json({ name: user.name, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro no servidor durante o login.' });
  }
});

// 2. Obter todas as partidas e os palpites do usuário atual
app.get('/api/matches', async (req, res) => {
  const { userName } = req.query;

  try {
    await syncWithWorldCupAPI();
    const db = await getData();
    const matches = db.matches;
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
          .filter(g => g.matchId === match.id && g.userName.toLowerCase() !== userName?.toString().toLowerCase())
          .map(g => ({
            userName: g.userName,
            scoreA: g.scoreA,
            scoreB: g.scoreB,
            points: g.points
          }));
      }

      return {
        ...match,
        userGuess: userGuess ? { scoreA: userGuess.scoreA, scoreB: userGuess.scoreB, points: userGuess.points } : null,
        otherGuesses
      };
    });

    res.json(matchesWithGuesses);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Erro ao buscar partidas.' });
  }
});

// 3. Cadastrar nova partida (Admin)
app.post('/api/matches', async (req, res) => {
  const { teamA, teamB, date, requesterRole } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem cadastrar jogos.' });
  }

  if (!teamA || !teamB || !date) {
    return res.status(400).json({ error: 'Times A e B e data são obrigatórios.' });
  }

  try {
    const db = await getData();
    const newMatch = {
      id: generateId(),
      teamA: teamA.trim(),
      teamB: teamB.trim(),
      date: new Date(date).toISOString(),
      scoreA: null,
      scoreB: null,
      status: 'pending', // pending, finished
      createdAt: new Date().toISOString()
    };

    db.matches.push(newMatch);
    await saveData(db);
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
    const db = await getData();
    const match = db.matches.find(m => m.id === matchId);

    if (!match) {
      return res.status(404).json({ error: 'Partida não encontrada.' });
    }

    // Check if match already started
    const isLocked = match.status === 'finished' || new Date(match.date) < new Date();
    if (isLocked && requesterRole !== 'admin') {
      return res.status(400).json({ error: 'As apostas para este jogo já estão encerradas.' });
    }

    // Find or create guess
    let guess = db.guesses.find(g => g.matchId === matchId && g.userName.toLowerCase() === userName.toLowerCase());

    if (guess) {
      guess.scoreA = parseInt(scoreA);
      guess.scoreB = parseInt(scoreB);
      guess.updatedAt = new Date().toISOString();
    } else {
      guess = {
        id: `${userName.toLowerCase()}_${matchId}`,
        userName: userName.trim(),
        matchId,
        scoreA: parseInt(scoreA),
        scoreB: parseInt(scoreB),
        points: null,
        createdAt: new Date().toISOString()
      };
      db.guesses.push(guess);
    }

    // Se o jogo já acabou, calcula os pontos do palpite imediatamente
    if (match.status === 'finished') {
      guess.points = calculatePoints(guess.scoreA, guess.scoreB, match.scoreA, match.scoreB);
    } else {
      guess.points = null;
    }

    await saveData(db);
    res.json(guess);
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
    const db = await getData();
    const match = db.matches.find(m => m.id === matchId);

    if (!match) {
      return res.status(404).json({ error: 'Partida não encontrada.' });
    }

    // Update match result
    match.scoreA = finalScoreA;
    match.scoreB = finalScoreB;
    match.status = 'finished';
    match.resultUpdatedAt = new Date().toISOString();

    // Calculate points for all guesses for this match
    db.guesses = db.guesses.map(guess => {
      if (guess.matchId === matchId) {
        const points = calculatePoints(guess.scoreA, guess.scoreB, finalScoreA, finalScoreB);
        return {
          ...guess,
          points
        };
      }
      return guess;
    });

    await saveData(db);
    res.json({ message: 'Resultado registrado e pontos calculados com sucesso!', match });
  } catch (error) {
    console.error('Error recording result:', error);
    res.status(500).json({ error: 'Erro ao registrar resultado.' });
  }
});

// 6. Obter Ranking de Classificação
app.get('/api/ranking', async (req, res) => {
  try {
    const db = await getData();
    const users = db.users;
    const guesses = db.guesses;

    // Calculate scores for each user
    const ranking = users.map(user => {
      const userGuesses = guesses.filter(g => g.userName.toLowerCase() === user.name.toLowerCase() && g.points !== null);
      
      const totalPoints = userGuesses.reduce((sum, g) => sum + g.points, 0);
      const exactScores = userGuesses.filter(g => g.points === 25).length;
      const winnerDiff = userGuesses.filter(g => g.points === 18).length;
      const winnerGoals = userGuesses.filter(g => g.points === 15 || g.points === 12).length;
      const winnerOnly = userGuesses.filter(g => g.points === 10).length;
      const totalGuesses = guesses.filter(g => g.userName.toLowerCase() === user.name.toLowerCase()).length;

      // Live projection
      let livePoints = 0;
      let projectedExactScores = 0;
      let projectedWinnerDiff = 0;
      let projectedWinnerGoals = 0;
      let projectedWinnerOnly = 0;

      const liveMatches = db.matches.filter(m => m.status === 'live');
      liveMatches.forEach(match => {
        const guess = guesses.find(g => g.matchId === match.id && g.userName.toLowerCase() === user.name.toLowerCase());
        if (guess && match.scoreA !== null && match.scoreB !== null) {
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
        totalPoints,
        projectedPoints: totalPoints + livePoints,
        exactScores,
        winnerDiff,
        winnerGoals,
        winnerOnly,
        projectedExactScores: exactScores + projectedExactScores,
        projectedWinnerDiff: winnerDiff + projectedWinnerDiff,
        projectedWinnerGoals: winnerGoals + projectedWinnerGoals,
        projectedWinnerOnly: winnerOnly + projectedWinnerOnly,
        totalGuesses
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
    await saveData(data);
    res.json({ message: 'Dados importados com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao importar dados.' });
  }
});

// 8. Importar Tabela da Copa 2026 (Admin)
app.post('/api/copa2026/sync', async (req, res) => {
  const { requesterRole } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem carregar jogos da Copa.' });
  }

  try {
    lastSyncTime = 0; // Reseta cache para forçar a busca na API pública agora
    await syncWithWorldCupAPI();
    const db = await getData();
    res.json({ message: `Jogos da Copa de 2026 sincronizados em tempo real! Total no sistema: ${db.matches.length} partidas.` });
  } catch (error) {
    console.error('Error manual sync WC matches:', error);
    res.status(500).json({ error: 'Erro ao sincronizar jogos da Copa.' });
  }
});

// 9. Simular Progresso dos Jogos (Admin - Testes e Demonstrações)
app.post('/api/copa2026/simulate-live', async (req, res) => {
  const { requesterRole } = req.body;

  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem simular jogos.' });
  }

  try {
    const db = await getData();
    if (db.matches.length === 0) {
      return res.status(400).json({ error: 'Nenhum jogo cadastrado para simular. Carregue os jogos da Copa primeiro.' });
    }

    let changed = false;
    let message = '';

    // Procura por um jogo ao vivo para atualizar
    let liveMatch = db.matches.find(m => m.status === 'live');

    if (liveMatch) {
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

        // Calcula pontos para todos os palpites
        db.guesses = db.guesses.map(guess => {
          if (guess.matchId === liveMatch.id) {
            const points = calculatePoints(guess.scoreA, guess.scoreB, liveMatch.scoreA, liveMatch.scoreB);
            return { ...guess, points };
          }
          return guess;
        });
      }
      changed = true;
    } else {
      // Nenhum jogo ao vivo, inicia um pendente
      let pendingMatch = db.matches.find(m => m.status === 'pending');
      if (pendingMatch) {
        pendingMatch.status = 'live';
        pendingMatch.scoreA = 0;
        pendingMatch.scoreB = 0;
        message = `BOLA ROLANDO! O jogo ${pendingMatch.teamA} vs ${pendingMatch.teamB} começou e está AO VIVO!`;
        changed = true;
      } else {
        message = 'Todos os jogos cadastrados já estão encerrados!';
      }
    }

    if (changed) {
      await saveData(db);
    }

    res.json({ message, matches: db.matches });
  } catch (error) {
    console.error('Error simulating live match:', error);
    res.status(500).json({ error: 'Erro ao simular progresso do jogo.' });
  }
});

export default app;

