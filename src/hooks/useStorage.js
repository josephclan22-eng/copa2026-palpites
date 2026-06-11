import { useState, useCallback } from 'react';

const STORAGE_KEY = 'copa2026_data';

function hashPassword(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    const c = pw.charCodeAt(i);
    h = ((h << 5) - h) + c;
    h = h & h;
  }
  return 'h_' + Math.abs(h).toString(36);
}

function getInitialState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    users: [],
    predictions: {},
    currentUser: null,
  };
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function useStorage() {
  const [data, setData] = useState(getInitialState);

  const save = useCallback((newData) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {}
  }, []);

  const getCurrentUser = useCallback(() => {
    return data.users.find(u => u.id === data.currentUser) || null;
  }, [data]);

  const login = useCallback((name, password) => {
    const trimmed = name.trim().toLowerCase();
    const user = data.users.find(u => u.name.toLowerCase() === trimmed);
    if (!user) return { ok: false, error: 'Usuário não encontrado' };
    if (user.password && hashPassword(password) !== user.password) {
      return { ok: false, error: 'Senha incorreta' };
    }
    save({ ...data, currentUser: user.id });
    return { ok: true, user };
  }, [data, save]);

  const register = useCallback((name, email, password, gender = 'masculino') => {
    const trimmed = name.trim();
    const emailTrimmed = email.trim().toLowerCase();
    if (!trimmed) return { ok: false, error: 'Nome é obrigatório' };
    if (!emailTrimmed) return { ok: false, error: 'Email é obrigatório' };
    if (!password || password.length < 3) return { ok: false, error: 'Senha deve ter no mínimo 3 caracteres' };

    const lower = trimmed.toLowerCase();
    if (data.users.some(u => u.name.toLowerCase() === lower)) {
      return { ok: false, error: 'Nome de usuário já existe' };
    }
    if (data.users.some(u => u.email === emailTrimmed)) {
      return { ok: false, error: 'Email já cadastrado' };
    }

    const isAdmin = data.users.length === 0;
    const user = {
      id: generateId(),
      name: trimmed,
      email: emailTrimmed,
      password: hashPassword(password),
      gender,
      isAdmin,
      createdAt: new Date().toISOString(),
    };
    const newData = { ...data, users: [...data.users, user], currentUser: user.id };
    save(newData);
    return { ok: true, user };
  }, [data, save]);

  const setAdminStatus = useCallback((userId, isAdmin) => {
    const users = data.users.map(u => u.id === userId ? { ...u, isAdmin } : u);
    save({ ...data, users });
  }, [data, save]);

  const removeUser = useCallback((userId) => {
    const users = data.users.filter(u => u.id !== userId);
    const newData = { ...data, users };
    if (data.currentUser === userId) newData.currentUser = null;
    save(newData);
  }, [data, save]);

  const addPrediction = useCallback((userId, matchId, homeScore, awayScore) => {
    const userPreds = data.predictions[userId] ? [...data.predictions[userId]] : [];
    const existingIdx = userPreds.findIndex(p => p.matchId === matchId);
    const pred = { matchId, homeScore: Number(homeScore), awayScore: Number(awayScore), updatedAt: new Date().toISOString() };

    if (existingIdx >= 0) {
      userPreds[existingIdx] = pred;
    } else {
      userPreds.push(pred);
    }

    save({
      ...data,
      predictions: { ...data.predictions, [userId]: userPreds },
    });
  }, [data, save]);

  const getPrediction = useCallback((userId, matchId) => {
    const userPreds = data.predictions[userId];
    if (!userPreds) return null;
    return userPreds.find(p => p.matchId === matchId) || null;
  }, [data]);

  const getUserPredictions = useCallback((userId) => {
    return data.predictions[userId] || [];
  }, [data]);

  const logout = useCallback(() => {
    save({ ...data, currentUser: null });
  }, [data, save]);

  const updateProfile = useCallback((userId, updates) => {
    const users = data.users.map(u =>
      u.id === userId ? { ...u, ...updates } : u
    );
    save({ ...data, users });
  }, [data, save]);

  const resetAll = useCallback(() => {
    const empty = { users: [], predictions: {}, currentUser: null };
    save(empty);
  }, [save]);

  return {
    ...data,
    matchResults: data.matchResults || {},
    getCurrentUser,
    login,
    register,
    logout,
    setAdminStatus,
    removeUser,
    addPrediction,
    getPrediction,
    getUserPredictions,
    updateProfile,
    resetAll,
  };
}
