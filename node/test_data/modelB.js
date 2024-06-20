import mysql from 'mysql2/promise';
import axios from 'axios';
import moment from 'moment';

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 3308,
  user: 'root',
  password: 'test',
  database: 'insurance'
};

// Create database connection
const conn = mysql.createPool(dbConfig);

// Get change ID
const getChangeId = async () => {
  console.log('Getting change ID...');
  const processDate = moment().format('YYYY-MM-DD');
  const effectiveStartDate = moment().add(Math.floor(Math.random() * 60) - 30, 'days').format('YYYY-MM-DD');
  const effectiveEndDate = '9999-12-31';
  const userId = 1;
  const changeSummary = 'New Policy';

  // Insert change into database
  const [results] = await conn.execute('INSERT INTO Changes (ProcessDate, EffectiveStartDate, EffectiveEndDate, UserID, ChangeSummary) VALUES (?, ?, ?, ?, ?)', [processDate, effectiveStartDate, effectiveEndDate, userId, changeSummary]);
  console.log('Change ID:', results.insertId);
  return results.insertId;
};

// Get random state
const getRandomState = async () => {
  // Select random state from database
  const [results] = await conn.execute('SELECT AB FROM States ORDER BY RAND() LIMIT 1');
  console.log('Account state:', results[0].AB);
  return results[0].AB;
};

// Get address
const getAddress = async (state) => {
  // Get address from API
  const response = await axios.get(`http://localhost:3000/test-data/address?state=${state}`);
  console.log('Address:', response.data);
  return response.data;
};

// Get first name
const getFirstName = async (gender) => {
  // Get first name from API
  const response = await axios.get(`http://localhost:3000/test-data/first-name?gender=${gender}`);
  return response.data;
};

// Get last name
const getLastName = async () => {
  // Get last name from API
  const response = await axios.get('http://localhost:3000/test-data/last-name');
  return response.data;
};

// Create account
const createAccount = async (name, changeId) => {
  // Insert account into database
  const [results] = await conn.execute('INSERT INTO Accounts (Name, ChangeID) VALUES (?, ?)', [name, changeId]);
  return results.insertId;
};

// Create policy
const createPolicy = async (accountId, policyNumber, type, addressId, underwritingTeamId, agentId, changeId) => {
  // Insert policy into database
  const [results] = await conn.execute('INSERT INTO Policies (Number, AccountID, Type, AddressID, UnderwritingTeamID, AgentID, ChangeID) VALUES (?, ?, ?, ?, ?, ?, ?)', [policyNumber, accountId, type, addressId, underwritingTeamId, agentId, changeId]);
  console.log('Policy Number:', policyNumber);
  return results.insertId;
};

// Create policy coverage
const createPolicyCoverage = async (policyId, coverageId, limit, changeId) => {
  // Round limit to nearest 1000
  const roundedLimit = Math.round(limit / 1000) * 1000;

  // Insert policy coverage into database
  const [results] = await conn.execute('INSERT INTO PolicyCoverages (PolicyID, CoverageID, CovLimit, ChangeID) VALUES (?, ?, ?, ?)', [policyId, coverageId, roundedLimit, changeId]);
  return results.insertId;
};

// Create policy endorsement
const createPolicyEndorsement = async (policyId, endorsementId, changeId) => {
  // Insert policy endorsement into database
  const [results] = await conn.execute('INSERT INTO PolicyEndorsements (PolicyID, EndorsementID, ChangeID) VALUES (?, ?, ?)', [policyId, endorsementId, changeId]);
  return results.insertId;
};

