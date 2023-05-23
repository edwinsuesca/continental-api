import pool from './database';
import { formatUrlText, validateText, generateId, shuffleCards } from './helpers';

// Articles
export const createGame = async (req, res) => {
    try {
        const id_partida = generateId(30);
        const response = await pool.query('INSERT INTO "PARTIDAS" ("ID_PARTIDA", "ESTADO") VALUES ($1, $2) RETURNING *', [id_partida, false]);
/*         if (err) {
            if (err.routine === "_bt_check_unique"){
                res.status(409).send({message: 'Ya existe un artículo con el título ingresado.', error: err});
            } else {
                res.status(500).send({message: 'Error interno del servidor.', error: err});
            }
        } else {
            res.status(200).json({message: `Artículo '${title}' guardado.`});
        } */
        res.status(201).json({message: `Partida creada.`, id_partida: response.rows[0].ID_PARTIDA});
    } catch (err){
        console.log(err);
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
}

export const createPlayer = async (req, res) => {
    try {
        const id_jugador = generateId(30);
        const {nickname, id_avatar, id_partida, creador, turno} = req.body;

        //Consultar disponibilidad de avatar
        const avatar = await avatarAvailable(id_partida, id_avatar);
        if(!avatar){
            res.status(404).json({message: `Ups! Alguien acaba de elegir este avatar. No pasa nada, elige otro, te están esperando.`});
            return;
        }

        const response = await pool.query('INSERT INTO "JUGADORES" ("ID_JUGADOR", "NICKNAME", "FK_AVATAR", "FK_PARTIDA", "CREADOR", "TURNO") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id_jugador, nickname, id_avatar, id_partida, creador, turno]);
/*         if (err) {
            if (err.routine === "_bt_check_unique"){
                res.status(409).send({message: 'Ya existe un artículo con el título ingresado.', error: err});
            } else {
                res.status(500).send({message: 'Error interno del servidor.', error: err});
            }
        } else {
            res.status(200).json({message: `Artículo '${title}' guardado.`});
        } */
        res.status(201).json({message: `Jugador creado.`, player: response.rows[0]});
    } catch (err){
        console.log(err);
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
}

export const getAllAvatars = (req, res) => {
    try{
        pool.query('SELECT * FROM "AVATARS"', (err, result) => {
            if (err) {
                res.status(500).json({message: 'Error al consultar avatars.', error: err});
                return;
            } else {
                if (result.rows == 0) {
                    res.status(404).json({message: 'No existen avatars.'});
                } else {
                    res.status(200).send(result.rows);
                }
            }
        });
    } catch (err){
        console.log(err);
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
}

export const getAllRounds = (req, res) => {
    try{
        pool.query('SELECT * FROM "RONDAS"', (err, result) => {
            if (err) {
                res.status(500).json({message: 'Error al consultar rondas.', error: err});
                return;
            } else {
                if (result.rows == 0) {
                    res.status(404).json({message: 'No existen rondas.'});
                } else {
                    res.status(200).send(result.rows);
                }
            }
        });
    } catch (err){
        console.log(err);
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
}

export const getAvatarById = (req, res) => {
    try{
        const id_avatar = req.params.id;
        pool.query('SELECT * FROM "AVATARS" WHERE "ID_AVATAR" = $1', [id_avatar], async (err, result) => {
            if (err) {
                res.status(500).json({message: 'Error al consultar avatar.', error: err});
                return;
            } else {
                if (result.rows.length === 1) {
                    res.status(200).send(result.rows[0]);
                } else {
                    res.status(404).json({message: 'No existe un avatar con el ID ingresado.'});
                }
            }
        });
    } catch (err){
        console.log(err);
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
}

export const getGameById = (req, res) => {
    try{
        const id_partida = req.params.id;
        if(id_partida.length !== 30){
            res.status(404).send({message: 'Código inválido.'});
            return;
        }
        pool.query('SELECT * FROM "PARTIDAS" WHERE "ID_PARTIDA" = $1', [id_partida], async (err, result) => {
            if (err) {
                res.status(500).json({message: 'Error al consultar partida.', error: err});
                return;
            } else {
                if (result.rows.length === 1) {
                    res.status(200).send(result.rows[0]);
                } else {
                    res.status(404).json({message: 'No existen partidas con el código ingresado.'});
                }
            }
        });
    } catch (err){
        console.log(err);
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
}

export const updateGameById = (req, res) => {
    try{
        const id_partida = req.params.id;
        const {num_jugadores, num_barajas, estado, id_creador, id_ronda } = req.body;

        if(id_partida.length !== 30){
            res.status(404).send({message: 'Código inválido.'});
            return;
        }

        pool.query('UPDATE "PARTIDAS" SET "NUM_JUGADORES" = $1, "NUM_BARAJAS" = $2, "ESTADO" = $3, "FK_CREADOR" = $4, "FK_RONDA" = $5 WHERE "ID_PARTIDA" = $6 RETURNING *', [num_jugadores, num_barajas, estado, id_creador, id_ronda, id_partida], async (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({message: 'Error al actualizar partida.', error: err});
                return;
            } else {
                if (result.rows.length === 1) {
                    res.status(200).send(result.rows[0]);
                } else {
                    res.status(404).json({message: 'No existen partidas con el código ingresado.'});
                }
            }
        });
    } catch (err){
        console.log(err);
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
}

export const gameAvailable = (req, res) => {
    try{
        const id_partida = req.params.id;
        if(id_partida.length !== 30){
            res.status(404).json({message: 'Código inválido.', available: false});
            return;
        }
        pool.query('SELECT * FROM "PARTIDAS" WHERE "ID_PARTIDA" = $1', [id_partida], async (err, result) => {
            if (err) {
                res.status(500).json({message: 'Error al consultar partida.', error: err});
                return;
            } else {
                if (result.rows.length === 0) {
                    res.status(404).json({message: 'No existen partidas con el código ingresado.', available: false});
                } else {
                    const playersCount = await playerSlotAvailable(id_partida);
                    if(result.rows[0].ESTADO || !playersCount){
                        res.status(200).json({message: 'Partida no disponible.', available: false});
                        return;
                    }
                    res.status(200).json({message: 'Partida disponible.', available: true});
                }
            }
        });
    } catch (err){
        console.log(err);
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

export const playerAvailable = (req, res) => {
    try{
        const {playerId, gameId} = req.params;
        if(playerId.length !== 30 || gameId.length !== 30){
            res.status(404).json({message: 'Código inválido.', available: false});
            return;
        }
        pool.query('SELECT * FROM "JUGADORES" WHERE "ID_JUGADOR" = $1 AND "FK_PARTIDA" = $2', [playerId, gameId], async (err, result) => {
            if (err) {
                res.status(500).json({message: 'Error al consultar jugador.', error: err});
                return;
            } else {
                if (result.rows.length === 0) {
                    res.status(404).json({message: 'No existe un jugador con los códigos ingresados.'});
                } else {
                    res.status(200).json({message: 'Jugador encontrado.', player: result.rows[0]});
                }
            }
        });
    } catch (err){
        console.log(err);
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

const playerSlotAvailable = (id_partida) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM "JUGADORES" WHERE "FK_PARTIDA" = $1', [id_partida], (err, result) => {
        if (err) {
            reject(err);
        } else {
            if (result.rows.length < 7) {
                resolve(true);
            } else {
                resolve(false);
            }
        }
      });
    });
};

const avatarAvailable = (id_partida, id_avatar) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM "JUGADORES" WHERE "FK_PARTIDA" = $1 AND "FK_AVATAR" = $2', [id_partida, id_avatar], (err, result) => {
        if (err) {
            reject(err);
        } else {
            if (result.rows.length > 0) {
                resolve(false);
            } else {
                resolve(true);
            }
        }
      });
    });
};

export const getPlayersByGameId = async (req, res) => {
    try{
        const id_partida = req.params.gameId;
        pool.query('SELECT * FROM "JUGADORES" WHERE "FK_PARTIDA" = $1 ORDER BY "TURNO"', [id_partida], (err, result) => {
            if (err) {
                res.status(500).json({message: `Error al consultar jugadores en partida ${id_partida}.`, error: err});
                return;
            } else {
                if (result.rowCount > 0) {
                    res.status(200).json({players: result.rows});
                    return;
                } else {
                    res.status(404).json({message: 'No existen jugadores relacionados con el código ingresado.'});
                }
            }
        });
    } catch (err){
        console.log(err);
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
}

/* export const getPlayerById = async (req, res) => {
    try{
        const id_jugador = req.params.id;
        pool.query('SELECT * FROM "JUGADORES" WHERE "ID_JUGADOR" = $1', [id_jugador], (err, result) => {
            if (err) {
                res.status(500).json({message: `Error al consultar jugador en partida.`, error: err});
                return;
            } else {
                if (result.rows.length) {
                    res.status(200).json(result.rows);
                    return;
                } else {
                    res.status(404).json({message: 'No existen jugadores con el ID ingresado.'});
                }
            }
        });
    } catch (err){
        console.log(err);
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
} */

//Barajar cartas y enviar el número de barajas adecuadas
export const getCardsForGame = async (req, res) => {
    try{
        const {numBarajas, gameId} = req.body;
        pool.query('SELECT * FROM "CARTAS"', async (err, result) => {
            if (err) {
                res.status(500).json({message: `Error al generar cartas para la partida.`, error: err});
                return;
            } else {
                if (result.rows.length) {
                    const cartas = [];
                    result.rows.map(async item => {
                        cartas.push(item);
                    });
                    
                    const cartasBarajadas = shuffleCards(cartas);
                    const maso = [];
                    for(let i = 0; i < numBarajas; i++) {
                        for (let j = 0; j < cartasBarajadas.length; j++) {
                            const card = { ...cartasBarajadas[j] };
                            card.BARAJA = i + 1;

                            const id_carta = card.ID_CARTA;
                            const baraja = card.BARAJA;
                            const indice = maso.length + 1;
                            const id_carta_juego = `${indice}${gameId}`;
                            const response = await pool.query('INSERT INTO "CARTAS_EN_JUEGO" ("ID_CARTA_JUEGO", "FK_CARTA", "POSICION", "BARAJA", "FK_PARTIDA", "INDICE") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id_carta_juego, id_carta, "MASO", baraja, gameId, indice]);
                            if(response.error){
                                console.log(response.error);
                                res.status(500).json({message: `Error al generar cartas para la partida.`, error: err});
                                return;
                            } else{
                                maso.push(response.rows[0]);
                            }
                        }
                    }
                    const masoBarajado = shuffleCards(maso);
                    res.status(200).json(masoBarajado);
                    return;
                } else {
                    res.status(404).json({message: 'No se pueden generar cartas para este juego.'});
                }
            }
        });
    } catch (err){
        console.log(err);
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
}