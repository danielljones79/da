WITH RECURSIVE dates AS (
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
SELECT * FROM policies
ORDER BY date;


With  
	auto as (select p.Number, c.EffectiveStartDate, c.EffectiveEndDate from Policies p inner join Changes c on p.ChangeID = c.ID where p.type = 'A' ),
	home as (select p.Number, c.EffectiveStartDate, c.EffectiveEndDate from Policies p inner join Changes c on p.ChangeID = c.ID where p.type = 'H' ),
    life as (select p.Number, c.EffectiveStartDate, c.EffectiveEndDate from Policies p inner join Changes c on p.ChangeID = c.ID where p.type = 'L' )
select * from auto where EffectiveEndDate = '9999-12-31' 
union all 
select * from home where EffectiveEndDate = '9999-12-31'   
union all 
select * from life where EffectiveEndDate = '9999-12-31';

SELECT 
  p.Number, 
  c.EffectiveStartDate, 
  c.EffectiveEndDate 
FROM 
  Policies p 
  INNER JOIN Changes c on p.ChangeID = c.ID 
WHERE 
  p.Type IN('A', 'H', 'L') 
  AND c.EffectiveEndDate = '9999-12-31';

WITH RECURSIVE dates AS (
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
WHERE gap = 0;


With activePolicies as (SELECT 
  p.Number, 
  p.AccountID,
  p.Type,
  c.EffectiveStartDate, 
  c.EffectiveEndDate 
FROM 
  Policies p 
  INNER JOIN Changes c on p.ChangeID = c.ID 
WHERE 
  p.Type IN('A', 'H', 'L') 
  AND c.EffectiveEndDate = '9999-12-31')
 Select AccountID , count(*) from activePolicies ap1 where  exists
 (select 1 from activePolicies ap2 where ap1.AccountID  = ap2.AccountID and ap2.EffectiveStartDate <= '2023-06-06' and ap2.Type = 'A')
 and exists
  (select 1 from activePolicies ap2 where ap1.AccountID  = ap2.AccountID and ap2.EffectiveStartDate <= '2023-06-06' and ap2.Type = 'H')
  and exists
   (select 1 from activePolicies ap2 where ap1.AccountID  = ap2.AccountID and ap2.EffectiveStartDate <= '2023-06-06' and ap2.Type = 'L')
   group by AccountID
   order by AccountID asc;
   
   With triLine as (SELECT 
	a.ID FROM Accounts a1 
	WHERE exists
     (select 1 from Policies p2 where a1.ID  = p2.AccountID and ap2.EffectiveStartDate <= '2024-06-06' and ap2.Type = 'A');
     
     
SET @DateLimit = (SELECT  CURRENT_DATE - INTERVAL 1 YEAR);

With QualifyingPolicies AS (
Select a.ID,
p.Type,
count(*) as cnt
FROM Accounts a inner join Policies p on p.AccountID = a.ID inner join 
Changes c on c.ID = p.ChangeID  where c.EffectiveStartDate <= @DateLimit and c.EffectiveEndDate = '9999-12-31'
group by a.ID, p.Type)
Select a.ID, 
count(*)
from Accounts a 
inner join Policies p on p.AccountID = a.ID
inner join Changes c on c.ID = p.ChangeID
inner join QualifyingPolicies qp1 on qp1.ID = a.ID and qp1.Type = 'H'
inner join QualifyingPolicies qp2 on qp2.ID = a.ID and qp2.Type = 'A'
inner join QualifyingPolicies qp3 on qp3.ID = a.ID and qp3.Type = 'L'
where c.EffectiveEndDate = '9999-12-31';





