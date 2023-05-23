import app from './app';
import pool from './database';
const appSocket = require('http').Server(app);

import { Server } from "socket.io";
const io = new Server(appSocket, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
});
io.on('connect_error', (err) => {
  console.log(err);
})

io.on('connection', (socket) => {
  if(socket){console.log(true);}
  const clientId = socket.id;
  const { gameId, playerId } = socket.handshake.query;
  console.log(`Id del jugador: ${playerId} --- Id del cliente: ${clientId}`);

  setClientIdToPlayer(playerId, clientId).then(async (res) => {
    socket.join(gameId);
    //Emite sólo al cliente que envió la petición
    //socket.emit('welcome', {messaje: '¡Bienvenido al juego!', player: res});
    const data = await getPlayersByGameId(gameId);
    socket.to(gameId).emit('player', data);
  });

  // Manejar la desconexión de un cliente
  socket.on('disconnect', () => {
    console.log(`Cliente ${clientId} desconectado`);
  });

  //playerStatus
  socket.on('player', async (res) => {
/*     console.log("Si true, Se ha unido");
    console.log(res); */
    const data = await getPlayersByGameId(gameId);
    socket.to(gameId).emit('player', data);
  });

  //playerStatus
  socket.on('gameStatus', async (req) => {
    console.log("Sí notifica");
    socket.to(gameId).emit('gameStatus', req);
  });

})

const getPlayersByGameId = (id_partida) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM "JUGADORES" WHERE "FK_PARTIDA" = $1', [id_partida], (err, result) => {
      if (err) {
          reject(err);
      } else {
          if (result.rows.length) {
              resolve(result.rows);
          }
      }
    });
  });
};

const setClientIdToPlayer = (id_player, id_cliente) => {
  return new Promise((resolve, reject) => {

    const query = {
      text: 'UPDATE "JUGADORES" SET "ID_CLIENTE" = $1 WHERE "ID_JUGADOR" = $2 RETURNING *',
      values: [id_cliente, id_player]
    };

    pool.query(query, (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        if (result.rows.length) {
          resolve(result.rows);
        }
      }
    });
  });
};

export default appSocket;