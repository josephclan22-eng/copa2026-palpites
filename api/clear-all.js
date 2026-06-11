import { dbGet, dbSet, ok, fail, parseBody } from './_db.js';

export default async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const { adminName } = await parseBody(req);
  const users = await dbGet('users');
  if (!users[adminName]?.isAdmin) return fail(res, 403, { success: false, error: 'Não autorizado' });
  await dbSet('users', {});
  await dbSet('predictions', {});
  await dbSet('results', {});
  ok(res, { success: true });
};
