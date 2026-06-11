import { dbGet, hashPassword, ok, fail, parseBody } from './_db.js';

export default async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const { name, password } = await parseBody(req);
  const users = await dbGet('users');
  const user = users[name];
  if (!user || user.password !== hashPassword(password))
    return fail(res, 401, { success: false, error: 'Nome ou senha inválidos' });
  const predictions = (await dbGet('predictions'))[name] || {};
  const safe = { ...user }; delete safe.password;
  ok(res, { success: true, user: safe, isAdmin: user.isAdmin, predictions });
};
