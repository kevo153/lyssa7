// js/core/state.js
import { CONFIG } from '../config.js';

const gameState = {
    currentNodeKey: 'ACCESS_GATE',
    failures: 0,
    hiverCurrentRoom: null,
    keySequenceProgress: 0, // <-- NUEVA LÍNEA: Para el progreso del acertijo de teclas
};

export function getCurrentNodeKey() { return gameState.currentNodeKey; }
export function setCurrentNodeKey(key) { gameState.currentNodeKey = key; }
export function getFailures() { return gameState.failures; }
export function addFailures(amount) {
    gameState.failures += amount;
    if (gameState.failures > CONFIG.MAX_FAILURES) {
        gameState.failures = CONFIG.MAX_FAILURES;
    }
}
// Funciones para el Hiver
export function getHiverRoom() { return gameState.hiverCurrentRoom; }
export function setHiverRoom(roomKey) { gameState.hiverCurrentRoom = roomKey; }

// Nuevas funciones para la secuencia de teclas
export function getKeySequenceProgress() { return gameState.keySequenceProgress; }
export function advanceKeySequence() { gameState.keySequenceProgress++; }
export function resetKeySequence() { gameState.keySequenceProgress = 0; }
