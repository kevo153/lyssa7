// js/core/engine.js
import { LORE_DATA } from '../data/lore.js';
import { getCurrentNodeKey, setCurrentNodeKey, addFailures, getFailures, setHiverRoom, getHiverRoom, getKeySequenceProgress, advanceKeySequence, resetKeySequence } from './state.js';
import * as DOM from '../ui/dom.js';
import * as FX from '../ui/effects.js';
import { CONFIG } from '../config.js';
import { setupAudioPlayer } from '../ui/audio.js';

// --- VARIABLES DE ESTADO DEL MOTOR ---
let keyPressInProgress = false;
let multiPromptIndex = 0;

// --- FUNCIÓN AUXILIAR PARA EL PUZLE DE IMÁGENES ---
function setupImagePuzzle(node) {
    const { imagePuzzleButtons, imageDisplayImg } = DOM.getElements();
    
    // Limpiar botones e imagen anteriores
    imagePuzzleButtons.innerHTML = '';
    imageDisplayImg.src = '';
    imageDisplayImg.alt = 'Visor de realidad divergente';

    // Crear botones para cada imagen en el nodo
    for (const key in node.images) {
        const button = document.createElement('button');
        button.textContent = `Invocar Eco: ${key}`;
        button.addEventListener('click', () => {
            imageDisplayImg.src = node.images[key];
            imageDisplayImg.alt = `Eco visual de la realidad: ${key}`;
        });
        imagePuzzleButtons.appendChild(button);
    }
}

async function processCurrentNode() {
    const nodeKey = getCurrentNodeKey();
    const node = LORE_DATA[nodeKey];
    if (!node) {
        console.error(`Error: Nodo de lore no encontrado para la clave: ${nodeKey}`);
        return;
    }

    DOM.hideElement('inputArea');
    DOM.hideElement('audioPlayer');
    DOM.hideElement('imagePuzzleContainer'); // Ocultar por defecto

    if (node.type === 'password') {
        DOM.showElement('welcomeScreen');
        DOM.hideElement('gameTerminal');
        DOM.hideElement('uiOverlay');
        DOM.focusInput('password');
        return;
    }

    DOM.hideElement('welcomeScreen');
    DOM.showElement('gameTerminal');
    DOM.showElement('uiOverlay');
    
    if (node.type === 'hiver_control' && getHiverRoom() === null) {
        setHiverRoom(node.initialRoom);
    }

    resetKeySequence();
    DOM.clearOutput();
    await FX.typeWriter(node.text);

    if (node.type === 'hiver_control') {
        const currentRoomKey = getHiverRoom();
        const room = node.map[currentRoomKey];
        DOM.appendOutput(`<p class="room-description">${room.description}</p>`);
    }

    switch (node.type) {
        case 'story':
            setTimeout(() => {
                setCurrentNodeKey(node.nextNode);
                processCurrentNode();
            }, 2000);
            break;
        case 'multi_prompt':
            multiPromptIndex = 0;
            DOM.appendOutput(`<p class="prompt-text">${node.questions[multiPromptIndex].prompt}</p>`);
            DOM.showElement('inputArea');
            DOM.focusInput();
            break;
        case 'audio_clue':
            DOM.showElement('audioPlayer');
            DOM.showElement('inputArea');
            DOM.focusInput();
            break;
        case 'image_puzzle':
            setupImagePuzzle(node);
            DOM.showElement('imagePuzzleContainer');
            DOM.showElement('inputArea');
            DOM.focusInput();
            break;
        case 'prompt':
        case 'hiver_control':
        case 'library_hub':
            DOM.showElement('inputArea');
            DOM.focusInput();
            break;
        case 'end':
        case 'key_sequence':
        case 'arrow_sequence':
        case 'library_entry':
            break;
    }
}

function handlePasswordInput() {
    const nodeKey = getCurrentNodeKey();
    const node = LORE_DATA[nodeKey];
    const inputValue = DOM.getInputValue('password');
    if (!inputValue) return;

    let choice = node.choices[inputValue] || node.choices['DEFAULT'];
    
    if (choice.nextNode === 'ACCESS_GATE') {
        DOM.showErrorMessage(true);
        setTimeout(() => DOM.showErrorMessage(false), 2000);
    } else {
        DOM.showErrorMessage(false);
    }
    
    setCurrentNodeKey(choice.nextNode);
    processCurrentNode();
}

