export default (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ running: true, lastSync: null, error: null });
};
