import express, { urlencoded, json } from 'express';
import path from 'path';
import cors from 'cors';
require('dotenv').config();

import * as controllers from './controllers';

const app = express();
// middlewares
app.use(urlencoded({extended: false}));
app.use(json());
app.use(cors({
  origin: '*'
}));

app.use('/files', express.static(path.resolve('../files')));

app.get('/', function(req, res){
    res.send("Prueba")
});

// Game
app.post('/api/game', controllers.createGame);
app.get('/api/game/available/:id', controllers.gameAvailable);
app.get('/api/game/id/:id', controllers.getGameById);
app.put('/api/game/id/:id', controllers.updateGameById);

// Player
app.post('/api/player', controllers.createPlayer);
app.get('/api/player/available/:playerId/:gameId', controllers.playerAvailable);
app.get('/api/player/gameId/:gameId', controllers.getPlayersByGameId);

// Player
app.get('/api/avatars', controllers.getAllAvatars);
app.get('/api/avatars/id/:id', controllers.getAvatarById);

//Round
app.get('/api/rounds', controllers.getAllRounds);

//Start game
app.post('/api/game/start', controllers.getCardsForGame);

export default app;