const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db');

router.get('/', async (req, res) => {
  try {
    const policyCoverages = await executeQuery('SELECT * FROM PolicyCoverage');
    res.json(policyCoverages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching policy coverages' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { PolicyNumber, PolicyType, EffectiveStartDate, EffectiveEndDate } = req.body;
    await executeQuery('INSERT INTO PolicyCoverage SET ?', { PolicyNumber, PolicyType, EffectiveStartDate, EffectiveEndDate });
    res.json({ message: 'Policy coverage created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating policy coverage' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const policyCoverage = await executeQuery('SELECT * FROM PolicyCoverage WHERE id = ?', [id]);
    if (policyCoverage.length === 0) {
      res.status(404).json({ message: 'Policy coverage not found' });
    } else {
      res.json(policyCoverage[0]);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching policy coverage' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { PolicyNumber, PolicyType, EffectiveStartDate, EffectiveEndDate } = req.body;
    await executeQuery('UPDATE PolicyCoverage SET ? WHERE id = ?', [{ PolicyNumber, PolicyType, EffectiveStartDate, EffectiveEndDate }, id]);
    res.json({ message: 'Policy coverage updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating policy coverage' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await executeQuery('DELETE FROM PolicyCoverage WHERE id = ?', [id]);
    res.json({ message: 'Policy coverage deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting policy coverage' });
  }
});

module.exports = router;