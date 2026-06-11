import { dbGet, ok } from './_db.js';

export default async (req, res) => {
  const allUsers = await dbGet('users');
  const safeUsers = {};
  for (const [k, v] of Object.entries(allUsers))
    safeUsers[k] = { name: v.name, email: v.email, gender: v.gender, isAdmin: v.isAdmin, profilePhoto: v.profilePhoto };
  ok(res, { users: safeUsers, predictions: await dbGet('predictions'), results: await dbGet('results') });
};
