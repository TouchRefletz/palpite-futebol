import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Calendar, 
  User, 
  Plus, 
  Check, 
  LogOut, 
  Settings, 
  HelpCircle, 
  Lock, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Upload,
  Info,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  X,
  Award,
  ExternalLink,
  Sliders,
  Bell,
  BellOff,
  Volume2,
  VolumeX
} from 'lucide-react';

// Team emoji auto-mapper (legacy fallback)
const getTeamEmoji = (name) => {
  if (!name) return '⚽';
  const lower = name.toLowerCase();
  if (lower.includes('brasil')) return '🇧🇷';
  if (lower.includes('argentina')) return '🇦🇷';
  if (lower.includes('alemanha')) return '🇩🇪';
  if (lower.includes('frança') || lower.includes('franca')) return '🇫🇷';
  if (lower.includes('itália') || lower.includes('italia')) return '🇮🇹';
  if (lower.includes('espanha')) return '🇪🇸';
  if (lower.includes('inglaterra')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (lower.includes('uruguai')) return '🇺🇾';
  if (lower.includes('bélgica') || lower.includes('belgica')) return '🇧🇪';
  if (lower.includes('holanda')) return '🇳🇱';
  if (lower.includes('portugal')) return '🇵🇹';
  if (lower.includes('croácia') || lower.includes('croacia')) return '🇭🇷';
  if (lower.includes('japão') || lower.includes('japao')) return '🇯🇵';
  if (lower.includes('marrocos')) return '🇲🇦';
  if (lower.includes('senegal')) return '🇸🇳';
  if (lower.includes('estados unidos') || lower.includes('usa')) return '🇺🇸';
  if (lower.includes('méxico') || lower.includes('mexico')) return '🇲🇽';
  if (lower.includes('canadá') || lower.includes('canada')) return '🇨🇦';
  if (lower.includes('colômbia') || lower.includes('colombia')) return '🇨🇴';
  if (lower.includes('argélia') || lower.includes('algeria')) return '🇩🇿';
  if (lower.includes('áustria') || lower.includes('austria')) return '🇦🇹';
  if (lower.includes('cabo verde') || lower.includes('cape verde')) return '🇨🇻';
  if (lower.includes('egito') || lower.includes('egypt')) return '🇪🇬';
  if (lower.includes('irã') || lower.includes('iran')) return '🇮🇷';
  if (lower.includes('iraque') || lower.includes('iraq')) return '🇮🇶';
  if (lower.includes('jordânia') || lower.includes('jordan')) return '🇯🇴';
  if (lower.includes('nova zelândia') || lower.includes('new zealand')) return '🇳🇿';
  if (lower.includes('noruega') || lower.includes('norway')) return '🇳🇴';
  if (lower.includes('arábia saudita') || lower.includes('saudi arabia')) return '🇸🇦';
  if (lower.includes('tunísia') || lower.includes('tunisia')) return '🇹🇳';
  return '⚽';
};

// Team flag CDN mapper (resolves OS rendering differences)
const getTeamFlagUrl = (name) => {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  
  const mapping = {
    'alemanha': 'de', 'germany': 'de',
    'algéria': 'dz', 'algeria': 'dz',
    'argentina': 'ar',
    'austrália': 'au', 'australia': 'au',
    'austria': 'at', 'áustria': 'at',
    'bélgica': 'be', 'belgium': 'be',
    'bósnia e herzegovina': 'ba', 'bosnia and herzegovina': 'ba', 'bosnia': 'ba',
    'brasil': 'br', 'brazil': 'br',
    'cabo verde': 'cv', 'cape verde': 'cv',
    'canadá': 'ca', 'canada': 'ca',
    'colômbia': 'co', 'colombia': 'co',
    'coreia do sul': 'kr', 'south korea': 'kr', 'korea': 'kr',
    'croácia': 'hr', 'croatia': 'hr',
    'curaçao': 'cw', 'curacao': 'cw',
    'república checa': 'cz', 'czech republic': 'cz', 'czechia': 'cz',
    'ecuador': 'ec', 'equador': 'ec',
    'egito': 'eg', 'egypt': 'eg',
    'espanha': 'es', 'spain': 'es',
    'estados unidos': 'us', 'usa': 'us', 'united states': 'us',
    'frança': 'fr', 'france': 'fr',
    'gana': 'gh', 'ghana': 'gh',
    'haiti': 'ht',
    'holanda': 'nl', 'netherlands': 'nl',
    'inglaterra': 'gb-eng', 'england': 'gb-eng',
    'irã': 'ir', 'iran': 'ir',
    'iraque': 'iq', 'iraq': 'iq',
    'itália': 'it', 'italy': 'it',
    'costa do marfim': 'ci', 'ivory coast': 'ci',
    'japão': 'jp', 'japan': 'jp',
    'jordânia': 'jo', 'jordan': 'jo',
    'marrocos': 'ma', 'morocco': 'ma',
    'méxico': 'mx', 'mexico': 'mx',
    'nova zelândia': 'nz', 'new zealand': 'nz',
    'noruega': 'no', 'norway': 'no',
    'panamá': 'pa', 'panama': 'pa',
    'paraguai': 'py', 'paraguay': 'py',
    'portugal': 'pt',
    'qatar': 'qa', 'catar': 'qa',
    'república democrática do congo': 'cd', 'democratic republic of the congo': 'cd', 'dr congo': 'cd', 'congo': 'cd',
    'arábia saudita': 'sa', 'saudi arabia': 'sa',
    'escócia': 'gb-sct', 'scotland': 'gb-sct',
    'senegal': 'sn',
    'suécia': 'se', 'sweden': 'se',
    'suíça': 'ch', 'switzerland': 'ch',
    'tunísia': 'tn', 'tunisia': 'tn',
    'turquia': 'tr', 'turkey': 'tr',
    'uruguai': 'uy', 'uruguay': 'uy',
    'uzbequistão': 'uz', 'uzbekistan': 'uz',
    'áfrica do sul': 'za', 'south africa': 'za'
  };

  for (const [key, value] of Object.entries(mapping)) {
    if (lower.includes(key)) {
      return `https://flagcdn.com/w80/${value}.png`;
    }
  }
  return null;
};

const TeamFlagImage = ({ name, className, logoUrl }) => {
  const [imgSrc, setImgSrc] = React.useState(logoUrl || getTeamFlagUrl(name));
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(logoUrl || getTeamFlagUrl(name));
    setHasError(false);
  }, [name, logoUrl]);

  if (hasError || !imgSrc) {
    return <span className={`team-flag-emoji-fallback ${className || ''}`}>{getTeamEmoji(name)}</span>;
  }

  return (
    <img 
      src={imgSrc} 
      alt={name} 
      className={className} 
      onError={() => {
        if (imgSrc === logoUrl) {
          const flagUrl = getTeamFlagUrl(name);
          if (flagUrl) {
            setImgSrc(flagUrl);
          } else {
            setHasError(true);
          }
        } else {
          setHasError(true);
        }
      }} 
    />
  );
};

const renderTeamFlag = (name, className = "team-flag", logoUrl = null) => {
  return <TeamFlagImage name={name} className={className} logoUrl={logoUrl} />;
};

const getTeamColors = (teamName) => {
  const name = (teamName || '').toLowerCase().trim();
  const colorMap = {
    'brasil': { bg: '#15803d', text: '#ffffff' },
    'brazil': { bg: '#15803d', text: '#ffffff' },
    'argentina': { bg: '#74acdf', text: '#0a0f1d' },
    'alemanha': { bg: '#111827', text: '#ffffff' },
    'germany': { bg: '#111827', text: '#ffffff' },
    'espanha': { bg: '#b91c1c', text: '#ffffff' },
    'spain': { bg: '#b91c1c', text: '#ffffff' },
    'frança': { bg: '#1e3a8a', text: '#ffffff' },
    'france': { bg: '#1e3a8a', text: '#ffffff' },
    'inglaterra': { bg: '#ef4444', text: '#ffffff' },
    'england': { bg: '#ef4444', text: '#ffffff' },
    'itália': { bg: '#1d4ed8', text: '#ffffff' },
    'italy': { bg: '#1d4ed8', text: '#ffffff' },
    'holanda': { bg: '#f97316', text: '#ffffff' },
    'netherlands': { bg: '#f97316', text: '#ffffff' },
    'portugal': { bg: '#991b1b', text: '#ffffff' },
    'uruguai': { bg: '#60a5fa', text: '#0a0f1d' },
    'uruguay': { bg: '#60a5fa', text: '#0a0f1d' },
    'méxico': { bg: '#047857', text: '#ffffff' },
    'mexico': { bg: '#047857', text: '#ffffff' },
    'estados unidos': { bg: '#0f172a', text: '#ffffff' },
    'usa': { bg: '#0f172a', text: '#ffffff' },
    'united states': { bg: '#0f172a', text: '#ffffff' },
    'japão': { bg: '#172554', text: '#ffffff' },
    'japan': { bg: '#172554', text: '#ffffff' },
    'coreia do sul': { bg: '#be123c', text: '#ffffff' },
    'south korea': { bg: '#be123c', text: '#ffffff' },
    'colômbia': { bg: '#eab308', text: '#0a0f1d' },
    'colombia': { bg: '#eab308', text: '#0a0f1d' },
    'croácia': { bg: '#e11d48', text: '#ffffff' },
    'croatia': { bg: '#e11d48', text: '#ffffff' },
    'bélgica': { bg: '#991b1b', text: '#ffffff' },
    'belgium': { bg: '#991b1b', text: '#ffffff' },
    'senegal': { bg: '#047857', text: '#ffffff' },
    'marrocos': { bg: '#be123c', text: '#ffffff' },
    'morocco': { bg: '#be123c', text: '#ffffff' },
    'canadá': { bg: '#be123c', text: '#ffffff' },
    'canada': { bg: '#be123c', text: '#ffffff' },
    'austrália': { bg: '#ca8a04', text: '#ffffff' },
    'australia': { bg: '#ca8a04', text: '#ffffff' },
    'turquia': { bg: '#be123c', text: '#ffffff' },
    'turkey': { bg: '#be123c', text: '#ffffff' },
    'suíça': { bg: '#be123c', text: '#ffffff' },
    'switzerland': { bg: '#be123c', text: '#ffffff' },
    'dinamarca': { bg: '#be123c', text: '#ffffff' },
    'denmark': { bg: '#be123c', text: '#ffffff' },
    'panamá': { bg: '#be123c', text: '#ffffff' },
    'panama': { bg: '#be123c', text: '#ffffff' },
    'south africa': { bg: '#047857', text: '#ffffff' },
    'czech republic': { bg: '#1d4ed8', text: '#ffffff' },
    'república checa': { bg: '#1d4ed8', text: '#ffffff' },
    'paraguai': { bg: '#be123c', text: '#ffffff' },
    'paraguay': { bg: '#be123c', text: '#ffffff' },
    'bósnia': { bg: '#1e40af', text: '#ffffff' },
    'bosnia': { bg: '#1e40af', text: '#ffffff' },
    'haiti': { bg: '#1d4ed8', text: '#ffffff' },
    'escócia': { bg: '#1e3a8a', text: '#ffffff' },
    'scotland': { bg: '#1e3a8a', text: '#ffffff' },
  };

  if (colorMap[name]) return colorMap[name];

  for (const key in colorMap) {
    if (name.includes(key)) return colorMap[key];
  }

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return { bg: `hsl(${h}, 70%, 25%)`, text: '#ffffff' };
};

const getGuessFilterLabel = (filter) => {
  if (filter === 'all') return 'Todos';
  if (filter === 'guessed') return 'Palpitados';
  if (filter === 'missing') return 'Sem Palpite';
  return '';
};

const getTimeFilterLabel = (filter) => {
  if (filter === 'all') return 'Todos';
  if (filter === 'near') return 'Próximos';
  if (filter === 'finished') return 'Encerrados';
  if (filter === 'future') return 'Futuros';
  return '';
};

const MatchClock = React.memo(({ match, customFinishedText, customPendingText, prefix = '' }) => {
  const [displayClock, setDisplayClock] = useState('');

  useEffect(() => {
    if (match.status !== 'live') {
      if (match.status === 'finished') {
        setDisplayClock(customFinishedText || 'Fim');
      } else {
        setDisplayClock(customPendingText || 'Aberto');
      }
      return;
    }

    const updateClock = () => {
      const baseClock = match.matchClock || 'AO VIVO';
      const clockUpdatedAt = match.clockUpdatedAt;

      if (!clockUpdatedAt || baseClock === 'HT' || baseClock === 'Intervalo' || baseClock.includes('HT') || baseClock.includes('Inter')) {
        setDisplayClock(baseClock);
        return;
      }

      // Parse current match clock (e.g. "23'", "1st Half 23'", "90+3'")
      let baseMins = 0;
      const plusMatch = baseClock.match(/(\d+)\+(\d+)/);
      if (plusMatch) {
        baseMins = parseInt(plusMatch[1], 10) + parseInt(plusMatch[2], 10);
      } else {
        const singleMatch = baseClock.match(/(\d+)/);
        if (singleMatch) {
          baseMins = parseInt(singleMatch[1], 10);
        }
      }

      const updatedTime = new Date(clockUpdatedAt).getTime();
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - updatedTime) / 1000));
      
      const totalSeconds = baseMins * 60 + elapsedSeconds;
      const currentMins = Math.floor(totalSeconds / 60);
      const currentSecs = totalSeconds % 60;
      const timeStr = `${currentMins}:${String(currentSecs).padStart(2, '0')}`;

      // Replaces pattern: \d+(\+\d+)?'? with timeStr
      const newDisplay = baseClock.replace(/\d+(\+\d+)?'?/, timeStr);
      setDisplayClock(newDisplay);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [match.status, match.matchClock, match.clockUpdatedAt, customFinishedText, customPendingText]);

  if (match.status === 'live') {
    return <>{prefix}{displayClock}</>;
  }

  return <>{displayClock}</>;
});

