import { dbGet, dbSet, ok, fail, parseBody } from './_db.js';

export default async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const { adminName, targetName, isAdmin } = await parseBody(req);
  const users = await dbGet('users');
  if (!users[adminName]?.isAdmin) return fail(res, 403, { success: false, error: 'Não autorizado' });
  if (!users[targetName]) return fail(res, 404, { success: false, error: 'Usuário não encontrado' });
  users[targetName].isAdmin = !!isAdmin;
  await dbSet('users', users);
  ok(res, { success: true });
};