// Main function
const main = async () => {
  console.log('Starting main function...');

  // Get coverages and endorsements from database
  const coverages = await conn.execute('SELECT c.ID, c.Type, c.Name, c.Mandatory, cl.State, cl.MinLimit, cl.MaxLimit FROM Coverages c JOIN CoverageLimits cl ON c.ID = cl.CoverageID');
  const coverageData = coverages[0];

  const endorsements = await conn.execute('SELECT e.ID, e.Type, e.Name, e.State FROM Endorsements e');
  const endorsementData = endorsements[0];

  const underwritingTeams = await conn.execute('SELECT ID, Name FROM UnderwritingTeams');
  const underwritingTeamData = underwritingTeams[0];

  const agents = await conn.execute('SELECT ID, Name FROM Agents');
  const agentData = agents[0];

  // Loop through accounts
  for (let i = 0; i < 10; i++) {
    console.log(`New Account ${i}`);

    // Create change and get ID
    const changeId = await getChangeId();

    // Get random state and address
    const state = await getRandomState();
    const address = await getAddress(state);

    // Insert address into database
    const [results] = await conn.execute('INSERT INTO Addresses (Line1, City, State, PostalCode, ChangeID) VALUES (?, ?, ?, ?, ?)', [address.street, address.city, address.state, address.zip, changeId]);
    const addressId = results.insertId;

    // Determine marital status
    const maritalStatus = Math.random() < 0.5 ? 'married' : 'single';
    let accName;

    // Generate account name
    if (maritalStatus === 'married') {
      const maleFirstName = await getFirstName('male');
      const femaleFirstName = await getFirstName('female');
      const lastName = await getLastName();
      accName = `${maleFirstName} & ${femaleFirstName} ${lastName}`;
    } else {
      const firstName = await getFirstName();
      const lastName = await getLastName();
      accName = `${firstName} ${lastName}`;
    }

    // Create account and get ID
    const accountId = await createAccount(accName, changeId);
    console.log(`New Account ID: ${accountId}`);

    // Determine number of policies
    const policyCount = Math.floor(Math.random() * 6) + 1;

    // Loop through policies
    for (let j = 0; j < policyCount; j++) {
      // Determine policy type
      const policyType = ['A', 'H', 'L'][Math.floor(Math.random() * 3)];

      // Generate policy number
      const policyNumber = `${state}${policyType}${Math.floor(Math.random() * 10000000)}`;

      // Determine underwriting team and agent
      const underwritingTeam = underwritingTeamData[Math.floor(Math.random() * underwritingTeamData.length)];
      const agent = agentData[Math.floor(Math.random() * agentData.length)];

      // Create policy and get ID
      const policyId = await createPolicy(accountId, policyNumber, policyType, addressId, underwritingTeam.ID, agent.ID, changeId);

      // Determine state coverages
      const stateCoverages = coverageData.filter(coverage => coverage.State === state && coverage.Type === policyType);
      const coverageNames = [];

      // Add policy coverages
      if (policyType === 'L') {
        const coverage = stateCoverages[Math.floor(Math.random() * stateCoverages.length)];
        const covLimit = Math.floor(Math.random() * (coverage.MaxLimit - coverage.MinLimit + 1)) + coverage.MinLimit;
        await createPolicyCoverage(policyId, coverage.ID, covLimit, changeId);
        coverageNames.push(coverage.Name);
      } else {
        for (const coverage of stateCoverages) {
          if (coverage.Mandatory || Math.random() < 0.5) {
            const covLimit = Math.floor(Math.random() * (coverage.MaxLimit - coverage.MinLimit + 1)) + coverage.MinLimit;
            await createPolicyCoverage(policyId, coverage.ID, covLimit, changeId);
            coverageNames.push(coverage.Name);
          }
        }
      }

      // Log coverage names
      if (coverageNames.length > 0) {
        console.log(`  Added ${policyType === 'A' ? 'Auto' : policyType === 'H' ? 'Home' : 'Life'} coverages: ${coverageNames.join(', ')}`);
      }

      // Determine state endorsements
      const stateEndorsements = endorsementData.filter(endorsement => endorsement.State === state && endorsement.Type === policyType);
      const endorsementNames = [];

      // Add policy endorsements
      for (const endorsement of stateEndorsements) {
        if (Math.random() < 0.5) {
          await createPolicyEndorsement(policyId, endorsement.ID, changeId);
          endorsementNames.push(endorsement.Name);
        }
      }

      // Log endorsement names
      if (endorsementNames.length > 0) {
        console.log(`  Added ${policyType === 'A' ? 'Auto' : policyType === 'H' ? 'Home' : 'Life'} endorsements: ${endorsementNames.join(', ')}`);
      }
    }
  }

  console.log('Finished main function.');
  // Close database connection
  conn.end();
};

// Call main function
main();