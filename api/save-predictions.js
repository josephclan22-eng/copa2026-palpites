import { dbGet, dbSet, ok, fail, parseBody } from './_db.js';

export default async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const { name, predictions } = await parseBody(req);
  if (!name) return fail(res, 400, { success: false, error: 'Nome é obrigatório' });
  const all = await dbGet('predictions');
  all[name] = predictions || {};
  await dbSet('predictions', all);
  ok(res, { success: true });
};
