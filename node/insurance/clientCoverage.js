const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db');

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const lines = req.query.lines ? req.query.lines.split(',') : [];

    if (lines.length === 0) {
      res.status(400).json({ message: 'No lines provided' });
      return;
    }


    sqlQuery = `WITH RECURSIVE dates AS (
      SELECT MIN(EffectiveStartDate) AS date
      FROM PolicyCoverage
      WHERE id IN (SELECT PolicyId FROM ClientPolicy WHERE ClientId IN (1, 2))
      UNION ALL
      SELECT date + INTERVAL 1 DAY
      FROM dates
      WHERE date <= CURRENT_DATE
    ),
    policies AS (
      SELECT 
        date,
        MAX(CASE WHEN PolicyType = 'home' THEN 1 ELSE 0 END) AS home,
        MAX(CASE WHEN PolicyType = 'auto' THEN 1 ELSE 0 END) AS auto,
        MAX(CASE WHEN PolicyType = 'life' THEN 1 ELSE 0 END) AS life
      FROM dates
      LEFT JOIN PolicyCoverage pc ON dates.date BETWEEN pc.EffectiveStartDate AND pc.EffectiveEndDate
      LEFT JOIN ClientPolicy cp ON pc.id = cp.PolicyId
      WHERE cp.ClientId IN (1, 2)
      GROUP BY date
    )
    SELECT 
      COUNT(*) AS consecutive_days
    FROM (
      SELECT 
        date,
        home,
        auto,
        life,
        SUM(CASE WHEN home = 0 OR auto = 0 OR life = 0 THEN 1 ELSE 0 END) OVER (ORDER BY date DESC) AS gap
      FROM policies
      ORDER BY date DESC
    ) AS subquery
    WHERE gap = 0;`
    const policyCoverage = await executeQuery(sqlQuery);
    processCoverages(policyCoverage)
    if (policyCoverage.length === 0) {
      res.status(404).json({ message: 'Client has no policy coverage' });
    } else {
      res.json(policyCoverage);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching policy coverage' });
  }
});

function processCoverages(policyCoverage) {
  policyCoverage.forEach(function (cov) {
    console.log(cov.PolicyType);
});
}

module.exports = router;