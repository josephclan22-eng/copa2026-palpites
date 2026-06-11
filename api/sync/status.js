import { ok } from './_db.js';

export default (req, res) => {
  ok(res, { running: true, lastSync: null, error: null });
};
