import { dbGet, dbSet, ok, fail, parseBody } from './_db.js';

export default async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const { name, email, gender, profilePhoto } = await parseBody(req);
  if (!name) return fail(res, 400, { success: false, error: 'Nome é obrigatório' });
  const users = await dbGet('users');
  if (!users[name]) return fail(res, 404, { success: false, error: 'Usuário não encontrado' });
  if (email !== undefined) users[name].email = email;
  if (gender !== undefined) users[name].gender = gender;
  if (profilePhoto !== undefined) users[name].profilePhoto = profilePhoto;
  await dbSet('users', users);
  const safe = { ...users[name] }; delete safe.password;
  ok(res, { success: true, user: safe });
};
