import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { calculatePoints } from '../data/scoring'

export function useStorage() {
  const [data, setData] = useState(() => ({
    users: [],
    predictions: {},
    currentUser: null,
  }))

  const mountedRef = useRef(true)

  const getCurrentUser = useCallback(() => data.currentUser, [data.currentUser])

  async function loadAllData() {
    const { data: profiles } = await supabase.from('profiles').select('*')
    const { data: preds } = await supabase.from('predictions').select('*')

    const users = profiles || []
    const predictions = {}
    if (preds) {
      for (const p of preds) {
        const uname = users.find(u => u.id === p.user_id)?.name || p.user_id
        if (!predictions[uname]) predictions[uname] = []
        predictions[uname].push({
          matchId: p.match_id,
          homeScore: p.home_score,
          awayScore: p.away_score,
          updatedAt: p.updated_at,
        })
      }
    }

    setData(prev => ({ ...prev, users, predictions }))
  }

  const loadAndSyncUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      const user = { ...profile, id: session.user.id, email: session.user.email }
      setData(prev => ({ ...prev, currentUser: user }))
    }

    await loadAllData()
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { ok: false, error: error.message }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      const user = profile
        ? { ...profile, id: data.user.id, email: data.user.email }
        : { id: data.user.id, name: email.split('@')[0], email }

      setData(prev => ({ ...prev, currentUser: user }))
      await loadAllData()
      return { ok: true, user }
    } catch {
      return { ok: false, error: 'Servidor indisponível' }
    }
  }, [])

  const register = useCallback(async (name, email, password, gender = 'masculino') => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } },
      })
      if (error) return { ok: false, error: error.message }

      let profile
      for (let i = 0; i < 15; i++) {
        const { data } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single()
        if (data) { profile = data; break }
        await new Promise(r => setTimeout(r, 500))
      }

      if (!profile) {
        const { data: inserted } = await supabase.from('profiles').insert([{
          id: authData.user.id, name, email, gender, is_admin: false,
        }]).select().single()
        profile = inserted
      }

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) return { ok: false, error: loginError.message }

      const user = { ...profile, id: authData.user.id, email: authData.user.email }
      setData(prev => ({ ...prev, currentUser: user }))
      await loadAllData()
      return { ok: true, user }
    } catch {
      return { ok: false, error: 'Servidor indisponível' }
    }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setData(prev => ({ ...prev, currentUser: null }))
  }, [])

  const addPrediction = useCallback(async (userName, matchId, homeScore, awayScore) => {
    try {
      const user = data.currentUser
      if (!user) return

      const pred = {
        user_id: user.id,
        match_id: Number(matchId),
        home_score: Number(homeScore),
        away_score: Number(awayScore),
        updated_at: new Date().toISOString(),
      }

      const { data: existing } = await supabase
        .from('predictions')
        .select('id')
        .eq('user_id', user.id)
        .eq('match_id', Number(matchId))
        .maybeSingle()

      if (existing) {
        await supabase.from('predictions').update(pred).eq('id', existing.id)
      } else {
        await supabase.from('predictions').insert([pred])
      }

      const storageKey = user.name
      const userPreds = data.predictions[storageKey] ? [...data.predictions[storageKey]] : []
      const existingIdx = userPreds.findIndex(p => p.matchId === matchId)
      const newPred = { matchId, homeScore: Number(homeScore), awayScore: Number(awayScore), updatedAt: new Date().toISOString() }
      if (existingIdx >= 0) {
        userPreds[existingIdx] = newPred
      } else {
        userPreds.push(newPred)
      }
      setData(prev => ({
        ...prev,
        predictions: { ...prev.predictions, [storageKey]: userPreds },
      }))
    } catch {}
  }, [data.predictions, data.currentUser])

  const getPrediction = useCallback((userName, matchId) => {
    const userPreds = data.predictions[userName]
    if (!userPreds) return null
    return userPreds.find(p => String(p.matchId) === String(matchId)) || null
  }, [data.predictions])

  const getUserPredictions = useCallback((userName) => {
    return data.predictions[userName] || []
  }, [data.predictions])

  const setAdminStatus = useCallback(async (adminName, targetName, isAdmin) => {
    try {
      const target = data.users.find(u => u.name === targetName)
      if (!target) return { success: false, error: 'Usuário não encontrado' }
      await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', target.id)
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => u.name === targetName ? { ...u, is_admin: isAdmin } : u),
      }))
      return { success: true }
    } catch {
      return { success: false, error: 'Servidor indisponível' }
    }
  }, [data.users])

  const removeUser = useCallback(async (adminName, targetName) => {
    try {
      const target = data.users.find(u => u.name === targetName)
      if (!target) return { success: false, error: 'Usuário não encontrado' }
      await supabase.from('predictions').delete().eq('user_id', target.id)
      await supabase.from('profiles').delete().eq('id', target.id)
      setData(prev => {
        const newPredictions = { ...prev.predictions }
        delete newPredictions[targetName]
        return {
          ...prev,
          users: prev.users.filter(u => u.name !== targetName),
          predictions: newPredictions,
          currentUser: prev.currentUser?.name === targetName ? null : prev.currentUser,
        }
      })
      return { success: true }
    } catch {
      return { success: false, error: 'Servidor indisponível' }
    }
  }, [data.users, data.predictions])

  const updateProfile = useCallback(async (userName, updates) => {
    try {
      const user = data.users.find(u => u.name === userName)
      if (!user?.id) return { ok: false, error: 'Usuário não encontrado' }
      const dbUpdates = {}
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender
      if (updates.profilePhoto !== undefined) dbUpdates.profile_photo = updates.profilePhoto
      await supabase.from('profiles').update(dbUpdates).eq('id', user.id)
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => u.name === userName ? { ...u, ...dbUpdates } : u),
      }))
      return { ok: true }
    } catch {
      return { ok: false, error: 'Servidor indisponível' }
    }
  }, [data.users])

  const resetAll = useCallback(async () => {
    try {
      await supabase.from('predictions').delete().neq('id', 0)
      await supabase.from('match_results').delete().neq('id', 0)
      await supabase.from('profiles').delete().neq('id', '0')
      setData({ users: [], predictions: {}, currentUser: null })
      return { success: true }
    } catch {
      return { success: false }
    }
  }, [])

  const loadServerData = useCallback(async () => {
    await loadAndSyncUser()
  }, [loadAndSyncUser])

  const recalculateAllPoints = useCallback(async () => {
    try {
      const { data: allPredictions } = await supabase.from('predictions').select('*')
      const { data: matchResults } = await supabase.from('match_results').select('*')
      const { data: allProfiles } = await supabase.from('profiles').select('id')
      if (!allPredictions || !matchResults || !allProfiles) return

      const resultsMap = {}
      for (const r of matchResults) resultsMap[r.match_id] = { homeScore: r.home_score, awayScore: r.away_score, played: r.played }

      const userPoints = {}
      for (const pred of allPredictions) {
        const actual = resultsMap[pred.match_id]
        if (!actual || actual.homeScore === null || actual.awayScore === null) continue
        const pts = calculatePoints({ homeScore: pred.home_score, awayScore: pred.away_score }, actual)
        userPoints[pred.user_id] = (userPoints[pred.user_id] || 0) + pts
      }

      for (const profile of allProfiles) {
        await supabase.from('profiles').update({ total_points: userPoints[profile.id] || 0 }).eq('id', profile.id)
      }
    } catch {}
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  return {
    users: data.users,
    predictions: data.predictions,
    currentUser: data.currentUser,
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
    loadServerData,
    recalculateAllPoints,
  }
}
