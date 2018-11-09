function initGames() {
  const { games } = require("./games.json");
  return games;
}
function initAliases() {
  const { aliases } = require("./aliases.json");
  return aliases;
}

// const { games } = require("./games.json");
// const { aliases } = require("./aliases.json");
//
// console.log(games["sfv"]);
// console.log(aliases["sf5"]);

const games = new Map(Object.entries(initGames()));
const aliases = new Map(Object.entries(initAliases()));

// console.log(games.get("sfv").title);
if (games.has("sf5")) {
  console.log(games.get("sfv").title);
} else if (aliases.has("sf5")) {
  console.log(games.get("sfv").platforms);
}

// if (aliases.hasOwnProperty("sf5")) {
//   const game = aliases["sf5"].game;
//   if (games.hasOwnProperty(game)) {
//     console.log(games[game].title);
//   }
// }

// if (aliases["sf5"]) {
//   const game = aliases["sf5"].game;
//   if (games[game]) {
//     console.log(games[game].title);
//   }
// }

/* eslint-disable indent */
// xhr.onreadystatechange = function() {
//   if (this.readyState == 4 && this.status == 200) {
//     var games = JSON.parse(this.responseText);
//     console.log(games);
//   }
// };




// function getGamesAsync() {
//   return new Promise((resolve, reject) => {
// // eslint-disable-next-line no-undef
//     const xhr = new XMLHttpRequest();
//     xhr.open("GET", "games.json", true);
//     xhr.onload = () => resolve(xhr.responseText);
//     xhr.onerror = () => reject(xhr.statusText);
//     xhr.send();
//   });
// }
//
// function loadGamesAsync() {
//   return new Promise(async function(resolve, reject) {
//     const data = await getGamesAsync();
//     const games = JSON.parse(await data);
//     if (games) resolve(games);
//     if (!games) reject(data.error);
//   });
// }
//
// loadGamesAsync().then(games => console.log(games.games["sfv"]));