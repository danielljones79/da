function createDominoes(maxNumber) {
  let dominoes = [];
  for (let i = 0; i <= maxNumber; i++) {
      for (let j = i; j <= maxNumber; j++) {
          dominoes.push({a: i, b: j});
      }
  }
  return dominoes;
}

function shuffleDominoes(dominoes) {
  for (let i = dominoes.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [dominoes[i], dominoes[j]] = [dominoes[j], dominoes[i]];
  }
  return dominoes;
}

function drawDominoes(players, shuffledDominoes, dominoesPerPlayer) {
  let playerDominoes = {};
  for (let i = 1; i <= players; i++) {
      playerDominoes['P' + i] = shuffledDominoes.slice((i - 1) * dominoesPerPlayer, i * dominoesPerPlayer);
  }
  return playerDominoes;
}

function arrangeDominoes(playersDominoes, currentPlayerDominoes, currentTrain, usedDominoes) {
  if (currentPlayerDominoes.length === 0) {
      return currentTrain;
  }

  let longestTrain = currentTrain;
  for (let i = 0; i < currentPlayerDominoes.length; i++) {
      let domino = currentPlayerDominoes[i];
      if (usedDominoes.includes(domino)) {
          continue;
      }
      let newCurrentPlayerDominoes = currentPlayerDominoes.slice(0, i).concat(currentPlayerDominoes.slice(i + 1));
      if (currentTrain.length === 0 || currentTrain[currentTrain.length - 1].b === domino.a) {
          let newTrain = arrangeDominoes(playersDominoes, newCurrentPlayerDominoes, currentTrain.concat(domino), usedDominoes.concat(domino));
          if (newTrain.length > longestTrain.length) {
              longestTrain = newTrain;
          }
      }
      if (currentTrain.length === 0 || currentTrain[currentTrain.length - 1].b === domino.b) {
          let newTrain = arrangeDominoes(playersDominoes, newCurrentPlayerDominoes, currentTrain.concat({a: domino.b, b: domino.a}), usedDominoes.concat(domino));
          if (newTrain.length > longestTrain.length) {
              longestTrain = newTrain;
          }
      }
  }
  return longestTrain;
}

function printResponse(playerTrains, playersDominoes) {
  let response = {};
  for (let player in playerTrains) {
      let train = playerTrains[player];
      let remainingDominoes = playersDominoes[player].filter(domino => !train.includes(domino) && !train.includes({a: domino.b, b: domino.a}));
      response[player] = {
          drawnTiles: playersDominoes[player].map(domino => domino.a + ':' + domino.b).join(','),
          train: train.map(domino => domino.a + ':' + domino.b).join(','),
          remaining: remainingDominoes.map(domino => domino.a + ':' + domino.b).join(',')
      };
  }
  console.log(JSON.stringify(response, null, 2));
}

let allDominoes = createDominoes(15);
let shuffledDominoes = shuffleDominoes(allDominoes);
let playersDominoes = drawDominoes(5, shuffledDominoes, 10);
let playerTrains = {};

for (let player in playersDominoes) {
  playerTrains[player] = arrangeDominoes(playersDominoes, playersDominoes[player], [], []);
}

printResponse(playerTrains, playersDominoes);