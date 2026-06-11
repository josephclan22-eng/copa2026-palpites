import { dbGet, dbSet, hashPassword, ok, fail, parseBody } from './_db.js';

export default async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const { name, email, password, gender } = await parseBody(req);
  if (!name || !password || name.length < 3 || password.length < 3)
    return fail(res, 400, { success: false, error: 'Nome e senha devem ter no mínimo 3 caracteres' });
  const users = await dbGet('users');
  if (users[name]) return fail(res, 400, { success: false, error: 'Nome de usuário já existe' });
  const isAdmin = Object.keys(users).length === 0;
  users[name] = { name, email: email || '', password: hashPassword(password), gender: gender || 'masculino', isAdmin, profilePhoto: '', createdAt: new Date().toISOString() };
  await dbSet('users', users);
  const safe = { ...users[name] }; delete safe.password;
  ok(res, { success: true, user: safe, isAdmin, predictions: {} });
};
