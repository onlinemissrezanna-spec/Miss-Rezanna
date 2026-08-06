try {
  const app = require('../backend/src/app');
  module.exports = (req, res) => {
    try {
      return app(req, res);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message, stack: err.stack }));
    }
  };
} catch (err) {
  module.exports = (req, res) => {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Initialization Error: ' + err.message, stack: err.stack }));
  };
}