function handlePlayerInput() {
    const nodeKey = getCurrentNodeKey();
    const node = LORE_DATA[nodeKey];
    const inputValue = DOM.getInputValue();
    if (!inputValue) return;

    if (inputValue === 'HELP' && node.hints) {
        DOM.appendOutput(`<p class="response-text">> Solicitud de asistencia recibida. Desplegando pistas...</p>`);
        node.hints.forEach(hint => {
            DOM.appendOutput(`<p class="hint-text">- ${hint}</p>`);
        });
        return;
    }

    switch (node.type) {
        case 'hiver_control':
            const [action, target] = inputValue.split(' ');
            const currentRoomKey = getHiverRoom();
            const room = node.map[currentRoomKey];

            if (action === 'IR' && room.exits[target]) {
                setHiverRoom(room.exits[target]);
                const newRoom = node.map[getHiverRoom()];
                DOM.appendOutput(`<p class="response-text">> ${inputValue}</p>`);
                DOM.appendOutput(`<p class="room-description">${newRoom.description}</p>`);
            } else if (action === 'EXAMINAR') {
                DOM.appendOutput(`<p class="response-text">> ${inputValue}</p>`);
                DOM.appendOutput(`<p class="room-description">${room.description}</p>`);
            } else if (inputValue === node.answer && room.objective) {
                setCurrentNodeKey(node.nextNode);
                setHiverRoom(null);
                processCurrentNode();
            } else {
                DOM.appendOutput(`<p class="response-text">> Comando no reconocido o movimiento inválido.</p>`);
            }
            break;

        case 'multi_prompt':
            const question = node.questions[multiPromptIndex];
            if (inputValue === question.answer) {
                multiPromptIndex++;
                if (multiPromptIndex >= node.questions.length) {
                    setCurrentNodeKey(node.nextNode);
                    processCurrentNode();
                } else {
                    DOM.appendOutput(`<p class="prompt-text">${node.questions[multiPromptIndex].prompt}</p>`);
                }
            } else {
                addFailures(1);
                DOM.updateFailureCounter(getFailures());
                DOM.appendOutput(`<p class="response-text"><em>Entrada incorrecta.</em></p>`);
                if (getFailures() >= CONFIG.MAX_FAILURES) handleGameOver();
            }
            break;
        
        case 'library_hub':
            const choice = node.choices[inputValue];
            if (choice) {
                setCurrentNodeKey(choice.nextNode);
                processCurrentNode();
            } else {
                DOM.appendOutput(`<p class="response-text">> Entrada no válida.</p>`);
            }
            break;

        case 'image_puzzle':
            if (inputValue === node.answer) {
                setCurrentNodeKey(node.nextNode);
                processCurrentNode();
            } else {
                addFailures(1);
                DOM.updateFailureCounter(getFailures());
                DOM.appendOutput(`<p class="response-text"><em>Código de anulación incorrecto. La fisura se intensifica.</em></p>`);
                if (getFailures() >= CONFIG.MAX_FAILURES) handleGameOver();
            }
            break;
        
        case 'prompt':
        case 'audio_clue':
            if (inputValue === node.answer) {
                setCurrentNodeKey(node.nextNode);
                processCurrentNode();
            } else {
                addFailures(1);
                DOM.updateFailureCounter(getFailures());
                DOM.appendOutput(`<p class="response-text"><em>Respuesta incorrecta. La señal se degrada.</em></p>`);
                if (getFailures() >= CONFIG.MAX_FAILURES) handleGameOver();
            }
            break;
    }
}

function handleKeyPress(event) {
    if (FX.isTyping) {
        FX.skipTyping();
        return;
    }

    const nodeKey = getCurrentNodeKey();
    const node = LORE_DATA[nodeKey];

    if (node.type === 'library_entry' && event.key === 'Enter') {
        setCurrentNodeKey(node.nextNode);
        processCurrentNode();
        return;
    }

    if (node.type !== 'key_sequence' && node.type !== 'arrow_sequence') return;

    const progress = getKeySequenceProgress();
    const expectedKey = node.sequence[progress];

    // --- CAMBIO AQUÍ: Comparación insensible a mayúsculas/minúsculas ---
    if (event.key.toLowerCase() === expectedKey.toLowerCase()) {
        advanceKeySequence();
        DOM.appendOutput(`<p class="response-text">> Entrada [${event.key}] reconocida. Siguiente...</p>`);
        
        if (getKeySequenceProgress() >= node.sequence.length) {
            setCurrentNodeKey(node.nextNode);
            processCurrentNode();
        }
    } else {
        addFailures(1);
        DOM.updateFailureCounter(getFailures());
        DOM.appendOutput(`<p class="response-text">> SECUENCIA INCORRECTA. Reiniciando protocolo.</p>`);
        resetKeySequence();
        if (getFailures() >= CONFIG.MAX_FAILURES) handleGameOver();
    }
}

async function handleGameOver() {
    DOM.hideElement('inputArea');
    DOM.hideElement('welcomeScreen');
    DOM.hideElement('audioPlayer');
    DOM.hideElement('imagePuzzleContainer'); // Ocultar en game over
    DOM.showElement('gameTerminal');
    DOM.clearOutput();
    await FX.typeWriter(LORE_DATA['GAME_OVER_SUBVERTIDOR'].text);
}

export function startGame() {
    const { passwordInput, input, skipButton } = DOM.getElements();
    
    passwordInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') handlePasswordInput();
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') handlePlayerInput();
    });

    skipButton.addEventListener('click', () => {
        FX.skipTyping();
    });

    document.addEventListener('keydown', (event) => {
        if (keyPressInProgress) return;
        keyPressInProgress = true;
        handleKeyPress(event);
    });

    document.addEventListener('keyup', () => {
        keyPressInProgress = false;
    });

    setupAudioPlayer();
    processCurrentNode();
}
