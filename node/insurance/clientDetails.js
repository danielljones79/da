const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db');

router.get('/', async (req, res) => {
  try {
    const clientDetails = await executeQuery('SELECT * FROM ClientDetails');
    res.json(clientDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client details' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { FirstName, LastName, Email, Phone, Address } = req.body;
    await executeQuery('INSERT INTO ClientDetails SET ?', { FirstName, LastName, Email, Phone, Address });
    res.json({ message: 'Client details created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating client details' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const clientDetails = await executeQuery('SELECT * FROM ClientDetails WHERE id = ?', [id]);
    if (clientDetails.length === 0) {
      res.status(404).json({ message: 'Client details not found' });
    } else {
      res.json(clientDetails[0]);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client details' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { FirstName, LastName, Email, Phone, Address } = req.body;
    await executeQuery('UPDATE ClientDetails SET ? WHERE id = ?', [{ FirstName, LastName, Email, Phone, Address }, id]);
    res.json({ message: 'Client details updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating client details' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await executeQuery('DELETE FROM ClientDetails WHERE id = ?', [id]);
    res.json({ message: 'Client details deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client details' });
  }
});

module.exports = router;