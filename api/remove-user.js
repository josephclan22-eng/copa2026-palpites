import { dbGet, dbSet, ok, fail, parseBody } from './_db.js';

export default async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const { adminName, targetName } = await parseBody(req);
  const users = await dbGet('users');
  if (!users[adminName]?.isAdmin) return fail(res, 403, { success: false, error: 'Não autorizado' });
  if (adminName === targetName) return fail(res, 400, { success: false, error: 'Não pode remover a si mesmo' });
  delete users[targetName];
  await dbSet('users', users);
  const all = await dbGet('predictions');
  delete all[targetName];
  await dbSet('predictions', all);
  ok(res, { success: true });
};
