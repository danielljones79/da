const express = require('express');
const { connect, healthCheck } = require('./db');
const clientDetailsRouter = require('./clientDetails');
const clientPolicyRouter = require('./clientPolicy');
const policyCoverageRouter = require('./policyCoverage');
const clientCoverageRouter = require('./clientCoverage.js');

const app = express();

app.use(express.json());

app.get('/healthcheck', async (req, res) => {
  const isHealthy = await healthCheck();
  res.send({ healthy: isHealthy });
});

app.use('/clientDetails', clientDetailsRouter);
app.use('/clientPolicy', clientPolicyRouter);
app.use('/policyCoverage', policyCoverageRouter);
app.use('/clientCoverage', clientCoverageRouter);

async function startServer() {
  await connect();
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();