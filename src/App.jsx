import React, { useState, useEffect } from 'react';
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
  Sparkles
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

const renderTeamFlag = (name, className = "team-flag") => {
  const url = getTeamFlagUrl(name);
  if (url) {
    return <img src={url} alt={name} className={className} onError={(e) => { e.target.style.display = 'none'; }} />;
  }
  return <span className="team-flag-emoji-fallback">{getTeamEmoji(name)}</span>;
};

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
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Modals state
  const [guessModal, setGuessModal] = useState({ isOpen: false, match: null });
  const [resultModal, setResultModal] = useState({ isOpen: false, match: null });
  const [newMatchModal, setNewMatchModal] = useState(false);
  
  // Forms state
  const [guessForm, setGuessForm] = useState({ scoreA: '', scoreB: '' });
  const [resultForm, setResultForm] = useState({ scoreA: '', scoreB: '' });
  const [newMatchForm, setNewMatchForm] = useState({ teamA: '', teamB: '', date: '' });
  
  // Toggle visible guesses for finished matches
  const [expandedGuesses, setExpandedGuesses] = useState({});
  const [activeMatchDetails, setActiveMatchDetails] = useState(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch data
  const fetchMatches = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/matches?userName=${encodeURIComponent(user.name)}`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
        setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else if (!silent) {
        showToast('Erro ao carregar jogos.', 'error');
      }
    } catch (e) {
      console.error(e);
      if (!silent) showToast('Erro de conexão ao carregar jogos.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchRanking = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/ranking');
      if (res.ok) {
        const data = await res.json();
        setRanking(data);
      } else if (!silent) {
        showToast('Erro ao carregar ranking.', 'error');
      }
    } catch (e) {
      console.error(e);
      if (!silent) showToast('Erro de conexão ao carregar ranking.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMatches();
      fetchRanking();

      // Atualização constante em segundo plano (silenciosa) a cada 30 segundos
      const interval = setInterval(() => {
        fetchMatches(true);
        fetchRanking(true);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);


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

  // Sincronizar Jogos da Copa 2026 (Admin)
  const handleSyncCopa = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/copa2026/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterRole: user.role })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Jogos da Copa de 2026 sincronizados!');
        fetchMatches();
      } else {
        showToast(data.error || 'Erro ao sincronizar jogos da Copa.', 'error');
      }
    } catch (e) {
      showToast('Erro de rede ao sincronizar jogos da Copa.', 'error');
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
        body: JSON.stringify({ requesterRole: user.role })
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
          .map(s => s.trim().replace(/^["'“‟”]+|["'“‟”]+$/g, '').trim())
          .filter(Boolean);
      }
      return [scorersStr];
    } catch (e) {
      return [];
    }
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="user-badge">
              <User size={16} style={{ color: 'var(--text-secondary)' }} />
              <span className="user-badge-name">{user.name}</span>
              <span className={`user-badge-role ${user.role}`}>
                {user.role === 'admin' ? 'Organizador' : 'Participante'}
              </span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-icon-only" title="Sair">
              <LogOut size={16} />
            </button>
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
            className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <HelpCircle size={18} />
            Regras de Pontos
          </button>
          
          {user.role === 'admin' && (
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
              {user.role === 'admin' && (
                <button onClick={() => setNewMatchModal(true)} className="btn btn-primary">
                  <Plus size={16} /> Novo Jogo
                </button>
              )}
            </div>

            {loading && matches.length === 0 ? (
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
            ) : (
              <div className="matches-grid">
                {matches.map(match => {
                  const hasStarted = new Date(match.date) < new Date() || match.status === 'live';
                  const isFinished = match.status === 'finished';
                  
                  return (
                    <div 
                      key={match.id} 
                      className="match-card glass-panel" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveMatchDetails(match)}
                    >
                      <div className="match-header">
                        <span>{formatDate(match.date)}</span>
                        <span className={`match-badge ${match.status}`}>
                          {isFinished ? 'Encerrado' : match.status === 'live' ? '• AO VIVO' : 'Aberto'}
                        </span>
                      </div>

                      <div className="match-teams">
                        <div className="team">
                          {renderTeamFlag(match.teamA, "team-flag")}
                          <span className="team-name" title={match.teamA}>{match.teamA}</span>
                        </div>

                        <div className="match-vs-score">
                          <span className="vs-text">VS</span>
                          {isFinished || match.status === 'live' ? (
                            <div className="score-display">
                              <span className="score-number" style={match.status === 'live' ? { borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' } : {}}>{match.scoreA}</span>
                              <span className="score-dash">-</span>
                              <span className="score-number" style={match.status === 'live' ? { borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' } : {}}>{match.scoreB}</span>
                            </div>
                          ) : (
                            <div className="score-display" style={{ opacity: 0.5 }}>
                              <span className="score-number">?</span>
                              <span className="score-dash">-</span>
                              <span className="score-number">?</span>
                            </div>
                          )}
                        </div>

                        <div className="team">
                          {renderTeamFlag(match.teamB, "team-flag")}
                          <span className="team-name" title={match.teamB}>{match.teamB}</span>
                        </div>
                      </div>

                      <div className="match-footer">
                        {/* Current User's Guess info */}
                        {match.userGuess ? (
                          <div className="user-guess-box">
                            <span className="guess-label">Seu palpite:</span>
                            <span className="guess-value">{match.userGuess.scoreA} x {match.userGuess.scoreB}</span>
                            {isFinished && (
                              <span className="guess-points">
                                +{match.userGuess.points} pts
                              </span>
                            )}
                          </div>
                        ) : (
                          !hasStarted && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setGuessModal({ isOpen: true, match });
                                setGuessForm({ scoreA: '', scoreB: '' });
                              }}
                              className="btn btn-primary"
                              style={{ width: '100%' }}
                            >
                              Dar Palpite
                            </button>
                          )
                        )}

                        {/* Allow admin to set result */}
                        {user.role === 'admin' && !isFinished && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setResultModal({ isOpen: true, match });
                              setResultForm({ scoreA: '', scoreB: '' });
                            }}
                            className="btn btn-secondary"
                            style={{ width: '100%' }}
                          >
                            Inserir Placar Oficial
                          </button>
                        )}

                        {/* Edit guess if still open */}
                        {match.userGuess && !hasStarted && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setGuessModal({ isOpen: true, match });
                              setGuessForm({ scoreA: match.userGuess.scoreA.toString(), scoreB: match.userGuess.scoreB.toString() });
                            }}
                            className="btn btn-secondary"
                            style={{ width: '100%' }}
                          >
                            Alterar Palpite
                          </button>
                        )}

                        {/* Show indicator if match started and guess is missing */}
                        {!match.userGuess && hasStarted && (
                          <div className="user-guess-box" style={{ borderColor: 'var(--color-danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
                            <span className="guess-label" style={{ color: 'var(--color-danger)' }}>Você não palpitou a tempo</span>
                          </div>
                        )}

                        {/* Expandable list of guesses for other players (only if match started/locked) */}
                        {hasStarted && match.otherGuesses && match.otherGuesses.length > 0 && (
                          <div className="guesses-collapse" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="guesses-collapse-btn" 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGuessesExpand(match.id);
                              }}
                            >
                              {expandedGuesses[match.id] ? (
                                <>Ocultar palpites da galera <ChevronUp size={12} /></>
                              ) : (
                                <>Ver palpites da galera ({match.otherGuesses.length}) <ChevronDown size={12} /></>
                              )}
                            </button>
                            
                            {expandedGuesses[match.id] && (
                              <div className="guesses-collapse-list">
                                {match.otherGuesses.map((g, idx) => (
                                  <div key={idx} className="guess-list-item">
                                    <span className="guess-list-name">{g.userName}</span>
                                    <div>
                                      <span className="guess-list-score">{g.scoreA} x {g.scoreB}</span>
                                      {isFinished && (
                                        <span className="guess-list-points"> (+{g.points} pts)</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {activeTab === 'ranking' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Tabela de Classificação</h2>
              <button onClick={fetchRanking} className="btn btn-secondary btn-icon-only" title="Atualizar Ranking">
                <RefreshCw size={16} />
              </button>
            </div>

            {loading && ranking.length === 0 ? (
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
                    {ranking.map((row, index) => {
                      const pos = index + 1;
                      let medalClass = '';
                      if (pos === 1) medalClass = 'medal medal-gold';
                      else if (pos === 2) medalClass = 'medal medal-silver';
                      else if (pos === 3) medalClass = 'medal medal-bronze';

                      return (
                        <tr key={row.userId} className="ranking-row">
                          <td className="ranking-position">
                            {medalClass ? <span className={medalClass}>{pos}</span> : pos}
                          </td>
                          <td>
                            <span className="ranking-name">{row.userName}</span>
                            {row.userName.toLowerCase() === user.name.toLowerCase() && (
                              <span style={{ fontSize: '10px', marginLeft: '6px', color: 'var(--color-primary)', fontWeight: '700', textTransform: 'uppercase' }}>Você</span>
                            )}
                          </td>
                          <td>
                            <span className="ranking-points">{row.totalPoints} pts</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="ranking-stat-pill" style={{ color: '#fbbf24' }}>{row.exactScores}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="ranking-stat-pill" style={{ color: '#a7f3d0' }}>{row.winnerDiff}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="ranking-stat-pill" style={{ color: '#93c5fd' }}>{row.winnerGoals}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="ranking-stat-pill" style={{ color: '#e2e8f0' }}>{row.winnerOnly}</span>
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
            )}
          </div>
        )}

        {/* Tab 3: Rules & Calculations */}
        {activeTab === 'rules' && (
          <div className="rules-container">
            <div className="rules-content glass-panel">
              <div>
                <h3 className="rules-section-title">Como funciona a pontuação?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '150%' }}>
                  Seus palpites são comparados com os resultados oficiais e pontuados da forma mais justa possível. Você sempre receberá a pontuação correspondente ao seu <strong>melhor acerto</strong> no jogo.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="rule-card">
                  <div className="rule-info">
                    <span className="rule-name">Placar Exato 🎯</span>
                    <span className="rule-desc">Acertar perfeitamente a quantidade de gols de ambos os times (ex: palpite 2x1, resultado 2x1).</span>
                  </div>
                  <span className="rule-points">25 pts</span>
                </div>

                <div className="rule-card">
                  <div className="rule-info">
                    <span className="rule-name">Vencedor e Saldo de Gols ⚖️</span>
                    <span className="rule-desc">Acertar o vencedor e a diferença de gols do placar final (ex: palpite 3x1, resultado 2x0 - saldo de +2).</span>
                  </div>
                  <span className="rule-points">18 pts</span>
                </div>

                <div className="rule-card">
                  <div className="rule-info">
                    <span className="rule-name">Vencedor e Gols do Ganhador ⚽</span>
                    <span className="rule-desc">Acertar quem venceu e a quantidade de gols que o vencedor fez (ex: palpite 2x1, resultado 2x0).</span>
                  </div>
                  <span className="rule-points">15 pts</span>
                </div>

                <div className="rule-card">
                  <div className="rule-info">
                    <span className="rule-name">Empate com placar diferente 🤝</span>
                    <span className="rule-desc">Acertar que o jogo terminaria empatado, mas errar a quantidade exata de gols (ex: palpite 1x1, resultado 2x2).</span>
                  </div>
                  <span className="rule-points">15 pts</span>
                </div>

                <div className="rule-card">
                  <div className="rule-info">
                    <span className="rule-name">Vencedor e Gols do Perdedor 🥅</span>
                    <span className="rule-desc">Acertar quem venceu e a quantidade de gols que o perdedor fez (ex: palpite 2x1, resultado 3x1).</span>
                  </div>
                  <span className="rule-points">12 pts</span>
                </div>

                <div className="rule-card">
                  <div className="rule-info">
                    <span className="rule-name">Apenas Vencedor 🏃‍♂️</span>
                    <span className="rule-desc">Acertar apenas quem ganharia o jogo, sem acertar gols ou saldo (ex: palpite 2x1, resultado 3x0).</span>
                  </div>
                  <span className="rule-points">10 pts</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <Info size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span><strong>Observação</strong>: Caso o seu palpite não se enquadre em nenhum dos casos acima (por exemplo, apostar em vitória do Time A e o jogo terminar empatado ou vitória do Time B), você receberá <strong>0 pontos</strong> por esse palpite.</span>
              </div>
            </div>

            <div className="rules-content glass-panel" style={{ height: 'fit-content' }}>
              <h3 className="rules-section-title" style={{ color: 'var(--color-secondary)' }}>Dica de ouro! 🏆</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '160%' }}>
                Os palpites da galera só ficam visíveis para os outros participantes <strong>depois que o cronômetro do jogo começar</strong>. Isso evita que os amigos fiquem "copiando" palpites estratégicos no final do prazo!
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Admin Panel (Only for admins) */}
        {activeTab === 'admin' && user.role === 'admin' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
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
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Jogos da Copa de 2026</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Carregue automaticamente uma tabela com os grandes jogos da Copa do Mundo de 2026 para os seus amigos palpitarem.
                  </p>
                  <button onClick={handleSyncCopa} className="btn btn-secondary" style={{ gap: '8px' }} disabled={loading}>
                    <Sparkles size={16} style={{ color: 'var(--color-secondary)' }} /> Carregar Jogos da Copa 2026
                  </button>
                </div>

                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Simulador de Jogos em Tempo Real</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Simule o início, gols e encerramento de partidas da Copa. Veja os pontos e o ranking atualizarem em tempo real no navegador!
                  </p>
                  <button onClick={handleSimulateLive} className="btn btn-secondary" style={{ gap: '8px' }} disabled={loading}>
                    <Clock size={16} style={{ color: 'var(--color-danger)' }} /> Simular Acontecimento no Jogo
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
                {renderTeamFlag(guessModal.match.teamA, "modal-team-flag")}
                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '8px' }}>{guessModal.match.teamA}</div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontWeight: '800' }}>VS</span>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderTeamFlag(guessModal.match.teamB, "modal-team-flag")}
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

      {/* MODAL: Set Match Result (Admin only) */}
      {resultModal.isOpen && (
        <div className="modal-overlay" onClick={() => setResultModal({ isOpen: false, match: null })}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Encerrar Partida (Placar Oficial)</h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderTeamFlag(resultModal.match.teamA, "modal-team-flag")}
                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '8px' }}>{resultModal.match.teamA}</div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontWeight: '800' }}>VS</span>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderTeamFlag(resultModal.match.teamB, "modal-team-flag")}
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

      {/* MODAL: Match Details */}
      {activeMatchDetails && (
        <div className="modal-overlay" onClick={() => setActiveMatchDetails(null)}>
          <div className="modal-content glass-panel match-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-nav">
              <span className="group-badge">Grupo {activeMatchDetails.group || 'Geral'} • Rodada {activeMatchDetails.matchday || '1'}</span>
              <button className="close-modal-btn" onClick={() => setActiveMatchDetails(null)}>×</button>
            </div>

            {/* Stadium Info */}
            <div className="stadium-details-box">
              <span className="stadium-icon">🏟️</span>
              <div className="stadium-text">
                <div className="stadium-name">{activeMatchDetails.stadiumName || 'Estádio não cadastrado'}</div>
                <div className="stadium-location">{activeMatchDetails.stadiumCity || 'Cidade Desconhecida'}, {activeMatchDetails.stadiumCountry || 'País Desconhecido'}</div>
                {activeMatchDetails.stadiumCapacity > 0 && (
                  <div className="stadium-capacity">Capacidade: {activeMatchDetails.stadiumCapacity.toLocaleString('pt-BR')} pessoas</div>
                )}
              </div>
            </div>

            {/* Date and Status */}
            <div className="match-time-status">
              <span className="time-text">📅 {formatDate(activeMatchDetails.date)}</span>
              <span className={`match-badge ${activeMatchDetails.status}`}>
                {activeMatchDetails.status === 'finished' ? 'Encerrado' : activeMatchDetails.status === 'live' ? '• AO VIVO' : 'Aberto'}
              </span>
            </div>

            {/* Scoreboard display */}
            <div className="details-scoreboard">
              <div className="team-column">
                {renderTeamFlag(activeMatchDetails.teamA, "details-team-flag")}
                <span className="details-team-name" style={{ marginTop: '8px' }}>{activeMatchDetails.teamA}</span>
              </div>

              <div className="details-score-box">
                {activeMatchDetails.status === 'finished' || activeMatchDetails.status === 'live' ? (
                  <div className="score-numbers">
                    <span className="score-num">{activeMatchDetails.scoreA}</span>
                    <span className="score-divider">-</span>
                    <span className="score-num">{activeMatchDetails.scoreB}</span>
                  </div>
                ) : (
                  <span className="score-vs">VS</span>
                )}
              </div>

              <div className="team-column">
                {renderTeamFlag(activeMatchDetails.teamB, "details-team-flag")}
                <span className="details-team-name" style={{ marginTop: '8px' }}>{activeMatchDetails.teamB}</span>
              </div>
            </div>

            {/* Scorers */}
            {(activeMatchDetails.status === 'finished' || activeMatchDetails.status === 'live') && (
              <div className="scorers-section">
                <h4 className="section-title">Gols da Partida ⚽</h4>
                <div className="scorers-grid">
                  <div className="scorers-list home-scorers">
                    {parseScorers(activeMatchDetails.home_scorers).map((scorer, i) => (
                      <div key={i} className="scorer-item">⚽ {scorer}</div>
                    ))}
                    {parseScorers(activeMatchDetails.home_scorers).length === 0 && <div className="no-scorers">-</div>}
                  </div>
                  <div className="scorers-divider"></div>
                  <div className="scorers-list away-scorers">
                    {parseScorers(activeMatchDetails.away_scorers).map((scorer, i) => (
                      <div key={i} className="scorer-item">{scorer} ⚽</div>
                    ))}
                    {parseScorers(activeMatchDetails.away_scorers).length === 0 && <div className="no-scorers">-</div>}
                  </div>
                </div>
              </div>
            )}

            {/* User Guess Panel */}
            <div className="user-guess-details-panel">
              {activeMatchDetails.userGuess ? (
                <div className="guess-info-alert">
                  <span className="alert-title">Seu palpite registrado:</span>
                  <div className="guess-score-pill">
                    {activeMatchDetails.userGuess.scoreA} x {activeMatchDetails.userGuess.scoreB}
                  </div>
                  {activeMatchDetails.status === 'finished' && (
                    <div className="guess-points-earned">
                      Pontos ganhos: <strong style={{ color: 'var(--color-primary)' }}>+{activeMatchDetails.userGuess.points} pts</strong>
                    </div>
                  )}
                  {activeMatchDetails.status === 'pending' && (
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
                  )}
                </div>
              ) : (
                <div className="no-guess-alert">
                  {(new Date(activeMatchDetails.date) > new Date() && activeMatchDetails.status !== 'live') ? (
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
            </div>

            {/* Other Bets (Galera) */}
            <div className="other-bets-section">
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
