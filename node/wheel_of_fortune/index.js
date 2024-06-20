import express from 'express';
import mysql from 'mysql2/promise';
import { generate, count } from "random-words";

const app = express();
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',
  port: 3308,
  user: 'root',
  password: 'test',
  database: 'wheel_of_fortune'
});

// Create a new game
app.post('/games', async (req, res) => {
  try {
    const { maxPlayers, numRounds, includeBankruptcy, includeLoseTurn } = req.body;
    const gameCode = generateToken(); // implement a function to generate a unique game code
    const result = await db.query('INSERT INTO Games (GameCode, MaxPlayers, NumRounds, IncludeBankruptcy, IncludeLoseTurn) VALUES (?, ?, ?, ?, ?)', [gameCode, maxPlayers, numRounds, includeBankruptcy, includeLoseTurn]);
    const gameId = result[0].insertId;
    res.json({ gameId, gameCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating game' });
  }
});

// Join a game
app.post('/games/:gameCode/players', async (req, res) => {
  try {
    const gameCode = req.params.gameCode;
    const { playerName } = req.body;
    const result = await db.query('SELECT GameID FROM Games WHERE GameCode = ?', [gameCode]);
    if (result[0].length === 0) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }
    const gameId = result[0][0].GameID;
    const playerCount = await db.query('SELECT COUNT(*) AS count FROM Players WHERE GameID = ?', [gameId]);
    if (playerCount[0][0].count >= 3) {
      res.status(400).json({ message: 'Game is full' });
      return;
    }
    const token = generateToken(); // implement a function to generate a unique token
    await db.query('INSERT INTO Players (GameID, PlayerName, Token) VALUES (?, ?, ?)', [gameId, playerName, token]);
    res.json({ gameId, playerName, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error joining game' });
  }
});

// Begin a game
app.post('/games/:gameCode/begin', async (req, res) => {
  try {
    const gameCode = req.params.gameCode;
    const result = await db.query('SELECT GameID FROM Games WHERE GameCode = ?', [gameCode]);
    if (result[0].length === 0) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }
    const gameId = result[0][0].GameID;
    await db.query('UPDATE Games SET Status = ? WHERE GameID = ?', ['active', gameId]);
    const puzzleId = await selectPuzzle(); // implement a function to select a random puzzle
    await db.query('INSERT INTO GameRounds (GameID, RoundNumber, PuzzleID) VALUES (?, ?, ?)', [gameId, 1, puzzleId]);
    const data = { currentPlayerTurn: 1, scores: {} }; // initialize game data
    await db.query('UPDATE GameRounds SET Data = ? WHERE GameID = ? AND RoundNumber = ?', [JSON.stringify(data), gameId, 1]);
    res.json({ gameId, puzzleId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error beginning game' });
  }
});

function generateToken() {
  const words = randomWords({ exactly: 2, maxLength: 5 });
  return words.join('');
}

app.post('/spin', async (req, res) => {
  try {
    const gameCode = req.body.gameCode;
    const result = await db.query('SELECT GameID FROM Games WHERE GameCode = ?', [gameCode]);
    if (result[0].length === 0) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }
    const gameId = result[0][0].GameID;
    const spinResult = spin();
    if (spinResult === 'bankrupt') {
      // Update the game state to reflect the bankruptcy
      await db.query('UPDATE Games SET Status = ? WHERE GameID = ?', ['bankrupt', gameId]);
    } else if (spinResult === 'lose-turn') {
      // Update the game state to reflect the lost turn
      await db.query('UPDATE Games SET Status = ? WHERE GameID = ?', ['lost-turn', gameId]);
    } else {
      // Update the game state to reflect the spin result
      const currentPlayerId = await db.query('SELECT PlayerID FROM Players WHERE GameID = ? AND IsCurrentPlayer = ?', [gameId, 1]);
      await db.query('UPDATE Players SET Score = Score + ? WHERE PlayerID = ?', [spinResult, currentPlayerId[0][0].PlayerID]);
    }
    res.json({ spinResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error spinning' });
  }
});

// Buy a vowel
app.post('/buy-vowel', async (req, res) => {
  try {
    const gameCode = req.body.gameCode;
    const vowel = req.body.vowel;
    const result = await db.query('SELECT GameID FROM Games WHERE GameCode = ?', [gameCode]);
    if (result[0].length === 0) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }
    const gameId = result[0][0].GameID;
    const currentPlayerId = await db.query('SELECT PlayerID FROM Players WHERE GameID = ? AND IsCurrentPlayer = ?', [gameId, 1]);
    const playerScore = await db.query('SELECT Score FROM Players WHERE PlayerID = ?', [currentPlayerId[0][0].PlayerID]);
    if (playerScore[0][0].Score < 250) {
      res.status(400).json({ message: 'Insufficient funds' });
      return;
    }
    await db.query('UPDATE Players SET Score = Score - 250 WHERE PlayerID = ?', [currentPlayerId[0][0].PlayerID]);
    // Reveal the vowel in the puzzle
    res.json({ message: 'Vowel bought successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error buying vowel' });
  }
});

// Returns a random value between 200 and 1200 in increments of 50,
// Returns a random Wheel of Fortune spin value
// Can return a cash value, "bankrupt", or "lose-turn"
function spin() {
  const cashValues = Array.from({length: 21}, (_, i) => 200 + i * 50);
  const specialValues = ["bankrupt", "lose-turn"];
  const allValues = [...cashValues, ...specialValues];
  return allValues[Math.floor(Math.random() * allValues.length)];
}

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});