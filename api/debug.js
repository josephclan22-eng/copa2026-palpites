import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
)

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { data: results } = await supabase.from('match_results').select('*').order('match_id', { ascending: true })
    res.json({ success: true, results })
  } catch (err) {
    res.json({ success: false, error: err.message })
  }
}
