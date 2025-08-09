// js/ui/effects.js
import { showElement, hideElement } from './dom.js';
import { CONFIG } from '../config.js';

export let isTyping = false; // <-- CAMBIO: Se añade "export"
let forceSkip = false;

// Función para el efecto de máquina de escribir
export async function typeWriter(textLines) {
    isTyping = true;
    forceSkip = false;
    showElement('skipButton'); // Muestra el botón de saltar

    const output = document.getElementById('terminal-output');

    for (const line of textLines) {
        const p = document.createElement('p');
        output.appendChild(p);

        for (const char of line) {
            if (forceSkip) {
                p.innerHTML = line;
                break;
            }
            p.innerHTML += char;
            output.scrollTop = output.scrollHeight; // Auto-scroll
            await new Promise(resolve => setTimeout(resolve, CONFIG.TYPEWRITER_SPEED_MS));
        }
        if (forceSkip) continue;
    }

    isTyping = false;
    hideElement('skipButton'); // Oculta el botón de saltar al finalizar
}

// Función para activar el salto
export function skipTyping() {
    if (isTyping) {
        forceSkip = true;
    }
}