const LeagueDropdown = ({ selectedLeague, setSelectedLeague }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  const leagues = [
    { value: 'fifa.world', label: 'Copa do Mundo', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/4.png', category: 'Internacional' },
    { value: 'bra.1', label: 'Brasileirão Série A', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/85.png', category: 'Nacional' },
    { value: 'uefa.champions', label: 'UEFA Champions League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png', category: 'Continente' },
    { value: 'eng.1', label: 'Premier League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png', category: 'Inglaterra' },
    { value: 'esp.1', label: 'La Liga', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png', category: 'Espanha' }
  ];

  const currentLeague = leagues.find(l => l.value === selectedLeague) || leagues[0];

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="league-dropdown-container" ref={dropdownRef} style={{ position: 'relative', zIndex: 100 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="league-dropdown-trigger"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '8px 16px',
          color: 'var(--text-primary, #fff)',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.borderColor = 'var(--color-primary)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }
        }}
      >
        <div style={{
          width: '22px',
          height: '22px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          flexShrink: 0
        }}>
          <img 
            src={currentLeague.logo} 
            alt={currentLeague.label} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>
        <span>{currentLeague.label}</span>
        <ChevronDown size={16} style={{ 
          marginLeft: '4px',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          opacity: 0.7
        }} />
      </button>

      {isOpen && (
        <div
          className="league-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '260px',
            background: '#0d1321',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '6px 8px 4px 8px',
          }}>
            Campeonato
          </div>
          {leagues.map(league => {
            const isSelected = league.value === selectedLeague;
            return (
              <button
                key={league.value}
                type="button"
                onClick={() => {
                  setSelectedLeague(league.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  color: isSelected ? 'var(--color-primary)' : 'var(--text-primary, #fff)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-primary, #fff)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    flexShrink: 0
                  }}>
                    <img 
                      src={league.logo} 
                      alt={league.label} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                  <div>
                    <div style={{ color: 'inherit' }}>{league.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '400', marginTop: '2px' }}>
                      {league.category}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <Check size={16} style={{ color: 'var(--color-primary)' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};


function calculateLivePoints(guessA, guessB, resultA, resultB) {
  const gA = parseInt(guessA);
  const gB = parseInt(guessB);
  const rA = parseInt(resultA);
  const rB = parseInt(resultB);

  if (isNaN(gA) || isNaN(gB) || isNaN(rA) || isNaN(rB)) {
    return 0;
  }

  // 1. Exact score
  if (gA === rA && gB === rB) {
    return 25;
  }

  const guessWinner = gA > gB ? 'A' : (gB > gA ? 'B' : 'Draw');
  const resultWinner = rA > rB ? 'A' : (rB > rA ? 'B' : 'Draw');

  // If winner is wrong, 0 points
  if (guessWinner !== resultWinner) {
    return 0;
  }

  // Draw with different score
  if (resultWinner === 'Draw') {
    return 15;
  }

  // Winner correct, check sub-criteria
  const guessDiff = gA - gB;
  const resultDiff = rA - rB;
  const isDiffCorrect = guessDiff === resultDiff;

  const winnerTeam = resultWinner;
  const loserTeam = resultWinner === 'A' ? 'B' : 'A';

  const guessWinnerGoals = winnerTeam === 'A' ? gA : gB;
  const resultWinnerGoals = winnerTeam === 'A' ? rA : rB;
  const isWinnerGoalsCorrect = guessWinnerGoals === resultWinnerGoals;

  const guessLoserGoals = loserTeam === 'A' ? gA : gB;
  const resultLoserGoals = loserTeam === 'A' ? rA : rB;
  const isLoserGoalsCorrect = guessLoserGoals === resultLoserGoals;

  if (isDiffCorrect) {
    return 18;
  }
  if (isWinnerGoalsCorrect) {
    return 15;
  }
  if (isLoserGoalsCorrect) {
    return 12;
  }

  return 10;
}

const MARQUEE_SCROLL_SPEED = 36; // px/s

function MatchMarquee({ items, renderItem }) {
  const containerRef = useRef(null);
  const groupRef = useRef(null);
  const [metrics, setMetrics] = useState(null);
  const measureKey = items.map(item => item.userName).join('\0');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const group = groupRef.current;
      if (!group) return;

      const containerWidth = container.clientWidth;
      const groupWidth = group.scrollWidth;
      if (!groupWidth) return;

      const copies = Math.max(2, Math.ceil((containerWidth * 2) / groupWidth) + 1);
      const duration = Math.max(12, groupWidth / MARQUEE_SCROLL_SPEED);

      setMetrics(prev => {
        if (
          prev &&
          prev.shift === groupWidth &&
          prev.copies === copies &&
          Math.abs(prev.duration - duration) < 0.25
        ) {
          return prev;
        }
        return { shift: groupWidth, duration, copies };
      });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    if (groupRef.current) ro.observe(groupRef.current);

    return () => ro.disconnect();
  }, [measureKey]);

  const copies = metrics?.copies ?? 2;
  const groupContent = items.map((item, idx) => (
    <span key={item.userName || idx} className="marquee-item">
      {renderItem(item)}
    </span>
  ));

  return (
    <div className="match-card-marquee" ref={containerRef}>
      <div
        className={`marquee-track${metrics ? '' : ' marquee-track-paused'}`}
        style={metrics ? {
          '--marquee-shift': `${metrics.shift}px`,
          '--marquee-duration': `${metrics.duration}s`,
        } : undefined}
      >
        {Array.from({ length: copies }, (_, copyIndex) => (
          <div
            key={copyIndex}
            className="marquee-group"
            ref={copyIndex === 0 ? groupRef : undefined}
            aria-hidden={copyIndex > 0 ? true : undefined}
          >
            {groupContent}
          </div>
        ))}
      </div>
    </div>
  );
}


function App() {
  // Authentication & session
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bolao_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loginForm, setLoginForm] = useState({ name: '', code: '' });
  
  // App state
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [matchesLoaded, setMatchesLoaded] = useState(false);
  const [rankingLoaded, setRankingLoaded] = useState(false);
  const [guessFilter, setGuessFilter] = useState('all'); // 'all', 'guessed', 'missing'
  const [sectionsOpen, setSectionsOpen] = useState({
    live: true,
    soon: true,
    finished: false,
  });
  const [showProjection, setShowProjection] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    const savedUser = localStorage.getItem('bolao_user');
    const parsed = savedUser ? JSON.parse(savedUser) : null;
    return parsed?.role === 'admin' ? 'admin' : 'player';
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Modals state
  const [guessModal, setGuessModal] = useState({ isOpen: false, match: null });
  const [resultModal, setResultModal] = useState({ isOpen: false, match: null });
  const [newMatchModal, setNewMatchModal] = useState(false);
  const [adminGuessModal, setAdminGuessModal] = useState({ isOpen: false, match: null });
  const [pendingGuesses, setPendingGuesses] = useState([]);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedUserForAdjustment, setSelectedUserForAdjustment] = useState(null);
  
  // Forms state
  const [guessForm, setGuessForm] = useState({ scoreA: '', scoreB: '' });
  const [resultForm, setResultForm] = useState({ scoreA: '', scoreB: '' });
  const [newMatchForm, setNewMatchForm] = useState({ teamA: '', teamB: '', date: '' });
  const [adminGuessForm, setAdminGuessForm] = useState({ userName: '', scoreA: '', scoreB: '' });
  const [adjustmentForm, setAdjustmentForm] = useState({ pointsAdjustment: 0 });
  
  // Toggle visible guesses for finished matches
  const [expandedGuesses, setExpandedGuesses] = useState({});
  const [activeMatchDetails, setActiveMatchDetails] = useState(null);
  const [detailsTab, setDetailsTab] = useState('palpites');
  const [matchStats, setMatchStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState('fifa.world');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [leagueStandings, setLeagueStandings] = useState(null);
  const [loadingStandings, setLoadingStandings] = useState(false);

  const selectedLeagueRef = React.useRef(selectedLeague);
  useEffect(() => {
    selectedLeagueRef.current = selectedLeague;
  }, [selectedLeague]);

  // --- NOTIFICATIONS STATE & LOGIC ---
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const savedUser = localStorage.getItem('bolao_user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    const userName = parsedUser?.name;
    if (userName) {
      const savedSettings = localStorage.getItem(`bolao_notif_settings_${userName}`);
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    }
    return {
      goals: true,
      matchStarted: true,
      matchFinished: true,
      remind1h: true,
      remind30m: true,
      remind15m: true,
      remind5m: true,
      soundEnabled: true
    };
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState(() => {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  });

  // Sync settings when user logs in or user details are updated
  useEffect(() => {
    if (user && user.notificationSettings) {
      setNotificationSettings(user.notificationSettings);
      localStorage.setItem(`bolao_notif_settings_${user.name}`, JSON.stringify(user.notificationSettings));
    }
  }, [user]);

  const updateNotificationSettings = async (newSettings) => {
    setNotificationSettings(newSettings);
    if (user?.name) {
      localStorage.setItem(`bolao_notif_settings_${user.name}`, JSON.stringify(newSettings));
      try {
        await fetch('/api/users/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName: user.name, settings: newSettings })
        });
      } catch (err) {
        console.error("Failed to save settings on server:", err);
      }
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPushNotifications = async (silent = false) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      if (!silent) showToast('Push não suportado neste navegador/dispositivo.', 'error');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermissionStatus(permission);
      if (permission !== 'granted') {
        if (!silent) showToast('Permissão de notificações negada.', 'error');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Clear any existing subscription to prevent key conflicts (InvalidStateError)
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        console.log('Unsubscribed from old push subscription to avoid key conflicts.');
      }
      
      const keyRes = await fetch('/api/notifications/vapid-public-key');
      if (!keyRes.ok) throw new Error('Failed to fetch VAPID key');
      const { publicKey } = await keyRes.json();
      
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      };

      const subscription = await registration.pushManager.subscribe(subscribeOptions);
      console.log('Registered Push Subscription:', subscription);

      const subRes = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userName: user.name
        })
      });

      if (subRes.ok) {
        if (!silent) showToast('Notificações ativadas com sucesso!');
      } else {
        throw new Error('Server subscription failed');
      }
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
      if (!silent) showToast('Erro ao ativar notificações.', 'error');
    }
  };

  // Automatically register Push subscription if user is logged in and permission is already granted
  useEffect(() => {
    if (user && notificationPermissionStatus === 'granted') {
      subscribeToPushNotifications(true);
    }
  }, [user, notificationPermissionStatus]);

  const sendTestPushNotification = async () => {
    if (!user?.name) return;
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: user.name })
      });
      if (res.ok) {
        showToast('Notificação de teste enviada!');
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Erro ao enviar teste.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro de conexão ao enviar teste.', 'error');
    }
  };

  const playSoundEffect = (type) => {
    if (!notificationSettings.soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'goal') {
        const playWhistle = (startTime, duration) => {
          const osc = ctx.createOscillator();
          const mod = ctx.createOscillator();
          const modGain = ctx.createGain();
          const mainGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.value = 2000;

          mod.type = 'sine';
          mod.frequency.value = 35;
          modGain.gain.value = 150;

          mainGain.gain.setValueAtTime(0, startTime);
          mainGain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
          mainGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          mod.connect(modGain);
          modGain.connect(osc.frequency);
          osc.connect(mainGain);
          mainGain.connect(ctx.destination);

          osc.start(startTime);
          mod.start(startTime);
          osc.stop(startTime + duration);
          mod.stop(startTime + duration);
        };

        playWhistle(ctx.currentTime, 0.2);
        playWhistle(ctx.currentTime + 0.25, 0.2);
        playWhistle(ctx.currentTime + 0.5, 0.5);
      } else if (type === 'start' || type === 'finish') {
        const osc = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const mainGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 1800;

        mod.type = 'sine';
        mod.frequency.value = 30;
        modGain.gain.value = 120;

        mainGain.gain.setValueAtTime(0, ctx.currentTime);
        mainGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
        mainGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

        mod.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(mainGain);
        mainGain.connect(ctx.destination);

        osc.start();
        mod.start();
        osc.stop(ctx.currentTime + 0.8);
        mod.stop(ctx.currentTime + 0.8);
      } else {
        const playChime = (freq, startTime, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.value = freq;

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        playChime(587.33, ctx.currentTime, 0.4);
        playChime(880, ctx.currentTime + 0.15, 0.6);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const prevMatchesRef = React.useRef([]);

  // Client-side sound effects for real-time match events when browsing
  useEffect(() => {
    if (!user || !matches || matches.length === 0) {
      if (matches && matches.length > 0) {
        prevMatchesRef.current = matches;
      }
      return;
    }

    if (prevMatchesRef.current.length === 0) {
      prevMatchesRef.current = matches;
      return;
    }

    const prevMatches = prevMatchesRef.current;

    matches.forEach(newMatch => {
      const oldMatch = prevMatches.find(m => m.id === newMatch.id);
      if (!oldMatch) return;

      const scoreAChanged = newMatch.scoreA !== oldMatch.scoreA;
      const scoreBChanged = newMatch.scoreB !== oldMatch.scoreB;
      const statusChanged = newMatch.status !== oldMatch.status;

      if (newMatch.status === 'live' && (scoreAChanged || scoreBChanged)) {
        const goalsA = (newMatch.scoreA || 0) - (oldMatch.scoreA || 0);
        const goalsB = (newMatch.scoreB || 0) - (oldMatch.scoreB || 0);
        if (goalsA > 0 || goalsB > 0) {
          playSoundEffect('goal');
        }
      }

      if (newMatch.status === 'live' && oldMatch.status === 'pending') {
        playSoundEffect('start');
      }

      if (newMatch.status === 'finished' && oldMatch.status === 'live') {
        playSoundEffect('finish');
      }
    });

    prevMatchesRef.current = matches;
  }, [matches, user, notificationSettings.soundEnabled]);

  // Sync activeMatchDetails when matches array updates (e.g. results or guesses are saved)
  useEffect(() => {
    if (activeMatchDetails) {
      const updatedMatch = matches.find(m => m.id === activeMatchDetails.id);
      if (updatedMatch) {
        setActiveMatchDetails(updatedMatch);
      }
    }
  }, [matches]);

  // Disable body scroll when any modal or fullscreen match details is open
  useEffect(() => {
    const isAnyModalOpen = 
      !!activeMatchDetails || 
      guessModal.isOpen || 
      resultModal.isOpen || 
      newMatchModal || 
      adminGuessModal.isOpen || 
      adjustmentModalOpen || 
      isRulesModalOpen ||
      isSettingsModalOpen;
      
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [
    activeMatchDetails, 
    guessModal.isOpen, 
    resultModal.isOpen, 
    newMatchModal, 
    adminGuessModal.isOpen, 
    adjustmentModalOpen, 
    isRulesModalOpen,
    isSettingsModalOpen
  ]);


  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);


  // Fetch detailed statistics when activeMatchDetails is opened
  useEffect(() => {
    if (!activeMatchDetails) {
      setMatchStats(null);
      return;
    }
    // Reset tab to default
    setDetailsTab('palpites');
    
    setLoadingStats(true);
    setMatchStats(null); // Clear previous match's stats

    const league = activeMatchDetails.league || 'fifa.world';
    fetch(`/api/matches/${activeMatchDetails.id}/stats?league=${league}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar estatísticas');
        return res.json();
      })
      .then(data => {
        setMatchStats(data);
      })
      .catch(err => {
        console.error('Error fetching match stats:', err);
        showToast('Erro ao buscar estatísticas da partida.', 'error');
        setMatchStats(null);
      })
      .finally(() => {
        setLoadingStats(false);
      });
  }, [activeMatchDetails]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchLeagueStandings = (targetLeague) => {
    const league = targetLeague || selectedLeague;
    setLoadingStandings(true);
    setLeagueStandings(null);
    fetch(`/api/standings?league=${league}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao obter classificação');
        return res.json();
      })
      .then(data => {
        setLeagueStandings(data);
      })
      .catch(err => {
        console.error('Error fetching league standings:', err);
        showToast('Erro ao carregar classificação da liga.', 'error');
      })
      .finally(() => {
        setLoadingStandings(false);
      });
  };

  useEffect(() => {
    if (user && activeTab === 'standings') {
      fetchLeagueStandings(selectedLeague);
    }
  }, [user, selectedLeague, activeTab]);

  // Fetch data
  const fetchMatches = async (silent = false, league = selectedLeague) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/matches?userName=${encodeURIComponent(user.name)}&league=${league}`);
      if (res.ok) {
        const data = await res.json();
        if (league === selectedLeagueRef.current) {
          setMatches(data);
          setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      } else if (!silent) {
        showToast('Erro ao carregar jogos.', 'error');
      }
    } catch (e) {
      console.error(e);
      if (!silent) showToast('Erro de conexão ao carregar jogos.', 'error');
    } finally {
      if (league === selectedLeagueRef.current) {
        if (!silent) setLoading(false);
        setMatchesLoaded(true);
      }
    }
  };

  const fetchRanking = async (silent = false, league = selectedLeague) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/ranking?league=${league}`);
      if (res.ok) {
        const data = await res.json();
        if (league === selectedLeagueRef.current) {
          setRanking(data);
        }
      } else if (!silent) {
        showToast('Erro ao carregar ranking.', 'error');
      }
    } catch (e) {
      console.error(e);
      if (!silent) showToast('Erro de conexão ao carregar ranking.', 'error');
    } finally {
      if (league === selectedLeagueRef.current) {
        if (!silent) setLoading(false);
        setRankingLoaded(true);
      }
    }
  };

  useEffect(() => {
    if (user) {
      setMatches([]);
      setRanking([]);
      setMatchesLoaded(false);
      setRankingLoaded(false);
      fetchMatches(false, selectedLeague);
      fetchRanking(false, selectedLeague);

      // Atualização constante em segundo plano (silenciosa) a cada 30 segundos
      const interval = setInterval(() => {
        fetchMatches(true, selectedLeagueRef.current);
        fetchRanking(true, selectedLeagueRef.current);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, selectedLeague]);


  useEffect(() => {
    if (user && user.role === 'admin' && viewMode === 'admin' && activeTab === 'admin') {
      fetchPendingGuesses();
    }
  }, [user, viewMode, activeTab, selectedLeague]);

  // Handle Login / Registration
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.name.trim() || !loginForm.code.trim()) {
      showToast('Preencha o nome e o código de acesso!', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data);
        setViewMode(data.role === 'admin' ? 'admin' : 'player');
        localStorage.setItem('bolao_user', JSON.stringify(data));
        showToast(`Bem-vindo, ${data.name}!`);
      } else {
        showToast(data.error || 'Código incorreto ou erro de login.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Erro de rede ao conectar ao servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bolao_user');
    setMatches([]);
    setRanking([]);
    setMatchesLoaded(false);
    setRankingLoaded(false);
    setViewMode('player');
    showToast('Sessão encerrada.');
  };

  // Submit Guess
  const handleGuessSubmit = async (e) => {
    e.preventDefault();
    const { scoreA, scoreB } = guessForm;
    if (scoreA === '' || scoreB === '') {
      showToast('Insira o placar do seu palpite!', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/guesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user.name,
          matchId: guessModal.match.id,
          scoreA,
          scoreB
        })
      });

      if (res.ok) {
        showToast('Palpite registrado com sucesso!');
        setGuessModal({ isOpen: false, match: null });
        setGuessForm({ scoreA: '', scoreB: '' });
        fetchMatches();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao registrar palpite.', 'error');
      }
    } catch (e) {
      showToast('Erro de rede ao salvar palpite.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Admin Guess on behalf of another user
  const handleAdminGuessSubmit = async (e) => {
    e.preventDefault();
    const { userName, scoreA, scoreB } = adminGuessForm;
    if (!userName.trim()) {
      showToast('Selecione o participante!', 'error');
      return;
    }
    if (scoreA === '' || scoreB === '') {
      showToast('Insira o placar do palpite!', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/guesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName.trim(),
          matchId: adminGuessModal.match.id,
          scoreA,
          scoreB,
          requesterRole: 'admin'
        })
      });

      if (res.ok) {
        showToast(`Palpite para ${userName} registrado com sucesso!`);
        setAdminGuessModal({ isOpen: false, match: null });
        setAdminGuessForm({ userName: '', scoreA: '', scoreB: '' });
        fetchMatches();
        fetchRanking();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao registrar palpite.', 'error');
      }
    } catch (e) {
      showToast('Erro de rede ao salvar palpite.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Result (Admin)
  const handleResultSubmit = async (e) => {
    e.preventDefault();
    const { scoreA, scoreB } = resultForm;
    if (scoreA === '' || scoreB === '') {
      showToast('Insira o placar final!', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: resultModal.match.id,
          scoreA,
          scoreB,
          requesterRole: user.role
        })
      });

      if (res.ok) {
        showToast('Resultado registrado e pontos recalculados!');
        setResultModal({ isOpen: false, match: null });
        setResultForm({ scoreA: '', scoreB: '' });
        fetchMatches();
        fetchRanking();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao salvar resultado.', 'error');
      }
    } catch (e) {
      showToast('Erro de rede ao salvar resultado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Re-enable Auto Sync (Admin)
  const handleUnlockSync = async (matchId) => {
    if (!window.confirm('Deseja reativar a sincronização automática com a API para este jogo?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/matches/unlock-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          requesterRole: user.role
        })
      });

      if (res.ok) {
        showToast('Sincronização automática reativada!');
        fetchMatches();
        fetchRanking();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao reativar sincronização.', 'error');
      }
    } catch (e) {
      showToast('Erro de rede ao reativar sincronização.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create Match (Admin)
  const handleCreateMatchSubmit = async (e) => {
    e.preventDefault();
    const { teamA, teamB, date } = newMatchForm;
    if (!teamA.trim() || !teamB.trim() || !date) {
      showToast('Preencha todas as informações do jogo!', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamA,
          teamB,
          date: new Date(date).toISOString(),
          requesterRole: user.role
        })
      });

      if (res.ok) {
        showToast('Jogo cadastrado com sucesso!');
        setNewMatchModal(false);
        setNewMatchForm({ teamA: '', teamB: '', date: '' });
        fetchMatches();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao criar jogo.', 'error');
      }
    } catch (e) {
      showToast('Erro de rede ao criar jogo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Adjust User Points (Admin)
  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForAdjustment) return;

    setLoading(true);
    try {
      const res = await fetch('/api/users/adjust-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForAdjustment.userId,
          pointsAdjustment: parseInt(adjustmentForm.pointsAdjustment) || 0,
          league: selectedLeague,
          requesterRole: user.role
        })
      });

      if (res.ok) {
        showToast(`Pontuação de ${selectedUserForAdjustment.userName} ajustada com sucesso!`);
        setAdjustmentModalOpen(false);
        setSelectedUserForAdjustment(null);
        fetchRanking();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao ajustar pontuação.', 'error');
      }
    } catch (e) {
      showToast('Erro de rede ao ajustar pontuação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending guesses for approval (Admin)
  const fetchPendingGuesses = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const res = await fetch(`/api/admin/guesses/pending?league=${selectedLeague}&requesterRole=admin`);
      if (res.ok) {
        const data = await res.json();
        setPendingGuesses(data);
      }
    } catch (e) {
      console.error('Error fetching pending guesses:', e);
    }
  };

  // Approve guess (Admin)
  const handleApproveGuess = async (guessId) => {
    try {
      const res = await fetch('/api/admin/guesses/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guessId,
          requesterRole: 'admin'
        })
      });
      if (res.ok) {
        showToast('Palpite aprovado com sucesso!');
        fetchPendingGuesses();
        fetchMatches(true);
        fetchRanking(true);
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao aprovar palpite.', 'error');
      }
    } catch (e) {
      showToast('Erro ao comunicar com o servidor.', 'error');
    }
  };

  // Reject guess (Admin)
  const handleRejectGuess = async (guessId) => {
    try {
      const res = await fetch('/api/admin/guesses/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guessId,
          requesterRole: 'admin'
        })
      });
      if (res.ok) {
        showToast('Palpite rejeitado com sucesso!');
        fetchPendingGuesses();
        fetchMatches(true);
        fetchRanking(true);
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao rejeitar palpite.', 'error');
      }
    } catch (e) {
      showToast('Erro ao comunicar com o servidor.', 'error');
    }
  };

  // Recalculate All Points (Admin)
  const handleRecalculatePoints = async () => {
    if (!window.confirm('Deseja recalcular todos os palpites do banco de dados com base nos placares oficiais? Isso corrigirá qualquer erro ou projeção indevida.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterRole: user.role,
          league: selectedLeague
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'Pontuações recalculadas com sucesso!');
        fetchMatches();
        fetchRanking();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao recalcular pontuações.', 'error');
      }
    } catch (e) {
      showToast('Erro de rede ao recalcular pontuações.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar Jogos de Campeonatos (Admin)
  const handleSyncCopa = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/copa2026/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requesterRole: user.role,
          league: selectedLeague
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Jogos sincronizados com sucesso!');
        fetchMatches();
      } else {
        showToast(data.error || 'Erro ao sincronizar jogos.', 'error');
      }
    } catch (e) {
      showToast('Erro de rede ao sincronizar jogos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Simular andamento de jogo ao vivo (Admin)
  const handleSimulateLive = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/copa2026/simulate-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requesterRole: user.role,
          league: selectedLeague
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        fetchMatches();
        fetchRanking();
      } else {
        showToast(data.error || 'Erro ao simular progresso do jogo.', 'error');
      }
    } catch (e) {
      showToast('Erro de rede ao simular jogo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Export Data (Admin)
  const handleExportData = async () => {
    try {
      const res = await fetch(`/api/data/export?requesterRole=${user.role}`);
      if (res.ok) {
        const data = await res.json();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_bolao_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        showToast('Dados exportados com sucesso!');
      } else {
        showToast('Erro ao exportar backup.', 'error');
      }
    } catch (e) {
      showToast('Erro ao exportar.', 'error');
    }
  };

  // Import Data (Admin)
  const handleImportData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setLoading(true);
        const res = await fetch('/api/data/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: parsed,
            requesterRole: user.role
          })
        });

        if (res.ok) {
          showToast('Backup restaurado com sucesso!');
          fetchMatches();
          fetchRanking();
        } else {
          const rData = await res.json();
          showToast(rData.error || 'Erro ao importar backup.', 'error');
        }
      } catch (err) {
        showToast('Arquivo JSON inválido.', 'error');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Helpers
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseScorers = (scorersStr) => {
    if (!scorersStr || scorersStr === 'null') return [];
    try {
      if (scorersStr.startsWith('[') || scorersStr.startsWith('{')) {
        let clean = scorersStr.trim().replace(/^\{|\}$|^\[|\]$/g, '');
        return clean.split(',')
          .map(s => s.trim().replace(/^["“‟”]+|["“‟”]+$/g, '').trim())
          .filter(Boolean);
      }
      return [scorersStr];
    } catch (e) {
      return [];
    }
  };

  const getScorersFromStats = (matchStats, isHome) => {
    if (!matchStats) return [];
    const comp = matchStats.header?.competitions?.[0];
    if (!comp || !comp.details) return [];

    const homeAway = isHome ? 'home' : 'away';
    const teamId = comp.competitors?.find(c => c.homeAway === homeAway)?.team?.id;
    if (!teamId) return [];

    return comp.details
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

        return `${name} ${time}${suffix}`;
      });
  };

  const parseStatValue = (valStr) => {
    if (!valStr) return 0;
    const clean = valStr.toString().replace('%', '').trim();
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  };

  const getStatsComparisonList = () => {
    if (!matchStats?.boxscore?.teams) return [];
    const teamAStats = matchStats.boxscore.teams[0]?.statistics || [];
    const teamBStats = matchStats.boxscore.teams[1]?.statistics || [];
    
    return teamAStats.map(statA => {
      const statB = teamBStats.find(s => s.name === statA.name);
      return {
        name: statA.name,
        label: statA.label || statA.name,
        valA: statA.displayValue,
        valB: statB ? statB.displayValue : '0'
      };
    });
  };

  const getStatVal = (entry, statName) => {
    const s = entry.stats?.find(x => x.name === statName);
    return s ? s.value : 0;
  };

  const renderRosterList = (rosterObj, title) => {
    if (!rosterObj || !rosterObj.roster || rosterObj.roster.length === 0) {
      return (
        <div className="roster-team-column">
          <h5 className="roster-column-title">{title}</h5>
          <p className="no-data-text">Escalação indisponível.</p>
        </div>
      );
    }

    const starters = rosterObj.roster.filter(p => p.starter);
    const bench = rosterObj.roster.filter(p => !p.starter);
    
    return (
      <div className="roster-team-column glass-panel">
        <div className="roster-team-header">
          <h5 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>{title}</h5>
          {rosterObj.formation && <span className="formation-badge">{rosterObj.formation}</span>}
        </div>
        
        <div className="roster-section-group">
          <h6 className="roster-group-title">Titulares</h6>
          <div className="players-list">
            {starters.map((p, idx) => (
              <div key={idx} className="player-row-item">
                <span className="player-jersey">{p.jersey || '-'}</span>
                <div className="player-info-meta">
                  <span className="player-name">{p.athlete?.displayName || 'Desconhecido'}</span>
                  <span className="player-pos">{p.position?.displayName || p.position?.abbreviation}</span>
                </div>
                <div className="player-events-indicators">
                  {p.subbedIn && <span className="sub-indicator in" title="Entrou">🔄</span>}
                  {p.subbedOut && <span className="sub-indicator out" title="Saiu">🔄</span>}
                  {p.stats?.find(s => s.name === 'yellowCards')?.value > 0 && <span className="card-indicator yellow">🟨</span>}
                  {p.stats?.find(s => s.name === 'redCards')?.value > 0 && <span className="card-indicator red">🟥</span>}
                  {p.stats?.find(s => s.name === 'totalGoals')?.value > 0 && 
                    Array.from({ length: p.stats.find(s => s.name === 'totalGoals').value }).map((_, i) => (
                      <span key={i} className="goal-indicator" title="Gol">⚽</span>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="roster-section-group" style={{ marginTop: '20px' }}>
          <h6 className="roster-group-title">Reservas</h6>
          <div className="players-list bench-list">
            {bench.map((p, idx) => (
              <div key={idx} className="player-row-item">
                <span className="player-jersey">{p.jersey || '-'}</span>
                <div className="player-info-meta">
                  <span className="player-name">{p.athlete?.displayName || 'Desconhecido'}</span>
                  <span className="player-pos">{p.position?.displayName || p.position?.abbreviation}</span>
                </div>
                <div className="player-events-indicators">
                  {p.subbedIn && <span className="sub-indicator in" title="Entrou">🔄</span>}
                  {p.stats?.find(s => s.name === 'yellowCards')?.value > 0 && <span className="card-indicator yellow">🟨</span>}
                  {p.stats?.find(s => s.name === 'redCards')?.value > 0 && <span className="card-indicator red">🟥</span>}
                  {p.stats?.find(s => s.name === 'totalGoals')?.value > 0 && 
                    Array.from({ length: p.stats.find(s => s.name === 'totalGoals').value }).map((_, i) => (
                      <span key={i} className="goal-indicator" title="Gol">⚽</span>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFormList = (formObj) => {
    if (!formObj || !formObj.events || formObj.events.length === 0) {
      return <p className="no-data-text">Forma recente indisponível.</p>;
    }
    return (
      <div className="form-events-list">
        <div className="form-badge-row">
          {formObj.events.map((e, idx) => (
            <span key={idx} className={`result-dot ${e.gameResult}`} title={`${e.gameResult === 'W' ? 'Vitória' : e.gameResult === 'L' ? 'Derrota' : 'Empate'} contra ${e.opponent?.displayName}`}>
              {e.gameResult}
            </span>
          ))}
        </div>
        <div className="form-games-grid" style={{ marginTop: '12px' }}>
          {formObj.events.map((e, idx) => (
            <div key={idx} className="form-game-card glass-panel">
              <div className="form-game-header">
                <span className="form-game-competition">{e.competitionName || 'Amistoso'}</span>
                <span className="form-game-date">{new Date(e.gameDate).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="form-game-body">
                <span className={`result-badge ${e.gameResult}`}>{e.gameResult === 'W' ? 'V' : e.gameResult === 'L' ? 'D' : 'E'}</span>
                <div className="form-game-teams-score">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <img src={e.opponentLogo || e.opponent?.logo} alt="" className="form-opponent-logo" onError={(ev) => { ev.target.style.display = 'none'; }} />
                    <span className="form-game-opp">{e.opponent?.displayName}</span>
                  </div>
                  <span className="form-game-score">{e.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStandingsTable = (standingsObj) => {
    if (!standingsObj || !standingsObj.groups || standingsObj.groups.length === 0) {
      return <p className="no-data-text">Classificação indisponível.</p>;
    }
    
    return standingsObj.groups.map((group, gIdx) => (
      <div key={gIdx} className="standings-group-box glass-panel" style={{ marginTop: '20px' }}>
        <h5 className="standings-group-title">{group.header || 'Classificação'}</h5>
        <div className="standings-table-wrapper">
          <table className="standings-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Pos</th>
                <th>Time</th>
                <th title="Pontos">P</th>
                <th title="Jogos">J</th>
                <th title="Vitórias">V</th>
                <th title="Empates">E</th>
                <th title="Derrotas">D</th>
                <th title="Saldo de Gols">SG</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const rawEntries = group.standings?.entries || [];
                const sortedEntries = [...rawEntries].sort((a, b) => {
                  const rA = getStatVal(a, 'rank') || 999;
                  const rB = getStatVal(b, 'rank') || 999;
                  return rA - rB;
                });
                return sortedEntries.map((entry, eIdx) => {
                const rank = getStatVal(entry, 'rank') || (eIdx + 1);
                const gp = getStatVal(entry, 'gamesPlayed');
                const pts = getStatVal(entry, 'points');
                const wins = getStatVal(entry, 'wins');
                const ties = getStatVal(entry, 'ties');
                const losses = getStatVal(entry, 'losses');
                const gd = getStatVal(entry, 'pointDifferential');
                
                const isCurrentTeam = entry.team?.displayName === activeMatchDetails.teamA || entry.team?.displayName === activeMatchDetails.teamB;

                return (
                  <tr key={eIdx} className={isCurrentTeam ? 'highlighted-row' : ''}>
                    <td className="rank-col">{rank}</td>
                    <td className="team-col">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {entry.logo?.[0]?.href && <img src={entry.logo[0].href} alt="" className="standings-team-logo" />}
                        <span>{entry.team?.displayName || entry.team}</span>
                      </div>
                    </td>
                    <td className="points-col"><strong>{pts}</strong></td>
                    <td>{gp}</td>
                    <td>{wins}</td>
                    <td>{ties}</td>
                    <td>{losses}</td>
                    <td style={{ color: gd > 0 ? '#10b981' : gd < 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                      {gd > 0 ? `+${gd}` : gd}
                    </td>
                  </tr>
                );
              })
            })()}
            </tbody>
          </table>
        </div>
      </div>
    ));
  };

  const renderTimeline = (events) => {
    if (!events || events.length === 0) {
      return <p className="no-data-text">Linha do tempo indisponível para esta partida.</p>;
    }
    
    return (
      <div className="match-timeline-feed">
        {events.map((e, idx) => {
          const isGoal = e.type?.type?.includes('goal') || e.type?.text?.includes('Goal');
          const isYellow = e.type?.type?.includes('yellow-card') || e.type?.text?.includes('Yellow Card');
          const isRed = e.type?.type?.includes('red-card') || e.type?.text?.includes('Red Card');
          const isSub = e.type?.type?.includes('substitution') || e.type?.text?.includes('Substitution');
          
          let icon = '⏱️';
          let iconClass = 'info';
          if (isGoal) { icon = '⚽'; iconClass = 'goal'; }
          else if (isYellow) { icon = '🟨'; iconClass = 'card-yellow'; }
          else if (isRed) { icon = '🟥'; iconClass = 'card-red'; }
          else if (isSub) { icon = '🔄'; iconClass = 'sub'; }

          const isTeamA = e.team?.displayName === activeMatchDetails.teamA;
          const isTeamB = e.team?.displayName === activeMatchDetails.teamB;
          let alignClass = 'center';
          if (isTeamA) alignClass = 'left';
          else if (isTeamB) alignClass = 'right';

          return (
            <div key={idx} className={`timeline-event-item align-${alignClass}`}>
              <span className="event-time">{e.clock?.displayValue || '⏱️'}</span>
              <span className={`event-icon-badge ${iconClass}`}>{icon}</span>
              <div className="event-detail-card glass-panel">
                <p className="event-text">{e.text || e.type?.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLeaderCategories = (teamLeadersObj, teamName) => {
    const categories = teamLeadersObj?.leaders || [];
    if (categories.length === 0) return <p className="no-data-text">Destaques indisponíveis.</p>;
    
    return (
      <div className="leaders-team-block">
        <h6 className="leaders-team-title">Destaques - {teamName}</h6>
        <div className="leaders-categories-list">
          {categories.map((cat, idx) => {
            const topAthlete = cat.leaders?.[0];
            if (!topAthlete) return null;
            return (
              <div key={idx} className="leader-card glass-panel">
                <span className="leader-category-title">{cat.displayName}</span>
                <div className="leader-athlete-info">
                  {topAthlete.athlete?.jerseyImage?.[0]?.href ? (
                    <img src={topAthlete.athlete.jerseyImage[0].href} alt="" className="leader-jersey-img" />
                  ) : (
                    <span className="leader-default-icon">🏃‍♂️</span>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="leader-player-name">{topAthlete.athlete?.displayName || topAthlete.athlete?.shortName}</span>
                    <span className="leader-player-stat">{cat.leaders[0].displayValue} {cat.leaders[0].mainStat?.label || ''} ({topAthlete.summary})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getStageTitle = (group) => {
    switch (group) {
      case 'R32': return 'Fase de 32';
      case 'R16': return 'Oitavas';
      case 'QF': return 'Quartas';
      case 'SF': return 'Semifinais';
      case '3RD': return 'Disputa de 3º';
      case 'FINAL': return 'Final';
      default: return group;
    }
  };

  const renderStandingsTableDetailed = (childrenArray) => {
    if (!childrenArray || childrenArray.length === 0) return null;

    return (
      <div className="standings-grid-container" style={{ display: 'grid', gridTemplateColumns: childrenArray.length > 1 ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', gap: '20px' }}>
        {childrenArray.map((group, idx) => {
          const rawEntries = group.standings?.entries || [];
          const entries = [...rawEntries].sort((a, b) => {
            const getRank = (entry) => {
              const stats = entry.stats || [];
              const s = stats.find(x => x.type === 'rank' || x.name === 'rank');
              return s ? parseInt(s.value, 10) : 999;
            };
            return getRank(a) - getRank(b);
          });
          return (
            <div key={idx} className="standings-group-box glass-panel" style={{ padding: '16px' }}>
              <h4 className="standings-group-title" style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-primary)', margin: '0 0 12px 0', borderLeft: '3px solid var(--color-primary)', paddingLeft: '8px' }}>
                {group.name || group.header || 'Classificação'}
              </h4>
              <div className="standings-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="standings-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                      <th style={{ padding: '6px 4px', width: '30px' }}>Pos</th>
                      <th style={{ padding: '6px 4px', width: '24px' }}>Var</th>
                      <th style={{ padding: '6px 6px', textAlign: 'left' }}>Time</th>
                      <th style={{ padding: '6px 4px', fontWeight: '800', color: 'var(--color-primary)' }}>P</th>
                      <th style={{ padding: '6px 4px' }}>J</th>
                      <th style={{ padding: '6px 4px' }}>V</th>
                      <th style={{ padding: '6px 4px' }}>E</th>
                      <th style={{ padding: '6px 4px' }}>D</th>
                      <th style={{ padding: '6px 4px' }}>GP</th>
                      <th style={{ padding: '6px 4px' }}>GC</th>
                      <th style={{ padding: '6px 4px' }}>SG</th>
                      <th style={{ padding: '6px 4px' }}>PPG</th>
                      <th style={{ padding: '6px 4px' }}>PD</th>
                      <th style={{ padding: '6px 6px', width: '60px' }}>Geral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, eIdx) => {
                      const teamInfo = entry.team || {};
                      const stats = entry.stats || [];
                      
                      const getVal = (type) => {
                        const s = stats.find(x => x.type === type || x.name === type);
                        return s ? s.displayValue : '0';
                      };

                      const getRawVal = (type) => {
                        const s = stats.find(x => x.type === type || x.name === type);
                        return s ? s.value : 0;
                      };

                      const gp = getVal('gamesplayed') || getVal('gamesPlayed');
                      const wins = getVal('wins');
                      const ties = getVal('ties');
                      const losses = getVal('losses');
                      const pts = getVal('points');
                      const ptsFor = getVal('pointsfor') || getVal('pointsFor');
                      const ptsAgainst = getVal('pointsagainst') || getVal('pointsAgainst');
                      const diff = getVal('pointdifferential') || getVal('pointDifferential');
                      const ppg = getVal('ppg');
                      const ded = getVal('deductions');
                      const overall = getVal('total') || stats.find(x => x.id === '0')?.displayValue || '-';
                      const rank = getVal('rank');
                      const rankChange = getRawVal('rankchange') || getRawVal('rankChange') || 0;

                      const logoUrl = teamInfo.logos?.[0]?.href;

                      return (
                        <tr key={eIdx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 4px', fontWeight: '800' }}>{rank}</td>
                          <td style={{ padding: '8px 4px' }}>
                            {rankChange > 0 ? (
                              <span style={{ color: '#ef4444', fontSize: '9px' }}>▼{Math.abs(rankChange)}</span>
                            ) : rankChange < 0 ? (
                              <span style={{ color: '#10b981', fontSize: '9px' }}>▲{Math.abs(rankChange)}</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {logoUrl && <img src={logoUrl} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />}
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={teamInfo.displayName}>
                                {teamInfo.displayName}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '8px 4px', fontWeight: '800', color: 'var(--color-primary)', background: 'rgba(16, 185, 129, 0.05)' }}>{pts}</td>
                          <td style={{ padding: '8px 4px' }}>{gp}</td>
                          <td style={{ padding: '8px 4px' }}>{wins}</td>
                          <td style={{ padding: '8px 4px' }}>{ties}</td>
                          <td style={{ padding: '8px 4px' }}>{losses}</td>
                          <td style={{ padding: '8px 4px' }}>{ptsFor}</td>
                          <td style={{ padding: '8px 4px' }}>{ptsAgainst}</td>
                          <td style={{ padding: '8px 4px', fontWeight: '600', color: parseFloat(diff) > 0 ? '#10b981' : parseFloat(diff) < 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                            {diff}
                          </td>
                          <td style={{ padding: '8px 4px' }}>{ppg}</td>
                          <td style={{ padding: '8px 4px', color: parseFloat(ded) > 0 ? '#ef4444' : 'var(--text-secondary)' }}>{ded > 0 ? `-${ded}` : '-'}</td>
                          <td style={{ padding: '8px 6px', fontSize: '10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{overall}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getParentMatchNumbers = (matchNumber) => {
    const routing = {
      // R16 feeds from R32
      89: [74, 77],
      90: [73, 75],
      91: [76, 78],
      92: [79, 80],
      93: [83, 84],
      94: [81, 82],
      95: [86, 88],
      96: [85, 87],

      // QF feeds from R16
      97: [89, 90],
      98: [93, 94],
      99: [91, 92],
      100: [95, 96],

      // SF feeds from QF
      101: [97, 98],
      102: [99, 100],

      // FINAL feeds from SF
      104: [101, 102],
      103: [101, 102]
    };
    return routing[matchNumber] || null;
  };

  const getMatchIdNumber = (id) => {
    if (!id) return null;
    const m = id.match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
  };

  const extractMatchNumber = (teamName) => {
    if (!teamName) return null;
    const m = teamName.match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
  };

  const getParentMatches = (match, matchesList, hasR32) => {
    // Only allow parent lookups for stages that actually have parents in the knockout tree
    const allowedStages = ['FINAL', 'SF', 'QF'];
    if (hasR32) {
      allowedStages.push('R16');
    }
    
    if (!allowedStages.includes(match.group)) {
      return [null, null];
    }

    const idNum = getMatchIdNumber(match.id);
    let parentNums = null;
    
    if (idNum) {
      parentNums = getParentMatchNumbers(idNum);
    }
    
    if (parentNums) {
      const parentA = matchesList.find(m => getMatchIdNumber(m.id) === parentNums[0]);
      const parentB = matchesList.find(m => getMatchIdNumber(m.id) === parentNums[1]);
      return [parentA, parentB];
    }
    
    // Fallback to name parsing
    const numA = extractMatchNumber(match.teamA);
    const numB = extractMatchNumber(match.teamB);
    
    const parentA = numA ? matchesList.find(m => getMatchIdNumber(m.id) === numA) : null;
    const parentB = numB ? matchesList.find(m => getMatchIdNumber(m.id) === numB) : null;
    
    return [parentA, parentB];
  };

  const buildTreeNode = (match, matchesList, hasR32) => {
    if (!match) return null;
    const [parentA, parentB] = getParentMatches(match, matchesList, hasR32);
    return {
      match,
      left: parentA ? buildTreeNode(parentA, matchesList, hasR32) : null,
      right: parentB ? buildTreeNode(parentB, matchesList, hasR32) : null
    };
  };

  const renderBracket = () => {
    const stages = ['R32', 'R16', 'QF', 'SF', 'FINAL'];
    const thirdPlaceMatch = matches.find(m => m.group === '3RD');

    const hasKnockout = matches.some(m => stages.includes(m.group) || m.group === '3RD');
    if (!hasKnockout) return null;

    // Detect columns based on available stages
    const hasR32 = matches.some(m => m.group === 'R32');
    const hasR16 = matches.some(m => m.group === 'R16');
    const hasQF = matches.some(m => m.group === 'QF');
    const hasSF = matches.some(m => m.group === 'SF');

    const finalMatch = matches.find(m => m.group === 'FINAL');
    const treeRoot = finalMatch ? buildTreeNode(finalMatch, matches, hasR32) : null;

    const headerColumns = [];
    if (hasR32) headerColumns.push('Dezesseis-avos (R32)');
    if (hasR16) headerColumns.push('Oitavas de Final');
    if (hasQF) headerColumns.push('Quartas de Final');
    if (hasSF) headerColumns.push('Semifinais');
    headerColumns.push('Final & 3º Lugar');

    const renderTreeNode = (node) => {
      if (!node) return null;
      const { match, left, right } = node;
      const isLive = match.status === 'live';
      const isFinished = match.status === 'finished';
      
      const hasChildren = left || right;

      return (
        <div className="bracket-branch">
          {hasChildren && (
            <div className="bracket-children">
              {left && renderTreeNode(left)}
              {right && renderTreeNode(right)}
            </div>
          )}
          
          <div className="bracket-match-node">
            <div 
              onClick={() => setActiveMatchDetails(match)}
              className={`bracket-match-card glass-panel ${isLive ? 'live-border' : ''}`}
              style={{ padding: '10px', cursor: 'pointer', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>{formatDate(match.date).split(' ')[0]}</span>
                <span className={`indicator-badge ${match.status}`} style={{ fontSize: '8px' }}>
                  <MatchClock match={match} customFinishedText="Fim" customPendingText="Aberto" />
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }}>
                    {renderTeamFlag(match.teamA, "bracket-flag", match.teamALogo)}
                    <span 
                      style={{ 
                        fontSize: '12px', 
                        fontWeight: match.scoreA > match.scoreB && isFinished ? '800' : '500', 
                        color: match.scoreA > match.scoreB && isFinished ? 'var(--text-primary)' : 'var(--text-secondary)', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        maxWidth: '140px' 
                      }} 
                      title={match.teamA}
                    >
                      {match.teamA}
                    </span>
                  </div>
                  {(isFinished || isLive) && <span style={{ fontSize: '12px', fontWeight: '800' }}>{match.scoreA}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }}>
                    {renderTeamFlag(match.teamB, "bracket-flag", match.teamBLogo)}
                    <span 
                      style={{ 
                        fontSize: '12px', 
                        fontWeight: match.scoreB > match.scoreA && isFinished ? '800' : '500', 
                        color: match.scoreB > match.scoreA && isFinished ? 'var(--text-primary)' : 'var(--text-secondary)', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        maxWidth: '140px' 
                      }} 
                      title={match.teamB}
                    >
                      {match.teamB}
                    </span>
                  </div>
                  {(isFinished || isLive) && <span style={{ fontSize: '12px', fontWeight: '800' }}>{match.scoreB}</span>}
                </div>
              </div>
            </div>

            {/* 3rd Place Match appended under Finals */}
            {match.group === 'FINAL' && thirdPlaceMatch && (
              <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }} onClick={(e) => e.stopPropagation()}>
                <h5 style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-secondary)', textAlign: 'center', marginBottom: '6px', margin: '0 0 6px 0' }}>
                  Disputa de 3º Lugar
                </h5>
                <div 
                  onClick={() => setActiveMatchDetails(thirdPlaceMatch)}
                  className={`bracket-match-card glass-panel ${thirdPlaceMatch.status === 'live' ? 'live-border' : ''}`} 
                  style={{ padding: '10px', cursor: 'pointer', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>{formatDate(thirdPlaceMatch.date).split(' ')[0]}</span>
                    <span className={`indicator-badge ${thirdPlaceMatch.status}`} style={{ fontSize: '8px' }}>
                      <MatchClock match={thirdPlaceMatch} customFinishedText="Fim" customPendingText="Aberto" />
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }}>
                        {renderTeamFlag(thirdPlaceMatch.teamA, "bracket-flag", thirdPlaceMatch.teamALogo)}
                        <span style={{ fontSize: '12px', fontWeight: thirdPlaceMatch.scoreA > thirdPlaceMatch.scoreB && thirdPlaceMatch.status === 'finished' ? '800' : '500', color: thirdPlaceMatch.scoreA > thirdPlaceMatch.scoreB && thirdPlaceMatch.status === 'finished' ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={thirdPlaceMatch.teamA}>
                          {thirdPlaceMatch.teamA}
                        </span>
                      </div>
                      {(thirdPlaceMatch.status === 'finished' || thirdPlaceMatch.status === 'live') && <span style={{ fontSize: '12px', fontWeight: '800' }}>{thirdPlaceMatch.scoreA}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' }}>
                        {renderTeamFlag(thirdPlaceMatch.teamB, "bracket-flag", thirdPlaceMatch.teamBLogo)}
                        <span style={{ fontSize: '12px', fontWeight: thirdPlaceMatch.scoreB > thirdPlaceMatch.scoreA && thirdPlaceMatch.status === 'finished' ? '800' : '500', color: thirdPlaceMatch.scoreB > thirdPlaceMatch.scoreA && thirdPlaceMatch.status === 'finished' ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={thirdPlaceMatch.teamB}>
                          {thirdPlaceMatch.teamB}
                        </span>
                      </div>
                      {(thirdPlaceMatch.status === 'finished' || thirdPlaceMatch.status === 'live') && <span style={{ fontSize: '12px', fontWeight: '800' }}>{thirdPlaceMatch.scoreB}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="bracket-section glass-panel" style={{ marginTop: '20px', padding: '20px' }}>
        <h3 className="section-title" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Fase de Mata-Mata 🏆</span>
        </h3>

        <div className="bracket-scroll-container" style={{ overflowX: 'auto', paddingBottom: '16px', paddingTop: '10px' }}>
          <div className="bracket-headers" style={{ display: 'flex', gap: '32px', marginBottom: '12px', paddingLeft: '8px', pointerEvents: 'none' }}>
          {headerColumns.map((col, index) => (
            <div key={index} style={{ width: '220px', flexShrink: 0, textAlign: 'center', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-primary)' }}>
              {col}
            </div>
          ))}
        </div>
          <div style={{ display: 'inline-flex', padding: '10px 4px' }}>
            {treeRoot ? renderTreeNode(treeRoot) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Carregando chaves do mata-mata...</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const toggleGuessesExpand = (matchId) => {
    setExpandedGuesses(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };

  // Render Login Card if not authenticated
  if (!user) {
    return (
      <div className="login-wrapper">
        <div className="login-card glass-panel">
          <div className="login-header">
            <div className="login-icon-box">
              <Trophy size={40} />
            </div>
            <h2 className="login-title">Bolão dos Amigos</h2>
            <p className="login-subtitle">Entre para dar o seu palpite e ver quem lidera o ranking!</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-name">Seu Nome</label>
              <input 
                id="login-name"
                type="text" 
                className="form-input" 
                placeholder="Ex: Felipe" 
                required
                value={loginForm.name}
                onChange={e => setLoginForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-code">Código de Acesso</label>
              <input 
                id="login-code"
                type="password" 
                className="form-input" 
                placeholder="Digite o código enviado pelo grupo" 
                required
                value={loginForm.code}
                onChange={e => setLoginForm(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Acessar Bolão'}
            </button>
          </form>
        </div>
        {toast && (
          <div className={`toast ${toast.type}`}>
            <Info size={16} />
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header>
        <div className="container header-content">
          <div className="brand">
            <Trophy size={28} className="text-emerald-500" style={{ color: 'var(--color-primary)' }} />
            <h1>Bolão dos Amigos</h1>
          </div>
          
          <div className="header-actions">
            <div className="header-league-wrapper">
              <LeagueDropdown selectedLeague={selectedLeague} setSelectedLeague={setSelectedLeague} />
            </div>
            
            <div className="header-user-row">
              <div className="user-badge">
                <User size={16} style={{ color: 'var(--text-secondary)' }} />
                <span className="user-badge-name">{user.name}</span>
                <span className={`user-badge-role ${viewMode}`}>
                  {user.role === 'admin' ? (viewMode === 'admin' ? 'Organizador' : 'Org (Jogador)') : 'Participante'}
                </span>
              </div>

              <div className="header-toolbar">
              {user.role === 'admin' && (
                <button 
                  onClick={() => {
                    const newMode = viewMode === 'admin' ? 'player' : 'admin';
                    setViewMode(newMode);
                    if (newMode === 'player' && activeTab === 'admin') {
                      setActiveTab('matches');
                    }
                    showToast(`Visualização alterada para o modo ${newMode === 'admin' ? 'Organizador' : 'Jogador'}.`);
                  }}
                  className="btn btn-secondary btn-icon-only"
                  title={viewMode === 'admin' ? "Visualizar como Jogador" : "Visualizar como Organizador"}
                >
                  {viewMode === 'admin' ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}

              <button 
                onClick={() => setIsSettingsModalOpen(true)}
                className="btn btn-secondary btn-icon-only" 
                title="Configurações de Alertas"
              >
                <Sliders size={16} />
              </button>

              <button 
                onClick={() => setIsRulesModalOpen(true)}
                className="btn btn-secondary btn-icon-only" 
                title="Regras de Pontuação"
                style={{ borderColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}
              >
                <HelpCircle size={16} />
              </button>

              <button onClick={handleLogout} className="btn btn-secondary btn-icon-only" title="Sair">
                <LogOut size={16} />
              </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs / Navigations */}
      <main className="container" style={{ flex: 1, paddingBottom: '48px' }}>
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <Calendar size={18} />
            Jogos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('ranking');
              fetchRanking();
            }}
          >
            <Trophy size={18} />
            Classificação
          </button>
          <button 
            className={`tab-btn ${activeTab === 'standings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('standings');
              fetchLeagueStandings();
            }}
          >
            <Award size={18} />
            Tabela & Mata-mata
          </button>
          
          {user.role === 'admin' && viewMode === 'admin' && (
            <button 
              className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <Settings size={18} />
              Organizador
            </button>
          )}
        </div>

        {/* Tab 1: Matches Grid */}
        {activeTab === 'matches' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Tabela de Partidas</h2>
                <button 
                  onClick={() => {
                    fetchMatches();
                    fetchRanking();
                  }} 
                  className="btn btn-secondary btn-icon-only" 
                  title="Atualizar placares"
                  style={{ padding: '6px', borderRadius: '50%' }}
                  disabled={loading}
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
                {lastUpdated && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                    Atualizado: {lastUpdated}
                  </span>
                )}
              </div>
              {user.role === 'admin' && viewMode === 'admin' && (
                <button onClick={() => setNewMatchModal(true)} className="btn btn-primary">
                  <Plus size={16} /> Novo Jogo
                </button>
              )}
            </div>

            {/* Filter Section */}
            <div className="filters-segmented-row">
              <div className="filters-segmented-container">
                <button
                  className={`filter-segment-btn ${guessFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setGuessFilter('all')}
                >
                  <span className="filter-icon">🥅</span>
                  <span className="filter-label-text">Todos</span>
                  <span className="filter-count-badge">{matches.length}</span>
                </button>
                <button
                  className={`filter-segment-btn ${guessFilter === 'guessed' ? 'active' : ''}`}
                  onClick={() => setGuessFilter('guessed')}
                >
                  <span className="filter-icon">✍️</span>
                  <span className="filter-label-text">Palpitados</span>
                  <span className="filter-count-badge success">
                    {matches.filter(m => m.userGuess !== null && m.userGuess !== undefined).length}
                  </span>
                </button>
                <button
                  className={`filter-segment-btn ${guessFilter === 'missing' ? 'active' : ''}`}
                  onClick={() => setGuessFilter('missing')}
                >
                  <span className="filter-icon">⏳</span>
                  <span className="filter-label-text">Pendentes</span>
                  <span className="filter-count-badge warning">
                    {matches.filter(m => !m.userGuess).length}
                  </span>
                </button>
              </div>
            </div>

            {!matchesLoaded ? (
              <div className="loading-box glass-panel">
                <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--color-primary)' }} />
                <p>Carregando partidas...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="empty-box glass-panel">
                <span className="empty-box-icon">🥅</span>
                <h3>Nenhum jogo cadastrado</h3>
                <p>O organizador do bolão ainda não cadastrou nenhuma partida.</p>
              </div>
            ) : (() => {
              // Helpers for grouping and dates
              const getSortableDateKey = (dateStr) => {
                const d = new Date(dateStr);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              };

              const getTodaySortableKey = () => {
                const d = new Date();
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              };

              const formatHeaderDate = (dateKey) => {
                const parts = dateKey.split('-');
                const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' });
                const formattedDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
                return `${capitalizedWeekday}, ${formattedDate}`;
              };

              const isSectionOpen = (key) => {
                if (sectionsOpen[key] !== undefined) {
                  return sectionsOpen[key];
                }
                if (key === 'live' || key === 'soon') {
                  return true;
                }
                return false;
              };

              const toggleSection = (key) => {
                setSectionsOpen(prev => ({
                  ...prev,
                  [key]: !prev[key]
                }));
              };

              const sorted = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));

              // Apply guess filter
              let filtered = sorted;
              if (guessFilter === 'guessed') {
                filtered = sorted.filter(match => match.userGuess !== null && match.userGuess !== undefined);
              } else if (guessFilter === 'missing') {
                filtered = sorted.filter(match => !match.userGuess);
              }

              if (filtered.length === 0) {
                return (
                  <div className="empty-box glass-panel">
                    <span className="empty-box-icon">🔍</span>
                    <h3>Nenhum jogo encontrado</h3>
                    <p>
                      Não encontramos nenhuma partida correspondente aos filtros selecionados.
                    </p>
                  </div>
                );
              }

              const todaySortableKey = getTodaySortableKey();
              const liveMatches = [];
              const soonMatches = [];
              const otherDaysMap = {}; // 'YYYY-MM-DD' -> Array of matches
              const finishedMap = {}; // 'YYYY-MM-DD' -> Array of matches

              filtered.forEach(match => {
                const sortableKey = getSortableDateKey(match.date);
                
                if (match.status === 'live') {
                  liveMatches.push(match);
                } else if (match.status === 'finished') {
                  if (!finishedMap[sortableKey]) {
                    finishedMap[sortableKey] = [];
                  }
                  finishedMap[sortableKey].push(match);
                } else {
                  if (sortableKey === todaySortableKey) {
                    soonMatches.push(match);
                  } else {
                    if (!otherDaysMap[sortableKey]) {
                      otherDaysMap[sortableKey] = [];
                    }
                    otherDaysMap[sortableKey].push(match);
                  }
                }
              });

              const sortedLive = liveMatches;
              const sortedSoon = soonMatches;
              const sortedOtherDaysKeys = Object.keys(otherDaysMap).sort();
              const sortedFinishedKeys = Object.keys(finishedMap).sort().reverse();

              const renderMatchCard = (match) => {
                const hasStarted = new Date(match.date) < new Date() || match.status === 'live';
                const isFinished = match.status === 'finished';
                
                const colorsA = getTeamColors(match.teamA);
                const colorsB = getTeamColors(match.teamB);
                
                const cardStyle = {
                  '--team-a-bg': colorsA.bg,
                  '--team-a-text': colorsA.text,
                  '--team-b-bg': colorsB.bg,
                  '--team-b-text': colorsB.text,
                  'cursor': 'pointer'
                };

                const otherGuesses = match.otherGuesses || [];
                const hasGuesses = otherGuesses.length > 0;
                
                return (
                  <div 
                    key={match.id} 
                    className={`match-card${match.status === 'live' ? ' match-card-live' : ''}`} 
                    style={cardStyle}
                    onClick={() => setActiveMatchDetails(match)}
                  >
                    {/* Header bar (glass panel) */}
                    <div className="match-card-header">
                      <span className="match-card-header-date">
                        📅 {formatDate(match.date)}
                        {match.stadiumName && ` • 🏟️ ${match.stadiumName}`}
                      </span>
                      <div className="match-card-header-right">
                        <span className={`match-badge ${match.status}`}>
                          <MatchClock match={match} customFinishedText="Encerrado" customPendingText="Aberto" prefix="• " />
                        </span>
                        <ExternalLink size={14} className="match-card-expand-icon" />
                      </div>
                    </div>

                    {/* Main Scoreboard Body */}
                    <div className="match-card-body">
                      <div className="match-card-teams-row">
                        <div className="team-side team-a">
                          {renderTeamFlag(match.teamA, "team-flag-split", match.teamALogo)}
                          <span className="team-name-split" title={match.teamA}>{match.teamA}</span>
                        </div>

                        <div className="scoreboard-center">
                          {isFinished || match.status === 'live' ? (
                            <div className="score-display-split">
                              <span className="score-num-split" style={match.status === 'live' ? { color: '#ef4444' } : {}}>{match.scoreA}</span>
                              <span className="score-divider-split">-</span>
                              <span className="score-num-split" style={match.status === 'live' ? { color: '#ef4444' } : {}}>{match.scoreB}</span>
                            </div>
                          ) : (
                            <div className="score-display-split vs">
                              <span>VS</span>
                            </div>
                          )}
                        </div>

                        <div className="team-side team-b">
                          <span className="team-name-split" title={match.teamB}>{match.teamB}</span>
                          {renderTeamFlag(match.teamB, "team-flag-split", match.teamBLogo)}
                        </div>
                      </div>

                      <div className="match-card-center-guess">
                        {match.userGuess ? (
                          <div className="user-guess-box-row">
                            <span className="guess-label">Palpite:</span>
                            <span className="guess-value">{match.userGuess.scoreA} x {match.userGuess.scoreB}</span>
                            {match.userGuess.status === 'pending' && (
                              <span className="indicator-badge pending guess-status-badge">⏳ Pendente</span>
                            )}
                            {match.userGuess.status === 'rejected' && (
                              <span className="indicator-badge missed guess-status-badge">❌ Rejeitado</span>
                            )}
                            {isFinished && (!match.userGuess.status || match.userGuess.status === 'approved') && (
                              <span className="guess-points">+{match.userGuess.points} pts</span>
                            )}
                            {match.status === 'live' && (!match.userGuess.status || match.userGuess.status === 'approved') && (
                              <span className="guess-points live-points" title="Pontos parciais neste momento">
                                +{calculateLivePoints(match.userGuess.scoreA, match.userGuess.scoreB, match.scoreA, match.scoreB)} pts
                              </span>
                            )}
                          </div>
                        ) : (
                          !hasStarted ? (
                            <span className="indicator-badge pending">⏳ Sem Palpite</span>
                          ) : (
                            <span className="indicator-badge missed">❌ Sem Palpite</span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Footer marquee panel */}
                    {hasGuesses ? (
                      <MatchMarquee
                        items={otherGuesses}
                        renderItem={(g) => (
                          <>
                            👤 <strong>{g.userName}</strong>: {g.scoreA}x{g.scoreB}
                            {isFinished && <span className="marquee-points"> (+{g.points} pts)</span>}
                            {match.status === 'live' && (
                              <span className="marquee-points live-points">
                                {' '}(+{calculateLivePoints(g.scoreA, g.scoreB, match.scoreA, match.scoreB)} pts)
                              </span>
                            )}
                          </>
                        )}
                      />
                    ) : (
                      <div className="match-card-marquee-empty">
                        <span>👥 Nenhum palpite dos amigos ainda. Seja o primeiro!</span>
                      </div>
                    )}
                  </div>
                );
              };

              return (
                <div className="accordions-container">
                  {/* 1. AO VIVO */}
                  {sortedLive.length > 0 && (
                    <div className="accordion-section">
                      <button 
                        className="accordion-header live"
                        onClick={() => toggleSection('live')}
                      >
                        <div className="accordion-header-left">
                          <span className="live-indicator-dot"></span>
                          <span>Ao Vivo</span>
                          <span className="accordion-badge">
                            {sortedLive.length} {sortedLive.length === 1 ? 'jogo' : 'jogos'}
                          </span>
                        </div>
                        <ChevronDown size={18} className={`accordion-arrow ${isSectionOpen('live') ? 'open' : ''}`} />
                      </button>
                      
                      {isSectionOpen('live') && (
                        <div className="accordion-content">
                          <div className="matches-grid">
                            {sortedLive.map(match => renderMatchCard(match))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. DAQUI A POUQUINHO */}
                  {sortedSoon.length > 0 && (
                    <div className="accordion-section">
                      <button 
                        className="accordion-header soon"
                        onClick={() => toggleSection('soon')}
                      >
                        <div className="accordion-header-left">
                          <span>⚡</span>
                          <span>Daqui a pouquinho</span>
                          <span className="accordion-badge">
                            {sortedSoon.length} {sortedSoon.length === 1 ? 'jogo' : 'jogos'}
                          </span>
                        </div>
                        <ChevronDown size={18} className={`accordion-arrow ${isSectionOpen('soon') ? 'open' : ''}`} />
                      </button>
                      
                      {isSectionOpen('soon') && (
                        <div className="accordion-content">
                          <div className="matches-grid">
                            {sortedSoon.map(match => renderMatchCard(match))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. OUTROS DIAS (Ascending future dates) */}
                  {sortedOtherDaysKeys.map(dateKey => {
                    const sectionKey = `future-${dateKey}`;
                    const dayMatches = otherDaysMap[dateKey];
                    return (
                      <div key={dateKey} className="accordion-section">
                        <button 
                          className="accordion-header future"
                          onClick={() => toggleSection(sectionKey)}
                        >
                          <div className="accordion-header-left">
                            <span>📅</span>
                            <span>{formatHeaderDate(dateKey)}</span>
                            <span className="accordion-badge">
                              {dayMatches.length} {dayMatches.length === 1 ? 'jogo' : 'jogos'}
                            </span>
                          </div>
                          <ChevronDown size={18} className={`accordion-arrow ${isSectionOpen(sectionKey) ? 'open' : ''}`} />
                        </button>
                        
                        {isSectionOpen(sectionKey) && (
                          <div className="accordion-content">
                            <div className="matches-grid">
                              {dayMatches.map(match => renderMatchCard(match))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* 4. ENCERRADOS (Descending past dates) */}
                  {sortedFinishedKeys.length > 0 && (
                    <div className="accordion-section">
                      <button 
                        className="accordion-header finished"
                        onClick={() => toggleSection('finished')}
                      >
                        <div className="accordion-header-left">
                          <span>🏁</span>
                          <span>Jogos Encerrados</span>
                          <span className="accordion-badge">
                            {sortedFinishedKeys.reduce((acc, key) => acc + finishedMap[key].length, 0)} {sortedFinishedKeys.reduce((acc, key) => acc + finishedMap[key].length, 0) === 1 ? 'jogo' : 'jogos'}
                          </span>
                        </div>
                        <ChevronDown size={18} className={`accordion-arrow ${isSectionOpen('finished') ? 'open' : ''}`} />
                      </button>
                      
                      {isSectionOpen('finished') && (
                        <div className="sub-accordion-container">
                          {sortedFinishedKeys.map(dateKey => {
                            const subSectionKey = `past-${dateKey}`;
                            const pastMatches = finishedMap[dateKey];
                            return (
                              <div key={dateKey} className="sub-accordion-section">
                                <button 
                                  className={`sub-accordion-header ${isSectionOpen(subSectionKey) ? 'open' : ''}`}
                                  onClick={() => toggleSection(subSectionKey)}
                                >
                                  <span>{formatHeaderDate(dateKey)}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="accordion-badge">
                                      {pastMatches.length} {pastMatches.length === 1 ? 'jogo' : 'jogos'}
                                    </span>
                                    <ChevronDown size={14} className={`accordion-arrow ${isSectionOpen(subSectionKey) ? 'open' : ''}`} />
                                  </div>
                                </button>
                                
                                {isSectionOpen(subSectionKey) && (
                                  <div className="sub-accordion-content">
                                    <div className="matches-grid">
                                      {pastMatches.map(match => renderMatchCard(match))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {activeTab === 'ranking' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {showProjection ? "Projeção de Classificação" : "Tabela de Classificação"}
                {showProjection && (
                  <span className="live-projection-dot" style={{ margin: 0, padding: '2px 6px', fontSize: '11px', verticalAlign: 'middle' }}>
                    Simulado
                  </span>
                )}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => {
                    const nextVal = !showProjection;
                    setShowProjection(nextVal);
                    if (nextVal && !matches.some(m => m.status === 'live')) {
                      showToast('Nenhuma partida ao vivo no momento. A projeção exibe a pontuação atual.', 'info');
                    }
                  }} 
                  className={`btn ${showProjection ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '12.5px', 
                    padding: '6px 12px', 
                    height: '36px'
                  }}
                  title="Ver classificação simulada com os resultados parciais das partidas ao vivo"
                >
                  <Sparkles size={14} className={showProjection ? "animate-pulse" : ""} />
                  {showProjection ? "Projeção Ativa" : "Ver Projeção Ao Vivo"}
                  {matches.some(m => m.status === 'live') && (
                    <span 
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: '#ef4444', 
                        boxShadow: '0 0 8px #ef4444',
                        display: 'inline-block',
                        marginLeft: '4px'
                      }} 
                      className="animate-pulse" 
                      title="Partida ao vivo rolando!"
                    />
                  )}
                </button>
                <button 
                  onClick={() => {
                    fetchRanking();
                    fetchMatches(true);
                  }} 
                  className="btn btn-secondary btn-icon-only" 
                  title="Atualizar Classificação"
                  style={{ height: '36px', width: '36px', padding: '0' }}
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {(() => {
              const displayRanking = (() => {
                if (!showProjection) return ranking;
                return [...ranking].sort((a, b) => {
                  if (b.projectedPoints !== a.projectedPoints) {
                    return b.projectedPoints - a.projectedPoints;
                  }
                  if (b.projectedExactScores !== a.projectedExactScores) {
                    return b.projectedExactScores - a.projectedExactScores;
                  }
                  return b.totalGuesses - a.totalGuesses;
                });
              })();

              return !rankingLoaded ? (
                <div className="loading-box glass-panel">
                  <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--color-primary)' }} />
                  <p>Carregando classificação...</p>
                </div>
              ) : ranking.length === 0 ? (
                <div className="empty-box glass-panel">
                  <span className="empty-box-icon">🏆</span>
                  <h3>Nenhum ponto registrado ainda</h3>
                  <p>Os pontos aparecerão aqui assim que as partidas encerrarem.</p>
                </div>
              ) : (
                <div className="ranking-table-container glass-panel">
                  <table className="ranking-table">
                    <thead>
                      <tr>
                        <th className="ranking-position">Pos</th>
                        <th>Nome</th>
                        <th>Pontos</th>
                        <th style={{ textAlign: 'center' }}>Placar Exato (25)</th>
                        <th style={{ textAlign: 'center' }}>Saldo (18)</th>
                        <th style={{ textAlign: 'center' }}>Vencedor+Gols (15/12)</th>
                        <th style={{ textAlign: 'center' }}>Apenas Venc (10)</th>
                        <th style={{ textAlign: 'center' }}>Palpites</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRanking.map((row, index) => {
                        const pos = index + 1;
                        let medalClass = '';
                        if (pos === 1) medalClass = 'medal medal-gold';
                        else if (pos === 2) medalClass = 'medal medal-silver';
                        else if (pos === 3) medalClass = 'medal medal-bronze';

                        const pointsToDisplay = showProjection ? row.projectedPoints : row.totalPoints;
                        const exactToDisplay = showProjection ? row.projectedExactScores : row.exactScores;
                        const diffToDisplay = showProjection ? row.projectedWinnerDiff : row.winnerDiff;
                        const goalsToDisplay = showProjection ? row.projectedWinnerGoals : row.winnerGoals;
                        const onlyToDisplay = showProjection ? row.projectedWinnerOnly : row.winnerOnly;
                        const hasGain = showProjection && row.projectedPoints > row.totalPoints;

                        return (
                          <tr key={row.userId} className="ranking-row">
                            <td className="ranking-position">
                              {medalClass ? <span className={medalClass}>{pos}</span> : pos}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="ranking-name">{row.userName}</span>
                                {row.userName.toLowerCase() === user.name.toLowerCase() && (
                                  <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: '700', textTransform: 'uppercase' }}>Você</span>
                                )}
                                {row.pointsAdjustment !== 0 && (
                                  <span 
                                    style={{ 
                                      fontSize: '10px', 
                                      color: row.pointsAdjustment > 0 ? 'var(--color-success)' : 'var(--color-danger)', 
                                      fontWeight: '600' 
                                    }}
                                    title={`Ajuste manual: ${row.pointsAdjustment > 0 ? '+' : ''}${row.pointsAdjustment} pts`}
                                  >
                                    ({row.pointsAdjustment > 0 ? '+' : ''}{row.pointsAdjustment} adj)
                                  </span>
                                )}
                                {user.role === 'admin' && viewMode === 'admin' && (
                                  <button
                                    onClick={() => {
                                      setSelectedUserForAdjustment(row);
                                      setAdjustmentForm({ pointsAdjustment: row.pointsAdjustment || 0 });
                                      setAdjustmentModalOpen(true);
                                    }}
                                    className="btn-edit-points"
                                    title="Ajustar Pontuação Manualmente"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--text-muted)',
                                      cursor: 'pointer',
                                      padding: '2px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '4px',
                                      transition: 'all 0.2s',
                                      marginLeft: '4px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                  >
                                    <Settings size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="ranking-points">
                                {pointsToDisplay} pts
                                {hasGain && (
                                  <span className="live-projection-dot" title="Ganhando pontos com jogos ao vivo">+{(row.projectedPoints - row.totalPoints)}</span>
                                )}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="ranking-stat-pill" style={{ color: '#fbbf24' }}>{exactToDisplay}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="ranking-stat-pill" style={{ color: '#a7f3d0' }}>{diffToDisplay}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="ranking-stat-pill" style={{ color: '#93c5fd' }}>{goalsToDisplay}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="ranking-stat-pill" style={{ color: '#e2e8f0' }}>{onlyToDisplay}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span>{row.totalGuesses}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 3: League Standings & Bracket */}
        {activeTab === 'standings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Tabela & Mata-mata 🏆</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                  Acompanhe em tempo real a tabela e os resultados dos times da competição.
                </p>
              </div>
              <button 
                onClick={() => fetchLeagueStandings()}
                className="btn btn-secondary" 
                disabled={loadingStandings}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={14} className={loadingStandings ? "animate-spin" : ""} />
                Atualizar Classificação
              </button>
            </div>

            {loadingStandings && (
              <div className="stats-loading-box glass-panel fade-in" style={{ padding: '60px 24px' }}>
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>Buscando classificação oficial...</p>
              </div>
            )}

            {!loadingStandings && leagueStandings && leagueStandings.children && (
              <div className="fade-in">
                {renderStandingsTableDetailed(leagueStandings.children)}
              </div>
            )}

            {!loadingStandings && (!leagueStandings || !leagueStandings.children) && (
              <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p className="no-data-text">Nenhuma tabela de classificação disponível no momento.</p>
              </div>
            )}

            {/* Visual tournament bracket (knockout stage) */}
            {!loadingStandings && renderBracket()}
          </div>
        )}

        {/* Tab 4: Admin Panel (Only for admins) */}
        {activeTab === 'admin' && user.role === 'admin' && viewMode === 'admin' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* CARD: Pending Guesses Approval */}
            <div className="admin-config-card glass-panel" style={{ marginBottom: '24px' }}>
              <h3 className="admin-config-title">Aprovação de Palpites em Andamento</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                Jogadores palpitando com bola rolando. Aprove ou rejeite os palpites abaixo.
              </p>
              
              {pendingGuesses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  Nenhum palpite aguardando aprovação para este campeonato no momento.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingGuesses.map(g => (
                    <div 
                      key={g.id} 
                      style={{ 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        background: 'rgba(255, 255, 255, 0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <strong style={{ color: 'var(--color-primary)' }}>{g.userName}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            {new Date(g.updatedAt || g.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="indicator-badge pending">Aguardando Avaliação</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                        <div style={{ fontSize: '13px' }}>
                          <strong>{g.teamA}</strong> vs <strong>{g.teamB}</strong>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                          Palpite: {g.scoreA} x {g.scoreB}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div>⏱️ Minuto do palpite: <strong>{g.guessClock || 'Não disponível'}</strong></div>
                        <div>⚽ Placar no momento: <strong>{g.matchScoreAtGuess || '0-0'}</strong></div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button 
                          onClick={() => handleApproveGuess(g.id)} 
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12px', background: '#10b981', borderColor: '#10b981' }}
                        >
                          Aprovar
                        </button>
                        <button 
                          onClick={() => handleRejectGuess(g.id)} 
                          className="btn btn-danger"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                        >
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-config-card glass-panel">
              <h3 className="admin-config-title">Painel de Administração do Bolão</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                Gerencie os dados, faça backup para maior segurança ou limpe as informações para começar um novo bolão do zero.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Cadastro de Jogos</h4>
                  <button onClick={() => setNewMatchModal(true)} className="btn btn-primary">
                    <Plus size={16} /> Cadastrar Nova Partida
                  </button>
                </div>

                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Sincronização com API</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Carregue automaticamente e sincronize os jogos e resultados do campeonato selecionado atualmente no seletor da barra superior.
                  </p>
                  <button onClick={handleSyncCopa} className="btn btn-secondary" style={{ gap: '8px' }} disabled={loading}>
                    <Sparkles size={16} style={{ color: 'var(--color-secondary)' }} /> Sincronizar Campeonato Atual
                  </button>
                </div>

                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Simulador de Jogos em Tempo Real</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Simule o início, gols e encerramento de partidas do campeonato selecionado. Veja os pontos e o ranking atualizarem em tempo real no navegador!
                  </p>
                  <button onClick={handleSimulateLive} className="btn btn-secondary" style={{ gap: '8px' }} disabled={loading}>
                    <Clock size={16} style={{ color: 'var(--color-danger)' }} /> Simular Acontecimento no Jogo
                  </button>
                </div>

                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Recalcular Todas as Pontuações</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Recalcula os pontos de todos os palpites deste campeonato com base nos placares reais das partidas terminadas. Útil para corrigir eventuais inconsistências.
                  </p>
                  <button onClick={handleRecalculatePoints} className="btn btn-secondary" style={{ gap: '8px' }} disabled={loading}>
                    <RefreshCw size={16} style={{ color: 'var(--color-primary)' }} /> Recalcular Pontuações Oficialmente
                  </button>
                </div>

                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Backup e Sincronização</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Baixe um arquivo JSON contendo todas as partidas, palpites e usuários. Útil para garantir que nenhuma pontuação seja perdida ou para migrar de banco de dados.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={handleExportData} className="btn btn-secondary">
                      <Download size={16} /> Exportar Backup JSON
                    </button>
                    
                    <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                      <Upload size={16} /> Importar Backup JSON
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleImportData} 
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-danger)' }}>Zona Perigosa</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Apagar todos os dados do bolão. Esta ação é irreversível e resetará o banco de dados.
                  </p>
                  <button 
                    onClick={async () => {
                      if (window.confirm('ATENÇÃO: Você tem certeza absoluta de que deseja limpar TODO o bolão? Todos os jogos, palpites e pontuações serão apagados para sempre.')) {
                        setLoading(true);
                        try {
                          const res = await fetch('/api/data/import', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              data: { matches: [], guesses: [], users: [] },
                              requesterRole: user.role
                            })
                          });
                          if (res.ok) {
                            showToast('Todo o banco de dados foi resetado!');
                            fetchMatches();
                            fetchRanking();
                          } else {
                            showToast('Erro ao limpar banco.', 'error');
                          }
                        } catch (e) {
                          showToast('Erro ao conectar ao servidor.', 'error');
                        } finally {
                          setLoading(false);
                        }
                      }
                    }} 
                    className="btn btn-danger"
                  >
                    Resetar Todo o Bolão
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px 0', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        <p>Bolão dos Amigos © {new Date().getFullYear()} - Feito com ⚽ para rodar no Vercel</p>
      </footer>

      {/* MODAL: Place/Edit Guess */}
      {guessModal.isOpen && (
        <div className="modal-overlay" onClick={() => setGuessModal({ isOpen: false, match: null })}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Palpite para o jogo</h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderTeamFlag(guessModal.match.teamA, "modal-team-flag", guessModal.match.teamALogo)}
                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '8px' }}>{guessModal.match.teamA}</div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontWeight: '800' }}>VS</span>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderTeamFlag(guessModal.match.teamB, "modal-team-flag", guessModal.match.teamBLogo)}
                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '8px' }}>{guessModal.match.teamB}</div>
              </div>
            </div>

            <form onSubmit={handleGuessSubmit}>
              <div className="form-row-guess">
                <div className="guess-input-container">
                  <span className="guess-input-label">{guessModal.match.teamA}</span>
                  <input 
                    type="number" 
                    min="0"
                    className="form-input form-input-number" 
                    required 
                    value={guessForm.scoreA}
                    onChange={e => setGuessForm(prev => ({ ...prev, scoreA: e.target.value }))}
                  />
                </div>
                
                <span className="guess-separator">x</span>

                <div className="guess-input-container">
                  <span className="guess-input-label">{guessModal.match.teamB}</span>
                  <input 
                    type="number" 
                    min="0"
                    className="form-input form-input-number" 
                    required 
                    value={guessForm.scoreB}
                    onChange={e => setGuessForm(prev => ({ ...prev, scoreB: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  Confirmar Palpite
                </button>
                <button 
                  type="button" 
                  onClick={() => setGuessModal({ isOpen: false, match: null })} 
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Place Guess for Another User (Admin only) */}
      {adminGuessModal.isOpen && user.role === 'admin' && viewMode === 'admin' && (
        <div className="modal-overlay" onClick={() => setAdminGuessModal({ isOpen: false, match: null })}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Palpitar por outro participante</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
              Como organizador, você pode registrar ou editar o palpite de qualquer pessoa a qualquer momento.
            </p>
            
            <form onSubmit={handleAdminGuessSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="admin-guess-user">Selecionar Participante</label>
                <select 
                  id="admin-guess-user"
                  className="form-input" 
                  required
                  value={adminGuessForm.userName}
                  onChange={e => setAdminGuessForm(prev => ({ ...prev, userName: e.target.value }))}
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                >
                  <option value="">-- Selecione o participante --</option>
                  {ranking.map(r => (
                    <option key={r.userId} value={r.userName}>{r.userName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {renderTeamFlag(adminGuessModal.match.teamA, "modal-team-flag", adminGuessModal.match.teamALogo)}
                  <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '8px' }}>{adminGuessModal.match.teamA}</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontWeight: '800' }}>VS</span>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {renderTeamFlag(adminGuessModal.match.teamB, "modal-team-flag", adminGuessModal.match.teamBLogo)}
                  <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '8px' }}>{adminGuessModal.match.teamB}</div>
                </div>
              </div>

              <div className="form-row-guess">
                <div className="guess-input-container">
                  <span className="guess-input-label">{adminGuessModal.match.teamA}</span>
                  <input 
                    type="number" 
                    min="0"
                    className="form-input form-input-number" 
                    required 
                    value={adminGuessForm.scoreA}
                    onChange={e => setAdminGuessForm(prev => ({ ...prev, scoreA: e.target.value }))}
                  />
                </div>
                
                <span className="guess-separator">x</span>

                <div className="guess-input-container">
                  <span className="guess-input-label">{adminGuessModal.match.teamB}</span>
                  <input 
                    type="number" 
                    min="0"
                    className="form-input form-input-number" 
                    required 
                    value={adminGuessForm.scoreB}
                    onChange={e => setAdminGuessForm(prev => ({ ...prev, scoreB: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  Confirmar Palpite
                </button>
                <button 
                  type="button" 
                  onClick={() => setAdminGuessModal({ isOpen: false, match: null })} 
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Adjust User Points (Admin only) */}
      {adjustmentModalOpen && selectedUserForAdjustment && user.role === 'admin' && viewMode === 'admin' && (
        <div className="modal-overlay" onClick={() => { setAdjustmentModalOpen(false); setSelectedUserForAdjustment(null); }}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Ajustar Pontuação</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
              Ajuste manualmente a pontuação de <strong>{selectedUserForAdjustment.userName}</strong>.
              Este valor será somado ou subtraído da pontuação calculada a partir dos palpites.
            </p>
            
            <form onSubmit={handleAdjustmentSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="points-adjustment-input">Pontos de Ajuste (Extras ou Penalidades)</label>
                <input 
                  id="points-adjustment-input"
                  type="number"
                  className="form-input" 
                  required 
                  value={adjustmentForm.pointsAdjustment}
                  onChange={e => setAdjustmentForm({ pointsAdjustment: e.target.value })}
                  placeholder="Ex: 5 para adicionar, -5 para subtrair"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  Digite um número positivo para dar pontos extras (ex: 5) ou negativo para tirar (ex: -3). Use 0 para remover qualquer ajuste.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  Salvar Ajuste
                </button>
                <button 
                  type="button" 
                  onClick={() => { setAdjustmentModalOpen(false); setSelectedUserForAdjustment(null); }} 
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Set Match Result (Admin only) */}
      {resultModal.isOpen && (
        <div className="modal-overlay" onClick={() => setResultModal({ isOpen: false, match: null })}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Encerrar Partida (Placar Oficial)</h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderTeamFlag(resultModal.match.teamA, "modal-team-flag", resultModal.match.teamALogo)}
                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '8px' }}>{resultModal.match.teamA}</div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontWeight: '800' }}>VS</span>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderTeamFlag(resultModal.match.teamB, "modal-team-flag", resultModal.match.teamBLogo)}
                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '8px' }}>{resultModal.match.teamB}</div>
              </div>
            </div>

            <form onSubmit={handleResultSubmit}>
              <div className="form-row-guess">
                <div className="guess-input-container">
                  <span className="guess-input-label">{resultModal.match.teamA}</span>
                  <input 
                    type="number" 
                    min="0"
                    className="form-input form-input-number" 
                    required 
                    value={resultForm.scoreA}
                    onChange={e => setResultForm(prev => ({ ...prev, scoreA: e.target.value }))}
                  />
                </div>
                
                <span className="guess-separator">x</span>

                <div className="guess-input-container">
                  <span className="guess-input-label">{resultModal.match.teamB}</span>
                  <input 
                    type="number" 
                    min="0"
                    className="form-input form-input-number" 
                    required 
                    value={resultForm.scoreB}
                    onChange={e => setResultForm(prev => ({ ...prev, scoreB: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  Salvar Placar & Calcular Pontos
                </button>
                <button 
                  type="button" 
                  onClick={() => setResultModal({ isOpen: false, match: null })} 
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create New Match (Admin only) */}
      {newMatchModal && (
        <div className="modal-overlay" onClick={() => setNewMatchModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Cadastrar Novo Jogo</h3>
            
            <form onSubmit={handleCreateMatchSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="match-teamA">Time A</label>
                <input 
                  id="match-teamA"
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Brasil" 
                  required
                  value={newMatchForm.teamA}
                  onChange={e => setNewMatchForm(prev => ({ ...prev, teamA: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="match-teamB">Time B</label>
                <input 
                  id="match-teamB"
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Argentina" 
                  required
                  value={newMatchForm.teamB}
                  onChange={e => setNewMatchForm(prev => ({ ...prev, teamB: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="match-date">Data e Hora do Jogo</label>
                <input 
                  id="match-date"
                  type="datetime-local" 
                  className="form-input" 
                  required
                  value={newMatchForm.date}
                  onChange={e => setNewMatchForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  Salvar Jogo
                </button>
                <button 
                  type="button" 
                  onClick={() => setNewMatchModal(false)} 
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN: Match Details */}
      {activeMatchDetails && (
        <div className="match-details-fullscreen animate-fade-in">
          <div className="fullscreen-header-nav">
            <span className="group-badge">Grupo {activeMatchDetails.group || 'Geral'} • Rodada {activeMatchDetails.matchday || '1'}</span>
            <div className="fullscreen-header-right">
              <button className="close-btn" onClick={() => { setActiveMatchDetails(null); setMatchStats(null); setDetailsTab('palpites'); }} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="fullscreen-content-container">
            {/* Permanent Match Header Card */}
            {(() => {
              const colorsA = getTeamColors(activeMatchDetails.teamA);
              const colorsB = getTeamColors(activeMatchDetails.teamB);
              const headerCardStyle = {
                '--team-a-bg': colorsA.bg,
                '--team-a-text': colorsA.text,
                '--team-b-bg': colorsB.bg,
                '--team-b-text': colorsB.text,
              };
              return (
                <div className="match-detail-header-card glass-panel" style={headerCardStyle}>
                  <div className="match-time-status">
                    <span className="time-text">
                      📅 {formatDate(activeMatchDetails.date)} 
                      {activeMatchDetails.stadiumName && ` • 🏟️ ${activeMatchDetails.stadiumName}`}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {activeMatchDetails.manuallyUpdated && (
                        <span className="match-badge finished" style={{ background: '#f59e0b', color: '#fff' }}>
                          Manual
                        </span>
                      )}
                      <span className={`match-badge ${activeMatchDetails.status}`}>
                        <MatchClock match={activeMatchDetails} customFinishedText="Encerrado" customPendingText="Aberto" prefix="• " />
                      </span>
                    </div>
                  </div>

                  <div className="details-scoreboard">
                    <div className="team-column team-side team-a">
                      {renderTeamFlag(activeMatchDetails.teamA, "details-team-flag", activeMatchDetails.teamALogo)}
                      <span className="details-team-name team-name-split" style={{ marginTop: '8px' }}>{activeMatchDetails.teamA}</span>
                    </div>

                    <div className="details-score-box scoreboard-center">
                      {activeMatchDetails.status === 'finished' || activeMatchDetails.status === 'live' ? (
                        <div className="score-numbers score-display-split">
                          <span className="score-num score-num-split">{activeMatchDetails.scoreA}</span>
                          <span className="score-divider score-divider-split">-</span>
                          <span className="score-num score-num-split">{activeMatchDetails.scoreB}</span>
                        </div>
                      ) : (
                        <div className="score-vs score-display-split vs">VS</div>
                      )}
                    </div>

                    <div className="team-column team-side team-b">
                      {renderTeamFlag(activeMatchDetails.teamB, "details-team-flag", activeMatchDetails.teamBLogo)}
                      <span className="details-team-name team-name-split" style={{ marginTop: '8px' }}>{activeMatchDetails.teamB}</span>
                    </div>
                  </div>

                  {(activeMatchDetails.status === 'finished' || activeMatchDetails.status === 'live') && (() => {
                    const homeScorersList = matchStats ? getScorersFromStats(matchStats, true) : parseScorers(activeMatchDetails.home_scorers);
                    const awayScorersList = matchStats ? getScorersFromStats(matchStats, false) : parseScorers(activeMatchDetails.away_scorers);
                    return (
                      <div className="scorers-section">
                        <div className="scorers-grid">
                          <div className="scorers-list home-scorers">
                            {homeScorersList.map((scorer, i) => (
                              <div key={i} className="scorer-item">⚽ {scorer}</div>
                            ))}
                            {homeScorersList.length === 0 && <div className="no-scorers">-</div>}
                          </div>
                          <div className="scorers-divider"></div>
                          <div className="scorers-list away-scorers">
                            {awayScorersList.map((scorer, i) => (
                              <div key={i} className="scorer-item">{scorer} ⚽</div>
                            ))}
                            {awayScorersList.length === 0 && <div className="no-scorers">-</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {/* Tabs Navigation */}
            <div className="details-tabs-container">
              <div className="details-tabs">
                <button className={`tab-btn ${detailsTab === 'palpites' ? 'active' : ''}`} onClick={() => setDetailsTab('palpites')}>Palpites</button>
                <button className={`tab-btn ${detailsTab === 'estatisticas' ? 'active' : ''}`} onClick={() => setDetailsTab('estatisticas')}>Estatísticas</button>
                <button className={`tab-btn ${detailsTab === 'escalacoes' ? 'active' : ''}`} onClick={() => setDetailsTab('escalacoes')}>Escalações</button>
                <button className={`tab-btn ${detailsTab === 'historico' ? 'active' : ''}`} onClick={() => setDetailsTab('historico')}>Histórico</button>
                <button className={`tab-btn ${detailsTab === 'lances' ? 'active' : ''}`} onClick={() => setDetailsTab('lances')}>Lances</button>
                <button className={`tab-btn ${detailsTab === 'ficha' ? 'active' : ''}`} onClick={() => setDetailsTab('ficha')}>Info & Odds</button>
              </div>
            </div>

            {/* Loading Indicator */}
            {loadingStats && (
              <div className="stats-loading-box glass-panel fade-in">
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>Buscando informações em tempo real...</p>
              </div>
            )}

            {/* Tab: Palpites */}
            {!loadingStats && detailsTab === 'palpites' && (
              <div className="tab-pane-content fade-in">
                <div className="user-guess-details-panel glass-panel">
                  {activeMatchDetails.userGuess ? (
                    <div className="guess-info-alert">
                      <span className="alert-title">Seu palpite registrado:</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <div className="guess-score-pill">
                          {activeMatchDetails.userGuess.scoreA} x {activeMatchDetails.userGuess.scoreB}
                        </div>
                        {activeMatchDetails.userGuess.status === 'pending' && (
                          <span className="indicator-badge pending">⏳ Pendente</span>
                        )}
                        {activeMatchDetails.userGuess.status === 'rejected' && (
                          <span className="indicator-badge missed">❌ Rejeitado</span>
                        )}
                      </div>
                      {activeMatchDetails.status === 'finished' && (!activeMatchDetails.userGuess.status || activeMatchDetails.userGuess.status === 'approved') && (
                        <div className="guess-points-earned">
                          Pontos ganhos: <strong style={{ color: 'var(--color-primary)' }}>+{activeMatchDetails.userGuess.points} pts</strong>
                        </div>
                      )}
                      {activeMatchDetails.status === 'live' && (!activeMatchDetails.userGuess.status || activeMatchDetails.userGuess.status === 'approved') && (
                        <div className="guess-points-earned live-points-container">
                          Ganhando no momento: <strong style={{ color: '#10b981' }}>+{calculateLivePoints(activeMatchDetails.userGuess.scoreA, activeMatchDetails.userGuess.scoreB, activeMatchDetails.scoreA, activeMatchDetails.scoreB)} pts</strong>
                        </div>
                      )}
                      {activeMatchDetails.status !== 'finished' && (
                        (new Date(activeMatchDetails.date) >= new Date() && activeMatchDetails.status !== 'live') && (
                        <button 
                          onClick={() => {
                            setGuessModal({ isOpen: true, match: activeMatchDetails });
                            setGuessForm({ 
                              scoreA: activeMatchDetails.userGuess.scoreA.toString(), 
                              scoreB: activeMatchDetails.userGuess.scoreB.toString() 
                            });
                            setActiveMatchDetails(null);
                          }}
                          className="btn btn-secondary"
                          style={{ marginTop: '10px', width: '100%' }}
                        >
                          Alterar Palpite
                        </button>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="no-guess-alert">
                      {activeMatchDetails.status !== 'finished' ? (
                        <div>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Você ainda não deu seu palpite para este jogo!</p>
                          <button 
                            onClick={() => {
                              setGuessModal({ isOpen: true, match: activeMatchDetails });
                              setGuessForm({ scoreA: '', scoreB: '' });
                              setActiveMatchDetails(null);
                            }}
                            className="btn btn-primary"
                            style={{ marginTop: '10px', width: '100%' }}
                          >
                            Dar Palpite
                          </button>
                        </div>
                      ) : (
                        <p style={{ color: 'var(--color-danger)', fontSize: '13px', fontWeight: '700' }}>Você não palpitou a tempo para este jogo.</p>
                      )}
                    </div>
                  )}
                  {user.role === 'admin' && viewMode === 'admin' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '12px' }}>
                      <button 
                        onClick={() => {
                          setResultModal({ isOpen: true, match: activeMatchDetails });
                          setResultForm({ 
                            scoreA: activeMatchDetails.scoreA !== null && activeMatchDetails.scoreA !== undefined ? activeMatchDetails.scoreA.toString() : '', 
                            scoreB: activeMatchDetails.scoreB !== null && activeMatchDetails.scoreB !== undefined ? activeMatchDetails.scoreB.toString() : '' 
                          });
                        }}
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                      >
                        {activeMatchDetails.status === 'finished' ? 'Alterar Placar Oficial' : 'Inserir Placar Oficial'}
                      </button>

                      {activeMatchDetails.manuallyUpdated && (
                        <button 
                          onClick={() => {
                            handleUnlockSync(activeMatchDetails.id);
                          }}
                          className="btn"
                          style={{ 
                            width: '100%', 
                            fontSize: '11px', 
                            padding: '6px 12px', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444', 
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--border-radius-sm, 4px)',
                            cursor: 'pointer'
                          }}
                        >
                          Reativar Sincronização Automática
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          setAdminGuessModal({ isOpen: true, match: activeMatchDetails });
                          setAdminGuessForm({ userName: '', scoreA: '', scoreB: '' });
                          setActiveMatchDetails(null);
                        }}
                        className="btn btn-secondary"
                        style={{ width: '100%', borderStyle: 'dashed', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                      >
                        Palpitar por Outro
                      </button>
                    </div>
                  )}
                </div>

                <div className="other-bets-section glass-panel">
                  <h4 className="section-title">Palpites da Galera 👥</h4>
                  {(new Date(activeMatchDetails.date) < new Date() || activeMatchDetails.status === 'live') ? (
                    activeMatchDetails.otherGuesses && activeMatchDetails.otherGuesses.length > 0 ? (
                      <div className="other-guesses-grid">
                        {activeMatchDetails.otherGuesses.map((g, idx) => (
                          <div key={idx} className="other-guess-card">
                            <span className="other-guess-user">{g.userName}</span>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                              <span className="other-guess-score">{g.scoreA} x {g.scoreB}</span>
                              {activeMatchDetails.status === 'finished' && (
                                <span className="other-guess-points">+{g.points} pts</span>
                              )}
                              {activeMatchDetails.status === 'live' && (
                                <span className="other-guess-points live-points">
                                  +{calculateLivePoints(g.scoreA, g.scoreB, activeMatchDetails.scoreA, activeMatchDetails.scoreB)} pts
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data-text">Ninguém palpitou neste jogo.</p>
                    )
                  ) : (
                    <div className="bets-locked-message">
                      🔒 Os palpites dos outros participantes ficarão visíveis assim que o jogo começar!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Estatísticas */}
            {!loadingStats && detailsTab === 'estatisticas' && (
              <div className="tab-pane-content fade-in">
                <div className="stats-section glass-panel">
                  <h4 className="section-title" style={{ marginBottom: '20px' }}>Estatísticas de Jogo 📊</h4>
                  {getStatsComparisonList().length > 0 ? (
                    <div className="stats-list-wrapper">
                      {getStatsComparisonList().map((item, idx) => {
                        const numA = parseStatValue(item.valA);
                        const numB = parseStatValue(item.valB);
                        const total = numA + numB;
                        
                        let pctA = 50;
                        let pctB = 50;
                        if (item.name.toLowerCase().includes('pct') || item.valA.includes('%') || item.valB.includes('%')) {
                          pctA = numA;
                          pctB = numB;
                        } else if (total > 0) {
                          pctA = (numA / total) * 100;
                          pctB = (numB / total) * 100;
                        } else {
                          pctA = 0;
                          pctB = 0;
                        }

                        const teamAColor = matchStats.boxscore?.teams?.[0]?.team?.color ? `#${matchStats.boxscore.teams[0].team.color}` : 'var(--color-primary)';
                        const teamBColor = matchStats.boxscore?.teams?.[1]?.team?.color ? `#${matchStats.boxscore.teams[1].team.color}` : '#3b82f6';

                        return (
                          <div key={idx} className="stat-row-item">
                            <div className="stat-label-row">
                              <span className="stat-val-a" style={{ color: pctA > pctB ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: pctA > pctB ? '700' : '500' }}>{item.valA}</span>
                              <span className="stat-name-label">{item.label}</span>
                              <span className="stat-val-b" style={{ color: pctB > pctA ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: pctB > pctA ? '700' : '500' }}>{item.valB}</span>
                            </div>
                            <div className="stat-bar-track">
                              <div className="stat-bar-fill-a" style={{ width: `${pctA}%`, backgroundColor: teamAColor }}></div>
                              <div className="stat-bar-fill-b" style={{ width: `${pctB}%`, backgroundColor: teamBColor }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="no-data-text">Estatísticas indisponíveis para esta partida.</p>
                  )}
                </div>

                {/* Individual Leaders highlights */}
                {matchStats?.leaders && matchStats.leaders.length > 0 && (
                  <div className="match-leaders-section glass-panel" style={{ marginTop: '20px' }}>
                    <h4 className="section-title">Líderes Individuais 🏃‍♂️</h4>
                    <div className="team-leaders-grid">
                      {renderLeaderCategories(matchStats.leaders[0], activeMatchDetails.teamA)}
                      {renderLeaderCategories(matchStats.leaders[1], activeMatchDetails.teamB)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Escalações */}
            {!loadingStats && detailsTab === 'escalacoes' && (
              <div className="tab-pane-content fade-in">
                {matchStats?.rosters && (matchStats.rosters['0'] || matchStats.rosters['1']) ? (
                  <div>
                    {/* Coaches list if available */}
                    {(matchStats.rosters['0']?.coach || matchStats.rosters['1']?.coach) && (
                      <div className="coaches-comparison-card glass-panel" style={{ marginBottom: '20px', padding: '12px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Técnico do {activeMatchDetails.teamA}</span>
                            <strong style={{ fontSize: '13px' }}>{matchStats.rosters['0']?.coach?.displayName || '-'}</strong>
                          </div>
                          <span style={{ fontSize: '18px' }}>📋</span>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Técnico do {activeMatchDetails.teamB}</span>
                            <strong style={{ fontSize: '13px' }}>{matchStats.rosters['1']?.coach?.displayName || '-'}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="rosters-comparison-grid">
                      {renderRosterList(matchStats.rosters['0'] || matchStats.rosters[0], activeMatchDetails.teamA)}
                      {renderRosterList(matchStats.rosters['1'] || matchStats.rosters[1], activeMatchDetails.teamB)}
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                    <p className="no-data-text">Escalações ainda não divulgadas para este confronto.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Histórico */}
            {!loadingStats && detailsTab === 'historico' && (
              <div className="tab-pane-content fade-in">
                {/* Recent Form Section */}
                <div className="form-comparison-section glass-panel">
                  <h4 className="section-title" style={{ marginBottom: '16px' }}>Desempenho Recente (Últimos Jogos) 📈</h4>
                  <div className="form-columns-grid">
                    <div className="team-form-column">
                      <h5 className="form-team-title">
                        {renderTeamFlag(activeMatchDetails.teamA, "form-team-flag", activeMatchDetails.teamALogo)}
                        <span>{activeMatchDetails.teamA}</span>
                      </h5>
                      {matchStats?.lastFiveGames?.[0] ? renderFormList(matchStats.lastFiveGames[0]) : <p className="no-data-text">Forma indisponível.</p>}
                    </div>

                    <div className="form-divider-vertical"></div>

                    <div className="team-form-column">
                      <h5 className="form-team-title">
                        {renderTeamFlag(activeMatchDetails.teamB, "form-team-flag", activeMatchDetails.teamBLogo)}
                        <span>{activeMatchDetails.teamB}</span>
                      </h5>
                      {matchStats?.lastFiveGames?.[1] ? renderFormList(matchStats.lastFiveGames[1]) : <p className="no-data-text">Forma indisponível.</p>}
                    </div>
                  </div>
                </div>

                {/* Head-to-Head records */}
                {matchStats?.headToHeadGames && matchStats.headToHeadGames[0]?.events?.length > 0 && (
                  <div className="h2h-history-section glass-panel" style={{ marginTop: '20px' }}>
                    <h4 className="section-title">Confrontos Diretos Recentes ⚔️</h4>
                    <div className="h2h-list">
                      {matchStats.headToHeadGames[0].events.map((e, idx) => (
                        <div key={idx} className="h2h-match-card">
                          <span className="h2h-date">{new Date(e.gameDate).toLocaleDateString('pt-BR')}</span>
                          <span className="h2h-comp">{e.competitionName}</span>
                          <div className="h2h-scoreboard">
                            <span className="h2h-team">{activeMatchDetails.teamA}</span>
                            <span className="h2h-score">{e.score}</span>
                            <span className="h2h-team">{e.opponent?.displayName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Standings block */}
                {matchStats?.standings && (
                  <div className="match-standings-wrapper">
                    {renderStandingsTable(matchStats.standings)}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Lances */}
            {!loadingStats && detailsTab === 'lances' && (
              <div className="tab-pane-content fade-in">
                {/* Key Events timeline */}
                <div className="key-events-timeline-section glass-panel">
                  <h4 className="section-title" style={{ marginBottom: '24px' }}>Linha do Tempo de Lances ⚡</h4>
                  {matchStats?.keyEvents ? renderTimeline(matchStats.keyEvents) : <p className="no-data-text">Ainda não há lances registrados para esta partida.</p>}
                </div>

                {/* Text commentary */}
                {matchStats?.commentary && matchStats.commentary.length > 0 && (
                  <div className="commentary-box glass-panel" style={{ marginTop: '20px' }}>
                    <h5 className="section-title" style={{ marginBottom: '16px' }}>Narração Minuto a Minuto 🎙️</h5>
                    <div className="commentary-feed-list">
                      {matchStats.commentary.map((c, idx) => (
                        <div key={idx} className="commentary-row">
                          {c.time?.displayValue ? (
                            <span className="commentary-time">{c.time.displayValue}</span>
                          ) : (
                            <span className="commentary-time-placeholder">•</span>
                          )}
                          <span className="commentary-text">{c.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Ficha & Odds */}
            {!loadingStats && detailsTab === 'ficha' && (
              <div className="tab-pane-content fade-in">
                <div className="info-details-grid">
                  
                  {/* Ficha Técnica Card */}
                  <div className="ficha-tecnica-card glass-panel">
                    <h5 className="section-title" style={{ marginBottom: '16px' }}>Ficha Técnica 🏟️</h5>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="info-label">Estádio:</span>
                        <span className="info-value">{matchStats?.gameInfo?.venue?.fullName || activeMatchDetails.stadiumName || '-'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Cidade:</span>
                        <span className="info-value">
                          {matchStats?.gameInfo?.venue?.address?.city || activeMatchDetails.stadiumCity || '-'}, {matchStats?.gameInfo?.venue?.address?.country || activeMatchDetails.stadiumCountry || '-'}
                        </span>
                      </div>
                      {(activeMatchDetails.stadiumCapacity > 0) && (
                        <div className="info-item">
                          <span className="info-label">Capacidade:</span>
                          <span className="info-value">{activeMatchDetails.stadiumCapacity.toLocaleString('pt-BR')} pessoas</span>
                        </div>
                      )}
                      {matchStats?.gameInfo?.attendance > 0 && (
                        <div className="info-item">
                          <span className="info-label">Público presente:</span>
                          <span className="info-value">{matchStats.gameInfo.attendance.toLocaleString('pt-BR')} espectadores</span>
                        </div>
                      )}
                      {matchStats?.gameInfo?.officials && matchStats.gameInfo.officials.length > 0 && (
                        <div className="info-item">
                          <span className="info-label">Arbitragem:</span>
                          <span className="info-value">
                            {matchStats.gameInfo.officials.map((o, idx) => (
                              <span key={idx} style={{ display: 'block', fontSize: '13px' }}>
                                {o.fullName} ({o.position?.displayName || 'Árbitro'})
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Broadcasts channels */}
                  <div className="broadcasts-card glass-panel">
                    <h5 className="section-title" style={{ marginBottom: '16px' }}>Onde Assistir 📺</h5>
                    {matchStats?.broadcasts && matchStats.broadcasts.length > 0 ? (
                      <div className="broadcasts-grid">
                        {matchStats.broadcasts.map((b, idx) => (
                          <div key={idx} className="broadcast-item-card">
                            <span className="broadcast-channel">🎥 {b.media?.name || b.media?.shortName}</span>
                            <div className="broadcast-meta" style={{ marginTop: '4px' }}>
                              <span className="broadcast-badge">{b.region?.toUpperCase() || 'Global'}</span>
                              {b.lang && <span className="broadcast-lang">{b.lang === 'pt' ? 'Português' : b.lang === 'en' ? 'Inglês' : b.lang === 'es' ? 'Espanhol' : b.lang}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data-text">Nenhuma emissora de transmissão cadastrada.</p>
                    )}
                  </div>

                  {/* Odds and Predictions */}
                  <div className="odds-card glass-panel">
                    <h5 className="section-title" style={{ marginBottom: '16px' }}>Odds & Probabilidades 🎲</h5>
                    {matchStats?.odds && matchStats.odds.length > 0 ? (
                      matchStats.odds.map((o, idx) => (
                        <div key={idx} className="odds-provider-block" style={{ marginBottom: idx < matchStats.odds.length - 1 ? '16px' : '0' }}>
                          <span className="odds-provider-title" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                            Provedor: <strong>{o.provider?.name || 'Default'}</strong>
                          </span>
                          <div className="odds-grid-details">
                            {o.details && (
                              <div className="odds-detail-item">
                                <span className="odd-label">Prognóstico</span>
                                <span className="odd-val">{o.details}</span>
                              </div>
                            )}
                            {o.overUnder && (
                              <div className="odds-detail-item">
                                <span className="odd-label">Gols +/-</span>
                                <span className="odd-val">{o.overUnder}</span>
                              </div>
                            )}
                            {o.homeTeamOdds?.moneyLine && (
                              <div className="odds-detail-item">
                                <span className="odd-label">Vitória {activeMatchDetails.teamA}</span>
                                <span className="odd-val">{o.homeTeamOdds.moneyLine > 0 ? `+${o.homeTeamOdds.moneyLine}` : o.homeTeamOdds.moneyLine}</span>
                              </div>
                            )}
                            {o.drawOdds?.moneyLine && (
                              <div className="odds-detail-item">
                                <span className="odd-label">Empate</span>
                                <span className="odd-val">{o.drawOdds.moneyLine > 0 ? `+${o.drawOdds.moneyLine}` : o.drawOdds.moneyLine}</span>
                              </div>
                            )}
                            {o.awayTeamOdds?.moneyLine && (
                              <div className="odds-detail-item">
                                <span className="odd-label">Vitória {activeMatchDetails.teamB}</span>
                                <span className="odd-val">{o.awayTeamOdds.moneyLine > 0 ? `+${o.awayTeamOdds.moneyLine}` : o.awayTeamOdds.moneyLine}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-data-text">Odds indisponíveis para este confronto.</p>
                    )}
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Rules Modal (Popup) */}
      {isRulesModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setIsRulesModalOpen(false)} aria-label="Fechar">
              <X size={18} />
            </button>
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={22} style={{ color: 'var(--color-primary)' }} />
              Regras de Pontuação
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '150%' }}>
                Seus palpites são comparados com os resultados oficiais da partida. Você sempre receberá a pontuação correspondente ao seu <strong>melhor acerto</strong> no jogo.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="rule-card" style={{ padding: '12px' }}>
                  <div className="rule-info">
                    <span className="rule-name" style={{ fontSize: '14px', fontWeight: '700' }}>Placar Exato 🎯</span>
                    <span className="rule-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Acertar perfeitamente a quantidade de gols de ambos os times (ex: palpite 2x1, resultado 2x1).</span>
                  </div>
                  <span className="rule-points" style={{ fontWeight: '800', color: 'var(--color-primary)' }}>25 pts</span>
                </div>

                <div className="rule-card" style={{ padding: '12px' }}>
                  <div className="rule-info">
                    <span className="rule-name" style={{ fontSize: '14px', fontWeight: '700' }}>Vencedor e Saldo de Gols ⚖️</span>
                    <span className="rule-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Acertar o vencedor e a diferença de gols do placar final (ex: palpite 3x1, resultado 2x0 - saldo de +2).</span>
                  </div>
                  <span className="rule-points" style={{ fontWeight: '800', color: 'var(--color-primary)' }}>18 pts</span>
                </div>

                <div className="rule-card" style={{ padding: '12px' }}>
                  <div className="rule-info">
                    <span className="rule-name" style={{ fontSize: '14px', fontWeight: '700' }}>Vencedor e Gols do Ganhador ⚽</span>
                    <span className="rule-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Acertar quem venceu e a quantidade de gols que o vencedor fez (ex: palpite 2x1, resultado 2x0).</span>
                  </div>
                  <span className="rule-points" style={{ fontWeight: '800', color: 'var(--color-primary)' }}>15 pts</span>
                </div>

                <div className="rule-card" style={{ padding: '12px' }}>
                  <div className="rule-info">
                    <span className="rule-name" style={{ fontSize: '14px', fontWeight: '700' }}>Empate com placar diferente 🤝</span>
                    <span className="rule-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Acertar que o jogo terminaria empatado, mas errar a quantidade exata de gols (ex: palpite 1x1, resultado 2x2).</span>
                  </div>
                  <span className="rule-points" style={{ fontWeight: '800', color: 'var(--color-primary)' }}>15 pts</span>
                </div>

                <div className="rule-card" style={{ padding: '12px' }}>
                  <div className="rule-info">
                    <span className="rule-name" style={{ fontSize: '14px', fontWeight: '700' }}>Vencedor e Gols do Perdedor 🥅</span>
                    <span className="rule-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Acertar quem venceu e a quantidade de gols que o perdedor fez (ex: palpite 2x1, resultado 3x1).</span>
                  </div>
                  <span className="rule-points" style={{ fontWeight: '800', color: 'var(--color-primary)' }}>12 pts</span>
                </div>

                <div className="rule-card" style={{ padding: '12px' }}>
                  <div className="rule-info">
                    <span className="rule-name" style={{ fontSize: '14px', fontWeight: '700' }}>Apenas Vencedor 🏃‍♂️</span>
                    <span className="rule-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Acertar apenas quem ganharia o jogo, sem acertar gols ou saldo (ex: palpite 2x1, resultado 3x0).</span>
                  </div>
                  <span className="rule-points" style={{ fontWeight: '800', color: 'var(--color-primary)' }}>10 pts</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <Info size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>Os palpites da galera só ficam visíveis para os outros participantes depois que o cronômetro do jogo começar para evitar cópias estratégicas.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal (Popup) */}
      {isSettingsModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content glass-panel settings-modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setIsSettingsModalOpen(false)} aria-label="Fechar">
              <X size={18} />
            </button>
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={22} style={{ color: 'var(--color-primary)' }} />
              Configurações de Alertas
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              
              {/* Native Permission Card */}
              <div className="permission-card">
                <span className="permission-status-text">
                  Permissão no Navegador: 
                  <span className={`permission-status-badge ${notificationPermissionStatus}`} style={{ marginLeft: '8px' }}>
                    {notificationPermissionStatus === 'granted' ? 'Ativada' : notificationPermissionStatus === 'denied' ? 'Bloqueada' : 'Pendente'}
                  </span>
                </span>
                {notificationPermissionStatus === 'granted' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Você receberá alertas do sistema na tela do seu computador ou celular mesmo com o site fechado!
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button 
                        onClick={() => subscribeToPushNotifications(false)} 
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Sincronizar Dispositivo
                      </button>
                      <button 
                        onClick={sendTestPushNotification} 
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Enviar Notificação de Teste
                      </button>
                    </div>
                  </div>
                )}
                {notificationPermissionStatus !== 'granted' && (
                  <button 
                    onClick={subscribeToPushNotifications} 
                    className="btn btn-primary"
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                  >
                    Ativar Notificações neste Dispositivo
                  </button>
                )}
              </div>

              {/* Seção 1: Alertas das Partidas */}
              <h4 className="settings-section-title">Alertas das Partidas</h4>
              
              <div className="settings-row">
                <div className="settings-info">
                  <span className="settings-label">Gols em Partidas</span>
                  <span className="settings-desc">Receber alerta push instantâneo sempre que sair gol de qualquer jogo</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.goals} 
                    onChange={(e) => updateNotificationSettings({ ...notificationSettings, goals: e.target.checked })} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-row">
                <div className="settings-info">
                  <span className="settings-label">Início da Partida</span>
                  <span className="settings-desc">Receber notificação quando a bola rolar e o status for ao vivo</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.matchStarted} 
                    onChange={(e) => updateNotificationSettings({ ...notificationSettings, matchStarted: e.target.checked })} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-row">
                <div className="settings-info">
                  <span className="settings-label">Fim de Jogo</span>
                  <span className="settings-desc">Ser alertado com o resultado oficial e o recálculo dos pontos</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.matchFinished} 
                    onChange={(e) => updateNotificationSettings({ ...notificationSettings, matchFinished: e.target.checked })} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Seção 2: Lembretes de Palpite */}
              <h4 className="settings-section-title">Lembretes de Palpite</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-8px' }}>
                Envia notificações para jogos onde você ainda não registrou nenhum palpite:
              </p>

              <div className="settings-row">
                <div className="settings-info">
                  <span className="settings-label">1 hora antes</span>
                  <span className="settings-desc">Alerta a 60 minutos do jogo começar</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.remind1h} 
                    onChange={(e) => updateNotificationSettings({ ...notificationSettings, remind1h: e.target.checked })} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-row">
                <div className="settings-info">
                  <span className="settings-label">30 minutos antes</span>
                  <span className="settings-desc">Alerta a 30 minutos do início</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.remind30m} 
                    onChange={(e) => updateNotificationSettings({ ...notificationSettings, remind30m: e.target.checked })} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-row">
                <div className="settings-info">
                  <span className="settings-label">15 minutos antes</span>
                  <span className="settings-desc">Alerta a 15 minutos do início</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.remind15m} 
                    onChange={(e) => updateNotificationSettings({ ...notificationSettings, remind15m: e.target.checked })} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-row">
                <div className="settings-info">
                  <span className="settings-label">5 minutos antes</span>
                  <span className="settings-desc">Alerta urgente a 5 minutos da partida</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.remind5m} 
                    onChange={(e) => updateNotificationSettings({ ...notificationSettings, remind5m: e.target.checked })} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Seção 3: Preferências de Som */}
              <h4 className="settings-section-title">Efeitos Sonoros</h4>
              
              <div className="settings-row">
                <div className="settings-info">
                  <span className="settings-label">Alertas Sonoros</span>
                  <span className="settings-desc">Tocar sons de apito e chimes quando estiver navegando no site</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    onClick={() => playSoundEffect('goal')} 
                    className="btn-test-sound"
                    title="Testar som de Gol"
                  >
                    Testar Som
                  </button>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.soundEnabled} 
                      onChange={(e) => updateNotificationSettings({ ...notificationSettings, soundEnabled: e.target.checked })} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Toast Notification popup */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <Check size={16} /> : <Info size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
