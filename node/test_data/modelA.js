import mysql from 'mysql2/promise';
import axios from 'axios';
import moment from 'moment';

const dbConfig = {
  host: 'localhost',
  port: 3308,
  user: 'root',
  password: 'test',
  database: 'insurance'
};

const conn = mysql.createPool(dbConfig);

const getChangeId = async () => {
  const processDate = moment().format('YYYY-MM-DD');
  const effectiveStartDate = moment().add(Math.floor(Math.random() * 60) - 30, 'days').format('YYYY-MM-DD');
  const effectiveEndDate = '9999-12-31';
  const userId = 1;
  const changeSummary = 'New Policy';

  const [results] = await conn.execute('INSERT INTO Changes (ProcessDate, EffectiveStartDate, EffectiveEndDate, UserID, ChangeSummary) VALUES (?, ?, ?, ?, ?)', [processDate, effectiveStartDate, effectiveEndDate, userId, changeSummary]);
  console.log('Change ID:', results.insertId);
  return results.insertId;
};

const getRandomState = async () => {
  const [results] = await conn.execute('SELECT AB FROM States ORDER BY RAND() LIMIT 1');
  console.log('Account state:', results[0].AB);
  return results[0].AB;
};

const getAddress = async (state) => {
  const response = await axios.get(`http://localhost:3000/test-data/address?state=${state}`);
  console.log('Account Address:', response.data);
  return response.data;
};

const getFirstName = async (gender) => {
  const response = await axios.get(`http://localhost:3000/test-data/first-name?gender=${gender}`);
  return response.data;
};

const getLastName = async () => {
  console.log('Getting last name...');
  const response = await axios.get('http://localhost:3000/test-data/last-name');
  console.log('Last name:', response.data);
  return response.data;
};

const createAccount = async (name, changeId) => {
  console.log('Creating account for name:', name);
  const [results] = await conn.execute('INSERT INTO Accounts (Name, ChangeID) VALUES (?, ?)', [name, changeId]);
  console.log('Account ID:', results.insertId);
  return results.insertId;
};

const createPolicy = async (accountId, policyNumber, type, addressId, underwritingTeamId, agentId, changeId) => {
  console.log('Creating policy for account ID:', accountId);
  const [results] = await conn.execute('INSERT INTO Policies (Number, AccountID, Type, AddressID, UnderwritingTeamID, AgentID, ChangeID) VALUES (?, ?, ?, ?, ?, ?, ?)', [policyNumber, accountId, type, addressId, underwritingTeamId, agentId, changeId]);
  console.log('Policy ID:', policyNumber);
  return results.insertId;
};

const createPolicyCoverage = async (policyId, coverageId, limit, changeId) => {
  const roundedLimit = Math.round(limit / 1000) * 1000;
  console.log('Creating policy coverage for policy ID:', policyId);
  const [results] = await conn.execute('INSERT INTO PolicyCoverages (PolicyID, CoverageID, CovLimit, ChangeID) VALUES (?, ?, ?, ?)', [policyId, coverageId, roundedLimit, changeId]);
  console.log('Policy coverage ID:', results.insertId);
  return results.insertId;
};

const createPolicyEndorsement = async (policyId, endorsementId, changeId) => {
  console.log('Creating policy endorsement for policy ID:', policyId);
  const [results] = await conn.execute('INSERT INTO PolicyEndorsements (PolicyID, EndorsementID, ChangeID) VALUES (?, ?, ?)', [policyId, endorsementId, changeId]);
  console.log('Policy endorsement ID:', results.insertId);
  return results.insertId;
};

const main = async () => {
  console.log('Starting main function...');
  const coverages = await conn.execute('SELECT c.ID, c.Type, c.Name, c.Mandatory, cl.State, cl.MinLimit, cl.MaxLimit FROM Coverages c JOIN CoverageLimits cl ON c.ID = cl.CoverageID');
  const coverageData = coverages[0];

  const endorsements = await conn.execute('SELECT e.ID, e.Type, e.Name, e.State FROM Endorsements e');
  const endorsementData = endorsements[0];

  const underwritingTeams = await conn.execute('SELECT ID, Name FROM UnderwritingTeams');
  const underwritingTeamData = underwritingTeams[0];

  const agents = await conn.execute('SELECT ID, Name FROM Agents');
  const agentData = agents[0];

  for (let i = 0; i < 10; i++) {
    console.log(`New Account ${i}`);
    const changeId = await getChangeId();
    const state = await getRandomState();
    const address = await getAddress(state);
    console.log(`Getting address for state: ${state}`);
    console.log(`Address: ${JSON.stringify(address, null, 2)}`);

    const maritalStatus = Math.random() < 0.5 ? 'married' : 'single';
    let accName;
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

    const accountId = await createAccount(accName, changeId);
    console.log(`New Account ID: ${accountId}`);

    const policyCount = Math.floor(Math.random() * 6) + 1;
    for (let j = 0; j < policyCount; j++) {
      const policyType = ['A', 'H', 'L'][Math.floor(Math.random() * 3)];
      const policyNumber = `${state}${policyType}${Math.floor(Math.random() * 10000000)}`;
      const underwritingTeam = underwritingTeamData[Math.floor(Math.random() * underwritingTeamData.length)];
      const agent = agentData[Math.floor(Math.random() * agentData.length)];
      const policyId = await createPolicy(accountId, policyNumber, policyType, addressId, underwritingTeam.ID, agent.ID, changeId);
      console.log(`Policy Number: ${policyNumber}`);

      const stateCoverages = coverageData.filter(coverage => coverage.State === state && coverage.Type === policyType);
      const coverageNames = [];
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
      if (coverageNames.length > 0) {
        console.log(`  Added ${policyType === 'A' ? 'Auto' : policyType === 'H' ? 'Home' : 'Life'} coverages: ${coverageNames.join(', ')}`);
      }

      const stateEndorsements = endorsementData.filter(endorsement => endorsement.State === state && endorsement.Type === policyType);
      const endorsementNames = [];
      for (const endorsement of stateEndorsements) {
        if (Math.random() < 0.5) {
          await createPolicyEndorsement(policyId, endorsement.ID, changeId);
          endorsementNames.push(endorsement.Name);
        }
      }
      if (endorsementNames.length > 0) {
        console.log(`  Added ${policyType === 'A' ? 'Auto' : policyType === 'H' ? 'Home' : 'Life'} endorsements: ${endorsementNames.join(', ')}`);
      }
    }
  }
  console.log('Finished main function.');
  conn.end();
};
main()