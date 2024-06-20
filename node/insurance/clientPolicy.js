const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db');

router.get('/', async (req, res) => {
  try {
    const clientPolicies = await executeQuery('SELECT * FROM ClientPolicy');
    res.json(clientPolicies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client policies' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { ClientId, PolicyId } = req.body;
    await executeQuery('INSERT INTO ClientPolicy SET ?', { ClientId, PolicyId });
    res.json({ message: 'Client policy created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating client policy' });
  }
});

router.get('/:ClientId/:PolicyId', async (req, res) => {
  try {
    const ClientId = req.params.ClientId;
    const PolicyId = req.params.PolicyId;
    const clientPolicy = await executeQuery('SELECT * FROM ClientPolicy WHERE ClientId = ? AND PolicyId = ?', [ClientId, PolicyId]);
    if (clientPolicy.length === 0) {
      res.status(404).json({ message: 'Client policy not found' });
    } else {
      res.json(clientPolicy[0]);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client policy' });
  }
});

router.delete('/:ClientId/:PolicyId', async (req, res) => {
  try {
    const ClientId = req.params.ClientId;
    const PolicyId = req.params.PolicyId;
    await executeQuery('DELETE FROM ClientPolicy WHERE ClientId = ? AND PolicyId = ?', [ClientId, PolicyId]);
    res.json({ message: 'Client policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client policy' });
  }
});

module.exports = router;