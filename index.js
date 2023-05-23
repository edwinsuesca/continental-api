require('dotenv').config();
import https from 'https';
import fs from 'fs';
import app from './src/app';
import appSocket from './src/socket';
const port = process.env.PORT || 3200; 




appSocket.listen(5200, function () {
    console.log("Socket listo y escuchando por el puerto 5200")
})

//INICIAR SERVIDOR EN ENTORNO DE DESARROLLO
app.listen(port, () => {
    console.log(`Servidor web en ejecución en http://localhost:${port}`);
});

//INICIAR SERVIDOR EN ENTORNO DE PRODUCCIÓN

// Configura opciones de SSL/TLS
/* const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/edwinsuesca.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/edwinsuesca.net/cert.pem')
};

// Crea un servidor HTTPS utilizando Express
https.createServer(options, app).listen(port, () => {
  console.log(`Servidor HTTPS escuchando en puerto ${port}`);
}); */