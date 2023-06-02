const { v4: uuid } = require("uuid");

const words = ["Banana", "Canine", "Unosquare", "Airport"];
const games = {};

const retrieveWord = () => words[Math.floor(Math.random(words.length - 1))];

const clearUnmaskedWord = (game) => {
    const withoutUnmasked = { 
        ...game,
    };
    delete withoutUnmasked.unmaskedWord;
    return withoutUnmasked;
}


function createGame(req, res) {
  const newGameWord = retrieveWord();
  const newGameId = uuid();
  const newGame = {
    remainingGuesses: 6,
    unmaskedWord: newGameWord,
    word: newGameWord.replaceAll(/[a-zA-Z0-9]/g, "_"),
    status: "In Progress",
    incorrectGuesses: [],
  };

  games[newGameId] = newGame;

  res.send(newGameId);

}

function getGame(req, res) { 
    const { gameId } = req.params;
    if (!gameId) return res.sendStatus(404);

    var game = games[gameId];
    if (!game) {
        return res.sendStatus(404); 
    }

    res.status(200).json(clearUnmaskedWord(game));
}

function createGuess(req, res) { 
    const { gameId } = req.params;
    const { letter } = req.body;

    if (!gameId) return res.sendStatus(404);

    var game = games[gameId];
    if (!game) return res.sendStatus(404); 

    if (!letter || letter.length != 1) {
        return res.status(400).json({
            Message: "Guess must be supplied with 1 letter"
        })
    }

    // todo: add logic for making a guess, modifying the game and updating the status

    if(game.word.toUpperCase().includes(letter.toUpperCase())){
        return res.status(400).json({
            Message: "Letter has already been guessed"
        })
    }
   
    if(isLetterInWord(game.unmaskedWord, letter)) {
        const updatedWord = game.word
        .split("")
        .map((char, index) => {
            if (game.unmaskedWord.charAt(index).toUpperCase() === letter.toUpperCase()) {
            return game.unmaskedWord.charAt(index);
          }
          return char;
        })
        .join("");
    
      game.word = updatedWord;
    
    } else {
        game.incorrectGuesses.push(letter.toUpperCase());
        return res.status(200).json({ 
            Message: "Incorrect!" 
        });
    }

    if(game.unmaskedWord === game.word) {
        game.status = "Completed";
        return res.status(200).json({ 
            Message: "You won!" });
      }

    game.remainingGuesses--; 

    if(game.remainingGuesses < 1) {
        game.status = "Lost";
        return res.status(400).json({ 
            Message: "You have lost!" });
      }

    return res.status(200).json(clearUnmaskedWord(game));
}

//check if letter is in the word
const isLetterInWord = (word, letter) => {
    return word.toUpperCase().includes(letter.toUpperCase());
}

function deleteGame(req, res){
    const { gameId } = req.params;
    if (!gameId) return res.sendStatus(404);

    var game = games[gameId];
    if (!game) {
        return res.sendStatus(404); 
    }
    delete games[gameId];
    return res.status(204).json({ message: 'Game deleted successfully' });

}

module.exports = {
    createGame,
    getGame,
    createGuess,
    deleteGame,
  };