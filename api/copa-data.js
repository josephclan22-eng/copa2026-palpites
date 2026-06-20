import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseKey || '')

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const [results, predictions, profiles] = await Promise.all([
      supabase.from('match_results').select('*').order('match_id'),
      supabase.from('predictions').select('*'),
      supabase.from('profiles').select('*').order('total_points', { ascending: false }),
    ])
    res.json({ results: results.data || [], predictions: predictions.data || [], profiles: profiles.data || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
