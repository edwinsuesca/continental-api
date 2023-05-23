import * as cryptoJS from 'crypto-js';
import base64url from "base64url";

const generateId = (length) => {
  const randomBytes = cryptoJS.lib.WordArray.random(16);
  const hash = cryptoJS.SHA256(randomBytes);
  const hashBase64Url = base64url.fromBase64(hash.toString(cryptoJS.enc.Base64));
  const gameId = hashBase64Url.substring(0, length)
  return gameId;
}

const formatUrlText = (text) => {
    // Reemplazar espacios por guiones
    text = text.replace(/\s+/g, '-');
    
    // Reemplazar slash con guión
    text = text.replace(/[\/]/g, '-');

    // Reemplazar varios guiones o caracteres especiales repetidos con un solo guión
    text = text.replace(/([-_]){2,}/g, '-');
    
    // Eliminar diéresis, tildes y virgulillas
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Convertir a minúsculas
    text = text.toLowerCase();
    
    // Eliminar cualquier otro caracter que no sea una letra, número, guión o slash
    text = text.replace(/[^a-z0-9-]/g, '');

    // Eliminar guiones al final y al inicio
    text = text.replace(/^-+/, '').replace(/-+$/, '');
  
    // Si el texto quedó vacío, reemplazar por "sin-titulo"
    if (!text) {
      text = 'sin-titulo';
    }
  
    return text;
}

const validateText = (text) => {
    // Verificar si el texto contiene espacios, diéresis, tildes, virgulillas o caracteres especiales
    if (/[^\w-]/.test(text)) {
      return false;
    }
  
    // Verificar si hay guiones al inicio o al final
    if (/^-|-$/g.test(text)) {
      return false;
    }
  
    // Verificar si hay más de un guión repetido
    if (/([-]){2,}/g.test(text)) {
      return false;
    }
    return true;
}

//Barajar cartas
const shuffleCards = (arreglo) => {
  const arregloDesordenado = arreglo.slice(); // Crear una copia del arreglo original
  for (let i = arregloDesordenado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Generar un índice aleatorio
    [arregloDesordenado[i], arregloDesordenado[j]] = [arregloDesordenado[j], arregloDesordenado[i]]; // Intercambiar elementos
  }
  return arregloDesordenado;
}

module.exports = {formatUrlText, validateText, generateId, shuffleCards};