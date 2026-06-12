import { useState, useMemo, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Matches from './components/Matches';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import StandingsTable from './components/StandingsTable';
import News from './components/News';
import initialMatches from './data/matches';
import { resolveAllMatches } from './data/standings';
import { useStorage } from './hooks/useStorage';
import { supabase } from './lib/supabase';

function App() {
  const [tab, setTab] = useState('dashboard');
  const [matchResults, setMatchResults] = useState({});
  const [syncState, setSyncState] = useState({ syncing: false, lastSync: null, error: null });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('resetAll')) {
      localStorage.clear();
      window.location.href = '/';
    }
  }, []);

  const { resolvedMatches, standings, bestThird } = useMemo(
    () => resolveAllMatches(initialMatches, matchResults),
    [matchResults]
  );

  const {
    users,
    predictions,
    getCurrentUser,
    login,
    register,
    logout,
    addPrediction,
    getPrediction,
    setAdminStatus,
    removeUser,
    updateProfile,
    resetAll,
    loadServerData,
  } = useStorage();

  useEffect(() => {
    loadServerData();
  }, []);

  const curUser = getCurrentUser();
  const isAdmin = curUser?.is_admin;
  const canViewAdmin = isAdmin;

  const handleUpdateResult = useCallback(async (matchId, homeScore, awayScore) => {
    const newResults = {
      ...matchResults,
      [matchId]: homeScore !== null && awayScore !== null
        ? { homeScore: Number(homeScore), awayScore: Number(awayScore), played: true }
        : {},
    };
    setMatchResults(newResults);

    if (homeScore !== null && awayScore !== null) {
      await supabase.from('match_results').upsert(
        { match_id: Number(matchId), home_score: Number(homeScore), away_score: Number(awayScore), played: true },
        { onConflict: 'match_id' }
      );
    }
  }, [matchResults]);

  const handleSyncResults = useCallback(async () => {
    setSyncState(s => ({ ...s, syncing: true, error: null }));
    try {
      const { data } = await supabase.from('match_results').select('*');
      if (data) {
        const results = {};
        for (const r of data) {
          results[r.match_id] = { homeScore: r.home_score, awayScore: r.away_score, played: r.played };
        }
        setMatchResults(results);
      }
      setSyncState({ syncing: false, lastSync: new Date().toISOString(), error: null });
    } catch {
      setSyncState(s => ({ ...s, syncing: false, error: 'Erro ao carregar resultados' }));
    }
  }, []);

  useEffect(() => {
    handleSyncResults();
    const interval = setInterval(handleSyncResults, 2000);
    return () => clearInterval(interval);
  }, [handleSyncResults]);

  const effectiveTab = !canViewAdmin && tab === 'admin' ? 'dashboard' : tab;

  useEffect(() => {
    if (!canViewAdmin && tab === 'admin') setTab('dashboard');
  }, [canViewAdmin, tab]);

  const renderTab = () => {
    switch (tab) {
      case 'dashboard':
        return (
          <Dashboard
            users={users} predictions={predictions}
            matches={resolvedMatches} currentUser={curUser}
            matchResults={matchResults} onTabChange={setTab}
            standings={standings}
          />
        );
      case 'matches':
        return (
          <Matches
            matches={resolvedMatches}
            predictions={predictions} currentUser={curUser}
            addPrediction={addPrediction} getPrediction={getPrediction}
            matchResults={matchResults}
          />
        );
      case 'leaderboard':
        return (
          <Leaderboard
            users={users} predictions={predictions}
            matches={resolvedMatches} matchResults={matchResults}
            currentUser={curUser}
          />
        );
      case 'standings':
        return (
          <StandingsTable
            standings={standings} bestThird={bestThird}
            matches={initialMatches} matchResults={matchResults}
          />
        );
      case 'news':
        return <News />;
      case 'admin':
        if (!canViewAdmin) return <Dashboard
          users={users} predictions={predictions}
          matches={resolvedMatches} currentUser={curUser}
          matchResults={matchResults} onTabChange={setTab}
          standings={standings}
        />;
        return (
          <AdminPanel
            matches={resolvedMatches} matchResults={matchResults}
            onUpdateResult={handleUpdateResult} users={users}
            predictions={predictions} standings={standings}
            syncState={syncState} onSync={handleSyncResults}
            setAdminStatus={setAdminStatus} removeUser={removeUser}
            onResetAll={() => resetAll(curUser?.name)} currentUser={curUser}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Header
        currentUser={curUser}
        onLogin={login}
        onRegister={register}
        onLogout={logout}
        onUpdateProfile={updateProfile}
        tab={effectiveTab}
        onTabChange={setTab}
      />
      <main className="main-content">
        {renderTab()}
      </main>
      <footer className="footer">
        <p>🏆 Copa do Mundo 2026 • Bolão de Palpites • Feito para boleiros e boleiras</p>
      </footer>
    </div>
  );
}

export default App;
