// js/ui/dom.js
import { CONFIG } from '../config.js';

const elements = {
    // Pantalla de bienvenida
    welcomeScreen: document.getElementById('welcome-screen'),
    passwordInput: document.getElementById('password-input'),
    errorMessage: document.getElementById('error-message'),
    // Terminal
    gameTerminal: document.getElementById('game-terminal'),
    output: document.getElementById('terminal-output'),
    inputArea: document.getElementById('terminal-input-area'),
    input: document.getElementById('terminal-input'),
    // UI Overlay
    uiOverlay: document.getElementById('ui-overlay'),
    failurePercentage: document.getElementById('failure-percentage'),
    failureBar: document.getElementById('failure-bar'),
    skipButton: document.getElementById('skip-button'),
    // Audio Player
    audioPlayer: document.getElementById('audio-player'),
    spectrogram: document.getElementById('audio-spectrogram'),
    playPauseButton: document.getElementById('play-pause-button'),
    clueAudioElement: document.getElementById('clue-audio-element'),
};

export function clearOutput() { elements.output.innerHTML = ''; }
export function appendOutput(html) { elements.output.innerHTML += html; }
export function showElement(key) { elements[key]?.classList.remove('hidden'); }
export function hideElement(key) { elements[key]?.classList.add('hidden'); }
export function focusInput(type = 'main') {
    if (type === 'password') elements.passwordInput.focus();
    else elements.input.focus();
}

export function getInputValue(type = 'main') {
    const inputElement = (type === 'password') ? elements.passwordInput : elements.input;
    const value = inputElement.value;
    inputElement.value = '';
    return value.trim().toUpperCase();
}

export function updateFailureCounter(currentFailures) {
    const percentage = Math.floor((currentFailures / CONFIG.MAX_FAILURES) * 100);
    elements.failurePercentage.textContent = `${percentage}%`;
    elements.failureBar.style.width = `${percentage}%`;
}

export function showErrorMessage(show) {
    elements.errorMessage.classList.toggle('hidden', !show);
}

export function getElements() { return elements; }
