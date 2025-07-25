// ===============================================
// ARCHIVO: script.js
// Lógica principal del juego terminal "El Velo"
// ===============================================

// ===============================================
// 1. VARIABLES GLOBALES Y REFERENCIAS DOM
// ===============================================
var terminalOutput;
var terminalInput;
var terminalInputArea;
var terminalContainer;
var audioTeclado;
var audioGlitch;
var audioFondo;
var videoBackground;
var startOverlay;

var failureCountDisplay;
// Elemento para mostrar el contador de fallos (globalFailureCount)
var failureDisplayElement; // Referencia al div completo #failure-display

var currentOutputText = "";
var textSpeed = 10;
var isTyping = false;
var waitForInput = false;
// Bandera para esperar input de texto (comandos, respuestas de enigmas)
var waitForKeyPress = false;
// Bandera para esperar cualquier tecla para continuar (pausas de narrativa legacy)
var continuePromptIsTyped = false;
// Flag para saber si ya se mostró el prompt "Presiona cualquier tecla..."
var blockKeyboardInput = false;
// Se usará si necesitamos pausar la entrada de teclado temporalmente

var subvertidorPower = 0;
const SUBVERTIDOR_MAX_POWER = 3;
// Este valor puede ser ajustado según la dificultad deseada

var globalFailureCount = 0;
const MAX_GLOBAL_FAILURES = 5;
// Máximo de fallos antes del Game Over

// Claves para localStorage
const GAME_FAILED_MAX_ATTEMPTS_KEY = "game_failed_max_attempts";
const PATH_A_COMPLETED_KEY = "pathA_completed";
const PATH_B_COMPLETED_KEY = "pathB_completed";
const PATH_C_COMPLETED_KEY = "pathC_completed";
const INITIAL_ACCESS_DONE_KEY = "initial_access_done";
// Para controlar si ya se vio la intro inicial

// Objeto para almacenar los nodos.
// Inicialmente, solo los nodos de éxito y la biblioteca.
// Los nodos de los paths (A, B, C) se cargarán dinámicamente aquí.
var nodes = {
    // --- NODOS DE ÉXITO PARA CADA PATH ---
    // Estos nodos se quedan aquí porque son estados finales comunes, no específicos de un path.
    "end_pathA_success": {
        id: "end_pathA_success",
        type: "function_call",
        func: async function() { // Make function async
            localStorage.setItem(PATH_A_COMPLETED_KEY, "true");
            await typeWriter("LYSSA: 'El protocolo de Programador ha concluido con éxito. Los algoritmos de D-47 están restaurados. La Biblioteca de Ecos se ha desbloqueado. Preparando acceso...'" ); // Await typeWriter
            await showContinuePrompt(async function() { // Await showContinuePrompt
                currentPath = "library";
                currentNodeIndex = 0;
                await displayCurrentNode(); // Await displayCurrentNode
            });
        }
    },
    "end_pathB_success": {
        id: "end_pathB_success",
        type: "function_call",
        func: async function() { // Make function async
            localStorage.setItem(PATH_B_COMPLETED_KEY, "true");
            await typeWriter("LYSSA: 'El protocolo de Viajero ha concluido con éxito. Los nexos de D-47 están estabilizados. La Biblioteca de Ecos se ha desbloqueado. Preparando acceso...'" ); // Await typeWriter
            await showContinuePrompt(async function() { // Await showContinuePrompt
                currentPath = "library";
                currentNodeIndex = 0;
                await displayCurrentNode(); // Await displayCurrentNode
            });
        }
    },
    "end_pathC_success": {
        id: "end_pathC_success",
        type: "function_call",
        func: async function() { // Make function async
            localStorage.setItem(PATH_C_COMPLETED_KEY, "true");
            await typeWriter("LYSSA: 'El protocolo de Corrupto ha concluido con éxito. Las brechas de D-47 han sido reorientadas. La Biblioteca de Ecos se ha desbloqueado. Preparando acceso...'" ); // Await typeWriter
            await showContinuePrompt(async function() { // Await showContinuePrompt
                currentPath = "library";
                currentNodeIndex = 0;
                await displayCurrentNode(); // Await displayCurrentNode
            });
        }
    },
    // --- NODOS DE LA BIBLIOTECA ---
    // Se asume que LIBRARY_NODES está definido en libraryNodes.js y cargado previamente.
    "library": LIBRARY_NODES
    // Los paths A, B, C se añadirán aquí dinámicamente: nodes.pathA = PATH_A_NODES;
};
var currentPath = ''; // Almacena el ID del path actual ('pathA', 'pathB', 'pathC', 'library', 'initial_access')
var currentNodeIndex = 0;
// Índice del nodo actual dentro del path
var currentNode = null;
// Referencia al objeto del nodo actual que se está mostrando

// Objeto que mapea las claves de entrada a los IDs de los paths
var passwords = {
    "M205": "pathA",    // Clave para el Path del Programador
    "PADEL": "pathB",   // Clave para el Path del Viajero
    "PIFIA": "pathC",   // Clave para el Path del Corrupto
    "BIBLIOTECA": "library" // Clave para la Biblioteca
};
// --- Variables y referencias para Controles de Desarrollador (DEBUG) ---
// **IMPORTANTE:** Para deshabilitar los controles de debug por completo,
// COMENTA O ELIMINA el bloque <div id="dev-controls"> en tu archivo index.html
// La visibilidad de los elementos individuales también se puede controlar con CSS.
const DEV_MODE = true; // Cambia a 'false' para deshabilitar la funcionalidad JS de debug en producción

var devControls;
var devNextNodeButton;
var devShowAnswerButton;
var devCurrentAnswerSpan;


// ===============================================
// 2. FUNCIONES DE UTIDAD Y MULTIMEDIA
// ===============================================

function playAudio(audioElement) {
    if (audioElement) {
        audioElement.play().catch(e => console.error("Error al reproducir audio:", e));
    }
}

function stopAudio(audioElement) {
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
}

/**
 * Simula el efecto de escritura de terminal.
 * Ahora devuelve una Promesa y sigue soportando callbacks.
 * @param {string} text - El texto a escribir.
 * @param {number} speed - Velocidad de escritura en ms por carácter.
 * @param {function} [callback] - Función a ejecutar cuando el texto termina de escribirse (opcional, para compatibilidad).
 * @returns {Promise<void>} Una promesa que se resuelve cuando el texto termina de escribirse.
 */
function typeWriter(text, speedOverride) {
    return new Promise(resolve => {
        isTyping = true;
        currentOutputText = text;
        terminalOutput.innerHTML = ''; // Limpia antes de escribir
        let i = 0;
        const speed = speedOverride !== undefined ? speedOverride : textSpeed; // Usa la velocidad global o la especificada

        function type() {
            if (i < currentOutputText.length) {
                // Solo añadir el caracter si no estamos bloqueando la entrada (e.g. durante un glitch fuerte)
                if (!blockKeyboardInput) {
                    terminalOutput.innerHTML += currentOutputText.charAt(i);
                    terminalOutput.scrollTop = terminalOutput.scrollHeight; // Auto-scroll
                    playAudio(audioTeclado);
                }
                i++;
                setTimeout(type, speed);
            } else {
                isTyping = false;
                stopAudio(audioTeclado);
                // El callback ya no es el principal mecanismo para continuar el flujo,
                // sino la promesa que se resuelve aquí.
                resolve();
            }
        }
        type();
    });
}

/**
 * Agrega una línea al terminal sin efecto de escritura.
 * @param {string} text - Texto a agregar.
 * @param {string} className - Clase CSS opcional para el texto.
 */
function appendText(text, className = '') {
    const p = document.createElement('p');
    p.innerHTML = text;
    // Usamos innerHTML para permitir SPANs para colores/glitches
    if (className) {
        p.className = className;
    }
    terminalOutput.appendChild(p);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function clearTerminal() {
    terminalOutput.innerHTML = '';
}

function applyGlitchEffect() {
    terminalContainer.classList.add('glitch');
    playAudio(audioGlitch);
    blockKeyboardInput = true;
    // Bloquea la entrada durante el glitch visual
}

function removeGlitchEffect() {
    terminalContainer.classList.remove('glitch');
    stopAudio(audioGlitch);
    blockKeyboardInput = false;
    // Desbloquea la entrada
}

function showLoadingBar(duration, callback) {
    clearTerminal();
    appendText("Cargando...");
    let progress = 0;
    const intervalTime = duration / 10; // 10 segmentos de barra
    let bar = "----------";
    const loadingInterval = setInterval(() => {
        if (progress < bar.length) {
            bar = "#".repeat(progress + 1) + "-".repeat(bar.length - (progress + 1));
            clearTerminal();
            appendText("Cargando...\n[" + bar + "]");
            progress++;
        } else {
            clearInterval(loadingInterval);
            if (callback) {
                callback();
            }
        }
    }, intervalTime);
}

/**
 * Actualiza la visualización del contador de fallos y el poder del subvertidor.
 */
function updateFailureDisplay() {
    // Asegurarse de que los elementos existan antes de intentar actualizar
    const globalFailuresCountEl = document.getElementById('global-failures-count');
    const maxFailuresLimitEl = document.getElementById('max-failures-limit');
    const subvertidorPowerEl = document.getElementById('subvertidor-power');

    if (globalFailuresCountEl) {
        globalFailuresCountEl.textContent = globalFailureCount;
    }
    if (maxFailuresLimitEl) {
        maxFailuresLimitEl.textContent = MAX_GLOBAL_FAILURES;
    }
    if (subvertidorPowerEl) {
        subvertidorPowerEl.textContent = subvertidorPower;
    }

    // Cambiar el color o añadir efectos si los fallos son altos (en el contenedor padre)
    if (failureDisplayElement) {
        if (globalFailureCount >= MAX_GLOBAL_FAILURES) {
            failureDisplayElement.style.color = '#ff0000'; // Rojo para Game Over
            failureDisplayElement.style.borderColor = '#ff0000';
            failureDisplayElement.style.textShadow = '0 0 5px rgba(255, 0, 0, 0.8)';
        } else if (globalFailureCount >= MAX_GLOBAL_FAILURES / 2) {
            failureDisplayElement.style.color = '#ffcc00'; // Ámbar si se acerca al límite
            failureDisplayElement.style.borderColor = '#ffcc00';
            failureDisplayElement.style.textShadow = '0 0 3px rgba(255, 204, 0, 0.6)';
        } else {
            failureDisplayElement.style.color = '#00ff00'; // Verde normal
            failureDisplayElement.style.borderColor = '#00ff00';
            failureDisplayElement.style.textShadow = 'none';
        }
    }
}


// Función mejorada para mostrar contenido visual (imágenes o ASCII art)
function displayVisualContentPrompt(content, promptText, callback, isAscii = false) {
    clearTerminal();
    let contentToDisplay;

    if (isAscii) {
        // Si es ASCII Art, simplemente lo mostramos como texto preformateado
        const preElement = document.createElement('pre'); // <pre> mantiene espacios y saltos de línea
        preElement.textContent = content;
        preElement.classList.add('ascii-art-effect'); // Aplica estilos CSS para el ASCII art
        terminalOutput.appendChild(preElement);
    } else {
        // Si es una ruta de imagen, creamos la etiqueta <img>
        const imgElement = document.createElement('img');
        imgElement.src = content;
        imgElement.style.maxWidth = '100%';
        imgElement.style.display = 'block';
        imgElement.style.margin = '10px auto';
        imgElement.classList.add('terminal-image-effect'); // Aplica estilos CSS para la imagen en terminal
        terminalOutput.appendChild(imgElement);
    }
    terminalOutput.scrollTop = terminalOutput.scrollHeight;

    // typeWriter ahora devuelve una promesa
    typeWriter(promptText).then(() => {
        waitForInput = true;
        terminalInput.setAttribute('placeholder', 'Tu respuesta...');
        if (callback) callback();
    });
}

/**
 * Pausa la narrativa, esperando que el usuario presione Enter.
 * Oculta el input normal y muestra un prompt de "Continuar".
 * @returns {Promise<void>} Una promesa que se resuelve cuando el usuario presiona Enter.
 */
async function waitForUserInput() {
    waitForInput = false; // Desactiva la espera de comandos/respuestas
    waitForKeyPress = true; // Activa la espera de cualquier tecla para continuar
    continuePromptIsTyped = true; // Para mantener consistencia, aunque no se use en handleUserInput directamente para esto

    terminalInput.style.display = 'none'; // Oculta el input normal
    terminalInputArea.style.display = 'none'; // Oculta el área de input para evitar confusiones

    await typeWriter('Pulsa ENTER para continuar...', 30); // Escribe el mensaje de pausa
    appendText(''); // Deja un espacio extra

    return new Promise(resolve => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter' && waitForKeyPress) {
                document.removeEventListener('keydown', handleKeyPress);
                waitForKeyPress = false;
                continuePromptIsTyped = false;
                clearTerminal(); // Limpia el terminal después de la pausa
                terminalInput.style.display = ''; // Muestra de nuevo el input
                terminalInputArea.style.display = ''; // Muestra de nuevo el área de input
                terminalInput.focus();
                resolve(); // Resuelve la promesa para continuar el flujo del juego
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    });
}


// ===============================================
// 3. LÓGICA DEL JUEGO
// ===============================================

function initGame() {
    // Obtener referencias a elementos del DOM
    terminalOutput = document.getElementById('terminal-output');
    terminalInput = document.getElementById('terminal-input');
    terminalInputArea = document.getElementById('terminal-input-area');
    terminalContainer = document.getElementById('terminal-container');
    audioTeclado = document.getElementById('audio-teclado');
    audioGlitch = document.getElementById('audio-glitch');
    audioFondo = document.getElementById('audio-fondo');
    videoBackground = document.getElementById('background-video');
    startOverlay = document.getElementById('start-overlay');
    
    // Asigna las referencias de los nuevos elementos para los contadores y botón de reinicio
    failureDisplayElement = document.getElementById('failure-display'); // El div completo
    const resetGameButton = document.getElementById('reset-game-button');
    // Asigna las referencias de los elementos de debug si DEV_MODE está activo
    if (DEV_MODE) {
        devControls = document.getElementById('dev-controls');
        devNextNodeButton = document.getElementById('dev-next-node-button');
        devShowAnswerButton = document.getElementById('dev-show-answer-button');
        devCurrentAnswerSpan = document.getElementById('dev-current-answer');
        setupDevControls(); // Configura los listeners para los botones de debug
        if (devControls) devControls.style.display = 'flex'; // Asegura que estén visibles en debug
    } else {
        if (devControls) devControls.style.display = 'none'; // Asegura que estén ocultos en producción
    }

    // Oculta los elementos del juego hasta que se inicie la experiencia
    document.getElementById('game-container').style.display = 'none';
    terminalInput.style.display = 'none';
    terminalInputArea.style.display = 'none';
    if (failureDisplayElement) failureDisplayElement.style.display = 'none';
    if (resetGameButton) resetGameButton.style.display = 'none';
    // Cargar el contador de fallos global desde localStorage
    globalFailureCount = parseInt(localStorage.getItem('globalFailureCount') || '0', 10);
    updateFailureDisplay();
    // Event Listener para la entrada del teclado (tecla Enter)
    terminalInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Previene el salto de línea por defecto del Enter
            // Solo procesa la entrada si no se está escribiendo y se espera un comando/respuesta (waitForInput)
            // La lógica de 'waitForKeyPress' se maneja exclusivamente en waitForUserInput mediante un document listener.
            if (!isTyping && waitForInput) {
                const input = terminalInput.value.trim();
                terminalInput.value = ''; // Limpia el input
                handleUserInput(input); // Ahora handleUserInput maneja solo la lógica de enigmas/comandos
            }
        }
    });
    // Event Listeners para el overlay de inicio
    if (startOverlay) {
        startOverlay.addEventListener('click', startExperience);
        startOverlay.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { // Permite Enter o Espacio para iniciar
                e.preventDefault();
                startExperience();
            }
        });
        startOverlay.focus(); // Asegura que el overlay tenga el foco para capturar Enter
    }

    // Event Listener para el botón de Reiniciar Velo
    if (resetGameButton) {
        resetGameButton.addEventListener('click', resetGame);
    }
    
    // Reproducir audio de fondo al primer click en el body (requerimiento de navegadores)
    document.body.addEventListener('click', function() {
        if (audioFondo.paused) {
            audioFondo.play().catch(e => console.error("Error al reproducir audio de fondo:", e));
        }
    }, { once: true });
    // 'once: true' asegura que el listener se ejecute solo una vez
}

async function startExperience() {
    // Oculta el overlay de inicio
    if (startOverlay) {
        startOverlay.style.opacity = '0';
        setTimeout(() => {
            startOverlay.style.display = 'none';
            document.getElementById('game-container').style.display = 'flex'; // Muestra el contenedor principal
            terminalInput.style.display = ''; // Muestra el input
            terminalInputArea.style.display = '';
            terminalInput.focus(); // Enfoca el input

            // Muestra los elementos de la interfaz una vez que el juego ha comenzado
            if (failureDisplayElement) failureDisplayElement.style.display = 'block';
            updateFailureDisplay(); // Asegura que los contadores se muestren con valores correctos

        }, 1000);
    }
    playAudio(audioFondo); // Inicia la música de fondo

    // Carga estados del juego desde localStorage
    const pathACompleted = localStorage.getItem(PATH_A_COMPLETED_KEY) === "true";
    const pathBCompleted = localStorage.getItem(PATH_B_COMPLETED_KEY) === "true";
    const pathCCompleted = localStorage.getItem(PATH_C_COMPLETED_KEY) === "true";
    const initialAccessDone = localStorage.getItem(INITIAL_ACCESS_DONE_KEY) === "true";
    const gameFailedMaxAttempts = localStorage.getItem(GAME_FAILED_MAX_ATTEMPTS_KEY) === "true";

    // Si el juego ha fallado el máximo de intentos, muestra la pantalla de fallo
    if (gameFailedMaxAttempts) {
        if (failureDisplayElement) {
            failureDisplayElement.style.display = 'block';
        }
        displayFailedConnectionScreen();
        return;
    }

    // Determina qué mensaje mostrar al inicio
    if ((pathACompleted || pathBCompleted || pathCCompleted) && initialAccessDone) {
        // Si ya se ha completado al menos un path y se ha accedido antes, muestra mensaje de bienvenida a la biblioteca
        if (failureDisplayElement) {
            failureDisplayElement.style.display = 'block';
        }
        await typeWriter("LYSSA: 'Bienvenido de nuevo. Acceso a la Biblioteca de Ecos activado. Ingresa un protocolo de acceso para continuar, o 'BIBLIOTECA' para explorar los archivos.'");
        waitForInput = true;
        terminalInput.setAttribute('placeholder', 'Introduzca clave...');
        currentPath = "initial_access"; // Establece el estado para manejar la entrada de clave
        currentNodeIndex = 0; // Se mantiene en 0 para la primera parte de la introducción o elección de path
    } else {
        // Si es la primera vez o no se ha completado ningún path aún, muestra la introducción completa
        localStorage.setItem(INITIAL_ACCESS_DONE_KEY, "true"); // Marca que ya se vio la intro
        await typeWriter(
            "--- INICIANDO CONEXIÓN CON EL VELO ---\n\n" +
            "Se activa el protocolo de enlace neuronal. Tus sentidos se agudizan, y la realidad conocida se disuelve en un mar de datos pulsantes. La voz sintética de LYSSA, la IA principal de la Instalación D-47, resuena directamente en tu conciencia:\n\n" +
            "'Anomalía detectada. Interferencia persistente en las frecuencias de resonancia de esta 'Instalación D-47'. El Subvertidor de Ciclos se ha manifestado una vez más. Su patrón es de naturaleza parasitaria, buscando infiltrarse en los protocolos existenciales para generar disonancia y consumir realidades.'\n\n" +
            "Sientes una extraña sensación de familiaridad con esta voz y este entorno, como un eco de un pasado que no recuerdas. LYSSA continúa: 'Tu acceso fue activado por una resonancia atípica. Eres una entidad no programada. Necesitamos tu intervención. Debes seleccionar tu 'protocolo de acceso' para iniciar la calibración y el contra-ataque contra el Subvertidor.'\n\n" +
            "LYSSA: 'Para iniciar tu intervención, el Velo requiere una **clave de resonancia**. Esta clave no te será dada, sino que debe ser **percibida**. Es el reflejo de tu propósito aquí, el primer paso para alinearte con las capas de existencia.'\n\n" +
            "LYSSA: '**Ingresa la clave de resonancia** que te conecta con tu verdadero rol en esta crisis.'",
        );
        waitForInput = true;
        terminalInput.setAttribute('placeholder', 'Introduzca clave de resonancia...');
        currentPath = "initial_access"; // Estado para manejar la clave inicial
        currentNodeIndex = 0;
    }
    terminalInput.focus(); // Pone el foco en el input para que el usuario pueda escribir
}

/**
 * Muestra el prompt "Presiona ENTER para continuar..." y espera la pulsación.
 * Ahora usa `waitForUserInput` internamente.
 * @param {function} [callback] - Función a ejecutar después de que el usuario presione ENTER.
 */
async function showContinuePrompt(callback) {
    // waitForKeyPress y continuePromptIsTyped son gestionados por waitForUserInput
    await typeWriter("\n\nPresiona ENTER para continuar...", 30); // Usa la velocidad de escritura adecuada
    await waitForUserInput(); // Espera la tecla ENTER

    if (callback) {
        callback();
    }
}

// `handleContinuePrompt` ya no es llamada directamente por `handleUserInput`
// sino por la lógica de navegación dentro de `displayCurrentNode` o por `devNextNodeButton`.
function handleContinuePrompt() {
    // Si ya se ha mostrado el prompt "Presiona cualquier tecla..."
    if (continuePromptIsTyped) { // Esta bandera ahora se setea y resetea en waitForUserInput
        // La lógica aquí solo se ejecutará si se llega a ella, por ejemplo,
        // por el botón de debug "Siguiente Nodo" o si el juego lo fuerza.
        // El `waitForKeyPress` ya debería haber sido reseteado por `waitForUserInput`.
        // Mantener por si hay otras partes del código que esperan que esto resetee el estado.
        waitForKeyPress = false;
        continuePromptIsTyped = false;

        // Lógica específica para la Biblioteca
        if (currentPath === "library" && currentNode && currentNode.next === "wait_for_key_library") {
            // Vuelve al inicio de la biblioteca si el nodo actual de la biblioteca tiene este flag
            currentPath = "library";
            currentNodeIndex = 0;
            displayCurrentNode();
        } else {
            // Avanza al siguiente nodo en el path actual
            currentNodeIndex++;
            displayCurrentNode();
        }
    }
}


async function displayFailedConnectionScreen() {
    clearTerminal();
    applyGlitchEffect(); // Aplica el glitch visual y de audio
    terminalOutput.classList.add('glitch-red-text');
    await typeWriter(
        "--- ERROR CRÍTICO: CONEXIÓN CON EL VELO INTERRUMPIDA ---\n\n" +
        "La disonancia ha consumido este segmento. Tu mente se disocia del Velo, arrastrada de vuelta a una realidad fragmentada. La conexión se ha roto.\n\n" +
        "Has alcanzado el límite de fallos globales. La Instalación D-47 se desconecta de tu frecuencia.\n\n" +
        "LYSSA: 'Acceso denegado. La realidad se resetea. Tu intervención ha concluido.'\n\n" +
        "----------------------------------------------------------------------------------\n" +
        "// Fallo de conexión. Intentando re-rutear a un nodo de respaldo...\n" +
        "// Protocolo de emergencia activado. Buscando puntos de acceso alternativos...\n" +
        "// Ubicación de respaldo identificada: 'Ciudad Flotante' o 'Ciudad Asteroide'.\n" +
        "// Posible nueva frecuencia de acceso detectada: <span class='glitch-text-hint'>'Ecos de un Protocolo Olvidado'</span>\n" +
        "// Se requiere re-calibración manual para intentar una nueva conexión."
    );
    // Remover efectos de glitch después de un tiempo
    setTimeout(() => {
        terminalOutput.classList.remove('glitch-red-text');
        removeGlitchEffect();
    }, 2000);
    // Muestra el botón de reinicio
    document.getElementById('reset-game-button').style.display = 'block';
    await typeWriter("Para reiniciar el protocolo del Velo, pulsa el botón 'Reiniciar Velo'.", 30);
}

/**
 * Reinicia el juego a su estado inicial.
 */
function resetGame() {
    localStorage.clear(); // Limpia todo el localStorage
    location.reload();    // Recarga la página
}

/* MARKER: Lógica del Juego - Core */

async function displayCurrentNode() {
    clearTerminal(); // Limpia la terminal al mostrar un nuevo nodo
    
    // Oculta el input y el área de input por defecto al cambiar de nodo,
    // se mostrará si el nodo requiere input.
    terminalInput.style.display = 'none';
    terminalInputArea.style.display = 'none';

    let node;
    // Obtener el nodo actual del path correcto
    if (currentPath === "library") {
        node = nodes.library[currentNodeIndex];
    } else if (nodes[currentPath]) { // Verifica si el path (e.g., nodes.pathA) ya ha sido cargado dinámicamente
        node = nodes[currentPath][currentNodeIndex];
    } else {
        // Esto no debería ocurrir si el flujo de carga dinámica es correcto.
        // Si pasa, indica un error grave.
        await typeWriter("ERROR: Path '" + currentPath + "' no cargado o no válido. Reiniciando el Velo...", 50);
        await showContinuePrompt(function() { // Usa await showContinuePrompt
            // Reinicia el juego si hay un error en la carga del path
            localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
            localStorage.setItem('globalFailureCount', '0');
            updateFailureDisplay();
            location.reload();
        });
        return;
    }

    currentNode = node; // Actualiza la variable global currentNode

    // Actualiza la respuesta en los controles de debug
    if (DEV_MODE) {
        updateDevAnswerDisplay(currentNode ? currentNode.answer || 'N/A' : 'N/A');
    }

    // Manejo para el final de un path que no conduce a un estado de victoria o biblioteca
    if (!node) {
        await typeWriter("--- FIN DE LA SECUENCIA DE NODOS ---\n\nEl Velo se cierra. Presiona ENTER para reiniciar y explorar otros caminos.");
        await showContinuePrompt(function() { // Usa await showContinuePrompt
            // Al final de un camino sin siguiente nodo específico, reinicia para permitir explorar otros.
            localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
            localStorage.setItem('globalFailureCount', '0');
            updateFailureDisplay();
            location.reload();
        });
        return;
    }

    // Lógica para nodos de función (como end_pathX_success)
    if (node.type === "function_call") {
        await node.func(); // Asegúrate de que las funciones puedan ser awaitables si lo son
        return;
    }

    // Aplica efecto glitch si el nodo lo requiere
    if (node.glitch) {
        applyGlitchEffect();
        setTimeout(removeGlitchEffect, 2000); // Remueve el glitch después de 2 segundos
    }

    // Maneja los diferentes tipos de nodos
    if (node.type === "text_only") {
        await typeWriter(node.text);
        // Pausa explícita si el nodo tiene 'pauseAfter: true'
        if (node.pauseAfter) {
            await waitForUserInput(); // Espera la acción del usuario
        }
        
        if (node.next === "wait_for_key_library") {
            // Retorna a la pantalla principal de la biblioteca
            await showContinuePrompt(async function() { // Usa await showContinuePrompt
                currentPath = "library";
                currentNodeIndex = 0;
                await displayCurrentNode();
            });
        } else if (node.next === "wait_for_key") {
            // Simplemente espera una tecla para continuar en el mismo path
            await showContinuePrompt(); // Usa await showContinuePrompt
        } else if (node.next === "end_game_reload") {
            // Recarga el juego completamente
            await showContinuePrompt(function() { // Usa await showContinuePrompt
                localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                localStorage.setItem('globalFailureCount', '0');
                updateFailureDisplay();
                location.reload();
            });
        } else if (node.next) {
            // Avanza al siguiente nodo especificado por ID
            var nextNodeFound = false;
            var targetPathNodes = (currentPath === "library") ? nodes.library : nodes[currentPath];
            for (var i = 0; i < targetPathNodes.length; i++) {
                if (targetPathNodes[i].id === node.next) {
                    currentNodeIndex = i;
                    nextNodeFound = true;
                    break;
                }
            }
            if (nextNodeFound) {
                await displayCurrentNode();
            } else {
                // Si el nodo "next" no se encuentra, hay un error en la definición del nodo
                await typeWriter("ERROR: Nodo siguiente '" + node.next + "' no encontrado en el path '" + currentPath + "'. Terminando secuencia.");
                await showContinuePrompt(function() { // Usa await showContinuePrompt
                    localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                    localStorage.setItem('globalFailureCount', '0');
                    updateFailureDisplay();
                    location.reload();
                });
            }
        } else {
            // Si no hay un nodo "next" definido, es el final de una secuencia de texto
            await typeWriter("Secuencia de nodo de texto finalizada sin siguiente instrucción. Fin de este segmento.");
            await showContinuePrompt(function() { // Usa await showContinuePrompt
                localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                localStorage.setItem('globalFailureCount', '0');
                updateFailureDisplay();
                location.reload();
            });
        }
    } else if (node.type === "enigma_input") {
        // Nodo de acertijo de texto
        await typeWriter(node.prompt);
        waitForInput = true;
        terminalInput.setAttribute('placeholder', 'Tu respuesta...');
        terminalInput.style.display = ''; // Muestra el input
        terminalInputArea.style.display = '';
        terminalInput.focus();
    } else if (node.type === "visual_enigma_input") {
        // Nodo para acertijos visuales con imagen o ASCII art
        // Prioriza ascii_art si existe, de lo contrario, usa 'image'
        if (node.ascii_art) {
            displayVisualContentPrompt(node.ascii_art, node.prompt, function() {
                waitForInput = true;
                terminalInput.setAttribute('placeholder', 'Tu respuesta...');
                terminalInput.style.display = ''; // Muestra el input
                terminalInputArea.style.display = '';
                terminalInput.focus();
            }, true); // El 'true' final indica que es ASCII Art
        } else if (node.image) {
            displayVisualContentPrompt(node.image, node.prompt, function() {
                waitForInput = true;
                terminalInput.setAttribute('placeholder', 'Tu respuesta...');
                terminalInput.style.display = ''; // Muestra el input
                terminalInputArea.style.display = '';
                terminalInput.focus();
            }, false); // El 'false' final indica que es una imagen real
        } else {
            // Manejo de error si no hay contenido visual definido
            await typeWriter("ERROR: Nodo visual_enigma_input sin contenido ('ascii_art' ni 'image'). Reporte esto al sistema. Presiona ENTER para continuar.");
            await showContinuePrompt(); // Usa await showContinuePrompt
        }
    } else if (node.type === "synonym_enigma") {
        // Nodo para el acertijo de sinónimos
        await typeWriter(node.prompt);
        setupSynonymEnigma(node);
        waitForInput = true;
        terminalInput.setAttribute('placeholder', 'Tu respuesta...');
        terminalInput.style.display = ''; // Muestra el input
        terminalInputArea.style.display = '';
        terminalInput.focus();
    } else if (node.type === "code_challenge") {
        await typeWriter(node.prompt);
        // Mostrar el área de codificación si es un desafío de código
        document.getElementById('code-editor-area').style.display = 'block';
        document.getElementById('code-input').value = node.initial_code || '';
        document.getElementById('code-input').focus();
        document.getElementById('code-run-button').style.display = 'block';
        document.getElementById('code-output').style.display = 'block';
        waitForInput = false; // Desactiva el input normal del terminal
        // Los botones y el editor manejan la entrada para este tipo de nodo
    }
}


async function handleUserInput(input) {
    if (isTyping) {
        terminalInput.value = '';
        return;
    }
    // La lógica para `waitForKeyPress` (pausas de Enter para continuar) se maneja
    // exclusivamente en la función `waitForUserInput` a través de un `document.addEventListener`.
    // Por lo tanto, este `handleUserInput` no necesita preocuparse por ese estado.
    
    // Si estamos esperando un input para un enigma o comando
    if (!waitForInput) {
        // Esto podría ocurrir si hay un desajuste de estados.
        // Podríamos loggear un error o simplemente no hacer nada.
        console.warn("Input recibido pero no se esperaba una respuesta de enigma/comando.");
        return;
    }

    waitForInput = false; // Detiene la espera de entrada mientras se procesa
    terminalInput.removeAttribute('placeholder');
    appendText("> " + input); // Muestra la entrada del usuario

    // Determinar el nodo actual
    let node;
    if (currentPath === "library") {
        node = nodes.library[currentNodeIndex];
    } else if (nodes[currentPath]) {
        node = nodes[currentPath][currentNodeIndex];
    } else {
        console.error("Path desconocido en handleUserInput:", currentPath);
        return;
    }

    // Lógica para la entrada inicial de clave (M205, PADEL, PIFIA, BIBLIOTECA)
    if (currentPath === "initial_access") {
        const inputKey = input.toUpperCase();
        var matchedPathKey = passwords[inputKey]; // Obtiene el ID del path (ej. "pathA")

        if (matchedPathKey) {
            // Comprobación de paths ya completados (no permite reingresar a un path ya terminado, excepto la biblioteca)
            if (inputKey !== "BIBLIOTECA" && ((inputKey === "M205" && localStorage.getItem(PATH_A_COMPLETED_KEY) === "true") || (inputKey === "PADEL" && localStorage.getItem(PATH_B_COMPLETED_KEY) === "true") || (inputKey === "PIFIA" && localStorage.getItem(PATH_C_COMPLETED_KEY) === "true"))) {
                await typeWriter(
                    "<span class='glitch-red-text'>ERROR CRÍTICO: CONEXIÓN REMOTA '" + inputKey + "' DESHABILADA.</span>\n" +
                    "El Subvertidor de Ciclos ha sellado o estabilizado este nodo. Acceso denegado a caminos ya completados.\n" +
                    "Explora la Biblioteca de Ecos ('BIBLIOTECA') o intenta un protocolo diferente no completado."
                );
                terminalOutput.classList.add('glitch-red-text');
                applyGlitchEffect(); // Glitch visual para el error
                setTimeout(() => {
                    terminalOutput.classList.remove('glitch-red-text');
                    removeGlitchEffect();
                }, 2000);
                setTimeout(function() { // Espera un poco antes de volver a pedir input
                    waitForInput = true;
                    terminalInput.setAttribute('placeholder', 'Introduzca clave...');
                    terminalInput.style.display = ''; // Asegura que el input se muestre
                    terminalInputArea.style.display = '';
                    terminalInput.focus();
                }, 2000);
                return;
            }
            // Si intenta acceder a la biblioteca pero ningún path ha sido completado
            if (inputKey === "BIBLIOTECA" && !(localStorage.getItem(PATH_A_COMPLETED_KEY) === "true" || localStorage.getItem(PATH_B_COMPLETED_KEY) === "true" || localStorage.getItem(PATH_C_COMPLETED_KEY) === "true")) {
                await typeWriter("LYSSA: 'La Biblioteca de Ecos está sellada. Se requiere la finalización de al menos un protocolo principal para desbloquear el acceso a sus archivos profundos.'");
                waitForInput = true;
                terminalInput.setAttribute('placeholder', 'Introduzca clave...');
                terminalInput.style.display = ''; // Asegura que el input se muestre
                terminalInputArea.style.display = '';
                terminalInput.focus();
                return;
            }
            // Si el juego ya falló el máximo de intentos (Game Over)
            if (localStorage.getItem(GAME_FAILED_MAX_ATTEMPTS_KEY) === "true") {
                displayFailedConnectionScreen();
                return;
            }
            // --- LÓGICA DE CARGA DINÁMICA DE SCRIPTS DE PATH ---
            // Si el path no es la biblioteca Y sus nodos aún no se han cargado en el objeto 'nodes'
            if (matchedPathKey !== "library" && !nodes[matchedPathKey]) {
                const pathScriptUrl = `paths/${matchedPathKey}.js`; // Construye la URL del script
                const scriptElement = document.createElement('script');
                scriptElement.src = pathScriptUrl;
                scriptElement.onload = async () => { // Este callback se ejecuta una vez que el script (e.g., pathA.js) ha terminado de cargar.
                    // En ese momento, la variable global (e.g., PATH_A_NODES) definida en ese script estará disponible.
                    if (matchedPathKey === "pathA") nodes.pathA = PATH_A_NODES;
                    else if (matchedPathKey === "pathB") nodes.pathB = PATH_B_NODES;
                    else if (matchedPathKey === "pathC") nodes.pathC = PATH_C_NODES;
                    if (failureDisplayElement) {
                        failureDisplayElement.style.display = 'block'; // Muestra el contador de fallos
                    }
                    currentPath = matchedPathKey; // Establece el path actual
                    await typeWriter(
                        "Clave de autenticación aceptada.\n" +
                        "Conectando a la red del Velo: " + currentPath.toUpperCase() + "..."
                    );
                    showLoadingBar(3000, async function() { // showLoadingBar ahora llama a una función asíncrona
                        await proceedAfterAuthentication(); // Inicia el juego en el path cargado
                    });
                };
                scriptElement.onerror = async () => { // Manejo de errores si el script no se carga
                    await typeWriter("ERROR CRÍTICO: No se pudo cargar el protocolo de " + matchedPathKey.toUpperCase() + ". La realidad se desgarra. Presiona ENTER para reiniciar.");
                    await showContinuePrompt(() => location.reload());
                };
                document.body.appendChild(scriptElement); // Añade el script al DOM para que el navegador lo cargue
            } else {
                // Si es la biblioteca o el path ya estaba cargado, procede directamente
                if (failureDisplayElement) {
                    failureDisplayElement.style.display = 'block';
                }
                currentPath = matchedPathKey;
                await typeWriter(
                    "Clave de autenticación aceptada.\n" +
                    "Conectando a la red del Velo: " + currentPath.toUpperCase() + "..."
                );
                showLoadingBar(3000, async function() { // showLoadingBar ahora llama a una función asíncrona
                    if (currentPath === "library") {
                        // Si es la biblioteca, comienza desde el primer nodo de la biblioteca
                        currentNodeIndex = 0;
                        await displayCurrentNode();
                    } else {
                        await proceedAfterAuthentication(); // Inicia el juego en el path existente
                    }
                });
            }
        } else {
            // Clave inicial incorrecta
            await typeWriter(
                "Clave de autenticación denegada.\n" +
                "Acceso no autorizado. Intentos restantes: Ilimitados. El Velo no juzga la persistencia, solo la comprensión."
            );
            waitForInput = true; // Vuelve a pedir input
            terminalInput.setAttribute('placeholder', 'Introduzca clave...');
            terminalInput.style.display = ''; // Asegura que el input se muestre
            terminalInputArea.style.display = '';
            terminalInput.focus();
        }
    } else if (node.type === "enigma_input" || node.type === "visual_enigma_input") {
        const expectedAnswer = node.answer.toUpperCase();
        if (input.toUpperCase() === expectedAnswer) {
            await typeWriter(node.correct_feedback);
            // Pasar al siguiente nodo en caso de respuesta correcta
            var nextNodeFound = false;
            var targetPathNodes = (currentPath === "library") ? nodes.library : nodes[currentPath];
            for (var i = 0; i < targetPathNodes.length; i++) {
                if (targetPathNodes[i].id === node.next_on_correct) {
                    currentNodeIndex = i;
                    nextNodeFound = true;
                    break;
                }
            }
            if (nextNodeFound) {
                await displayCurrentNode();
            } else {
                await typeWriter("ERROR: Nodo siguiente '" + node.next_on_correct + "' no encontrado para respuesta correcta. Terminando secuencia.");
                await showContinuePrompt(() => location.reload());
            }
        } else {
            // Respuesta incorrecta
            globalFailureCount++;
            updateFailureDisplay(); // Actualiza la pantalla de fallos
            if (globalFailureCount >= MAX_GLOBAL_FAILURES) {
                localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "true");
                displayFailedConnectionScreen();
            } else {
                await typeWriter(node.incorrect_feedback);
                if (node.retry_on_incorrect) {
                    // Si se permite reintentar, volvemos a mostrar el nodo actual
                    waitForInput = true; // Volver a activar la espera de input para este enigma
                    terminalInput.setAttribute('placeholder', 'Intenta de nuevo...');
                    terminalInput.style.display = '';
                    terminalInputArea.style.display = '';
                    terminalInput.focus();
                } else if (node.next_on_incorrect) {
                    // Si hay un nodo de siguiente en caso de fallo, ir a él
                    var nextNodeFound = false;
                    var targetPathNodes = (currentPath === "library") ? nodes.library : nodes[currentPath];
                    for (var i = 0; i < targetPathNodes.length; i++) {
                        if (targetPathNodes[i].id === node.next_on_incorrect) {
                            currentNodeIndex = i;
                            nextNodeFound = true;
                            break;
                        }
                    }
                    if (nextNodeFound) {
                        await displayCurrentNode();
                    } else {
                        await typeWriter("ERROR: Nodo siguiente '" + node.next_on_incorrect + "' no encontrado para respuesta incorrecta. Terminando secuencia.");
                        await showContinuePrompt(() => location.reload());
                    }
                } else {
                    // Si no hay reintento ni nodo específico de fallo, simplemente espera la siguiente entrada
                    waitForInput = true;
                    terminalInput.setAttribute('placeholder', 'Intenta de nuevo...');
                    terminalInput.style.display = '';
                    terminalInputArea.style.display = '';
                    terminalInput.focus();
                }
            }
        }
    } else if (node.type === "synonym_enigma") {
        // Lógica de manejo para el acertijo de sinónimos
        const currentSynonymChallenge = synonymEnigmaState.words_to_solve[synonymEnigmaState.currentIndex];
        if (!currentSynonymChallenge) {
             console.error("No hay palabra actual en el acertijo de sinónimos.");
             await typeWriter("ERROR INTERNO: No hay palabra en el acertijo de sinónimos. Presiona ENTER para continuar.");
             await showContinuePrompt();
             return;
        }

        if (input.toUpperCase() === currentSynonymChallenge.answer.toUpperCase()) {
            synonymEnigmaState.correctCount++;
            await typeWriter(`Correcto: '${currentSynonymChallenge.word}' -> '${currentSynonymChallenge.answer}'`);
        } else {
            await typeWriter(`Incorrecto: '${currentSynonymChallenge.word}'. La respuesta era '${currentSynonymChallenge.answer}'`);
        }
        synonymEnigmaState.currentIndex++;

        if (synonymEnigmaState.currentIndex < synonymEnigmaState.words_to_solve.length) {
            // Si quedan palabras, muestra la siguiente
            await typeWriter(`\nLYSSA: 'Siguiente: ¿Sinónimo de **${synonymEnigmaState.words_to_solve[synonymEnigmaState.currentIndex].word}**?'`);
            waitForInput = true; // Vuelve a activar el input para la siguiente palabra
            terminalInput.setAttribute('placeholder', 'Ingresa el sinónimo...');
            terminalInput.style.display = '';
            terminalInputArea.style.display = '';
            terminalInput.focus();
        } else {
            // Todas las palabras se han intentado
            if (synonymEnigmaState.correctCount >= node.win_threshold) {
                await typeWriter(`LYSSA: 'Protocolo de Purga Semántica completado con éxito. Acertaste ${synonymEnigmaState.correctCount} de ${node.words_to_solve.length}.'`);
                var nextNodeFound = false;
                var targetPathNodes = (currentPath === "library") ? nodes.library : nodes[currentPath];
                for (var i = 0; i < targetPathNodes.length; i++) {
                    if (targetPathNodes[i].id === node.next_on_correct) {
                        currentNodeIndex = i;
                        nextNodeFound = true;
                        break;
                    }
                }
                if (nextNodeFound) {
                    await displayCurrentNode();
                } else {
                    await typeWriter("ERROR: Nodo siguiente '" + node.next_on_correct + "' no encontrado para purga semántica exitosa. Terminando secuencia.");
                    await showContinuePrompt(() => location.reload());
                }
            } else {
                globalFailureCount++; // Incrementa el contador de fallos globales
                updateFailureDisplay(); // Actualiza la pantalla de fallos
                if (globalFailureCount >= MAX_GLOBAL_FAILURES) {
                    localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "true");
                    displayFailedConnectionScreen(); // Fin del juego si excede los fallos globales
                } else {
                    await typeWriter(`LYSSA: 'Purga semántica fallida. No alcanzaste el umbral (${synonymEnigmaState.correctCount}/${node.words_to_solve.length} correctas). Reintentando el protocolo desde el inicio.'`);
                    var nextNodeFound = false;
                    var targetPathNodes = (currentPath === "library") ? nodes.library : nodes[currentPath];
                    for (var i = 0; i < targetPathNodes.length; i++) {
                        if (targetPathNodes[i].id === node.retry_node_id) {
                            currentNodeIndex = i;
                            nextNodeFound = true;
                            break;
                        }
                    }
                    if (nextNodeFound) {
                        await displayCurrentNode();
                    } else {
                        await typeWriter("ERROR: Nodo de reintento '" + node.retry_node_id + "' no encontrado para purga semántica fallida. Terminando secuencia.");
                        await showContinuePrompt(() => location.reload());
                    }
                }
            }
        }
    }
}

// Función auxiliar para continuar después de la autenticación inicial
async function proceedAfterAuthentication() {
    if (currentPath && nodes[currentPath]) {
        // Encontrar el nodo inicial para el path actual
        let initialNodeId;
        if (currentPath === "pathA") {
            initialNodeId = "text_A1";
        } else if (currentPath === "pathB") {
            initialNodeId = "text_B1";
        } else if (currentPath === "pathC") {
            initialNodeId = "text_C1";
        } else {
            console.error("Path desconocido después de autenticación:", currentPath);
            return;
        }

        let initialNodeIndex = -1;
        for (let i = 0; i < nodes[currentPath].length; i++) {
            if (nodes[currentPath][i].id === initialNodeId) {
                initialNodeIndex = i;
                break;
            }
        }

        if (initialNodeIndex !== -1) {
            currentNodeIndex = initialNodeIndex;
            await displayCurrentNode();
        } else {
            console.error("Nodo inicial para el path '" + currentPath + "' no encontrado.");
            await typeWriter("ERROR: No se pudo encontrar el punto de inicio del protocolo. Reiniciando Velo...");
            await showContinuePrompt(() => location.reload());
        }
    } else {
        await typeWriter("ERROR: Protocolo no cargado o no válido. Reiniciando Velo...");
        await showContinuePrompt(() => location.reload());
    }
}

// Variables para el enigma de sinónimos (se inicializan al configurar el enigma)
var synonymEnigmaState = {
    words_to_solve: [],
    currentIndex: 0,
    correctCount: 0
};

/**
 * Configura el enigma de sinónimos.
 * @param {object} node - El objeto del nodo del enigma de sinónimos.
 */
async function setupSynonymEnigma(node) {
    // Asegurarse de que words_to_solve es un array antes de copiar
    if (Array.isArray(node.words_to_solve)) {
        synonymEnigmaState.words_to_solve = [...node.words_to_solve]; // Copia el array para no modificar el original
    } else {
        console.error("El nodo de sinónimos no tiene un array válido para 'words_to_solve'.", node);
        synonymEnigmaState.words_to_solve = []; // Inicializa como array vacío para evitar errores
    }
    synonymEnigmaState.currentIndex = 0;
    synonymEnigmaState.correctCount = 0;

    if (synonymEnigmaState.words_to_solve.length > 0) {
        await typeWriter(`LYSSA: 'Primera palabra: ¿Sinónimo de **${synonymEnigmaState.words_to_solve[0].word}**?'`);
        terminalInput.setAttribute('placeholder', 'Ingresa el sinónimo...');
    } else {
        console.error("El acertijo de sinónimos no tiene palabras para resolver.");
        // Si no hay palabras, considera avanzar al siguiente nodo o a un nodo de error/reintento
        // Por ahora, simplemente notifica y espera una tecla para continuar
        await typeWriter("ERROR: El acertijo de sinónimos no está configurado correctamente. Presiona ENTER para continuar.");
        await showContinuePrompt();
    }
}


// --- Lógica para Code Challenge (si existe en tu juego) ---
// Estas funciones manejarían la interacción con el editor de código.
// Asumo que tienes elementos HTML con id's: code-editor-area, code-input, code-run-button, code-output.
document.addEventListener('DOMContentLoaded', () => {
    const codeRunButton = document.getElementById('code-run-button');
    if (codeRunButton) {
        codeRunButton.addEventListener('click', runCodeChallenge);
    }
});

async function runCodeChallenge() {
    const codeInput = document.getElementById('code-input').value;
    const codeOutput = document.getElementById('code-output');
    codeOutput.innerHTML = 'Ejecutando código...';

    // Aquí iría la lógica para "ejecutar" el código.
    // Esto es muy simplificado; en un juego real, necesitarías un motor JS seguro
    // o una validación muy robusta para evitar inyecciones de código.
    // Para una simulación, puedes simplemente comparar con una respuesta esperada.

    const currentNodeForCode = (currentPath === "library") ? nodes.library[currentNodeIndex] : nodes[currentPath][currentNodeIndex];
    if (currentNodeForCode && currentNodeForCode.type === "code_challenge") {
        try {
            // Ejemplo básico de validación: ¿El código contiene la respuesta esperada?
            // ADVERTENCIA: eval() es peligroso. Esto es solo para propósitos ilustrativos en un juego.
            // Para juegos reales, NUNCA uses eval() con input de usuario directamente.
            let result = '';
            let codeValid = false;
            let successMessage = currentNodeForCode.success_message || "Código ejecutado con éxito.";
            let failureMessage = currentNodeForCode.failure_message || "Error al ejecutar el código. Intenta de nuevo.";

            // Si hay una respuesta esperada simple
            if (currentNodeForCode.expected_output && codeInput.includes(currentNodeForCode.expected_output)) {
                result = "LYSSA: '" + successMessage + "'";
                codeValid = true;
            } else if (currentNodeForCode.validation_func && typeof currentNodeForCode.validation_func === 'function') {
                // Si hay una función de validación compleja
                if (currentNodeForCode.validation_func(codeInput)) {
                    result = "LYSSA: '" + successMessage + "'";
                    codeValid = true;
                } else {
                    result = "LYSSA: '" + failureMessage + "'";
                }
            } else {
                result = "LYSSA: 'La ejecución ha finalizado, pero no se cumplen las condiciones de validación.'" +
                         "\n" + failureMessage;
            }

            codeOutput.innerHTML = result;

            if (codeValid) {
                await typeWriter(result);
                document.getElementById('code-editor-area').style.display = 'none'; // Oculta editor
                document.getElementById('code-run-button').style.display = 'none';
                document.getElementById('code-output').style.display = 'none';

                var nextNodeFound = false;
                var targetPathNodes = (currentPath === "library") ? nodes.library : nodes[currentPath];
                for (var i = 0; i < targetPathNodes.length; i++) {
                    if (targetPathNodes[i].id === currentNodeForCode.next_on_correct) {
                        currentNodeIndex = i;
                        nextNodeFound = true;
                        break;
                    }
                }
                if (nextNodeFound) {
                    await displayCurrentNode();
                } else {
                    await typeWriter("ERROR: Nodo siguiente '" + currentNodeForCode.next_on_correct + "' no encontrado después del desafío de código. Terminando secuencia.");
                    await showContinuePrompt(() => location.reload());
                }
            } else {
                // Si el código no es válido, permite reintentar o avanza a un nodo de fallo
                await typeWriter(result);
                globalFailureCount++; // Incrementa el contador de fallos globales
                updateFailureDisplay(); // Actualiza la pantalla de fallos
                if (globalFailureCount >= MAX_GLOBAL_FAILURES) {
                    localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "true");
                    displayFailedConnectionScreen();
                } else if (currentNodeForCode.next_on_incorrect) {
                     var nextNodeFound = false;
                    var targetPathNodes = (currentPath === "library") ? nodes.library : nodes[currentPath];
                    for (var i = 0; i < targetPathNodes.length; i++) {
                        if (targetPathNodes[i].id === currentNodeForCode.next_on_incorrect) {
                            currentNodeIndex = i;
                            nextNodeFound = true;
                            break;
                        }
                    }
                    if (nextNodeFound) {
                        await displayCurrentNode();
                    } else {
                        await typeWriter("ERROR: Nodo siguiente '" + currentNodeForCode.next_on_incorrect + "' no encontrado después del fallo de código. Terminando secuencia.");
                        await showContinuePrompt(() => location.reload());
                    }
                } else {
                    // Si no hay un nodo de fallo específico, simplemente deja el editor abierto
                    codeOutput.innerHTML += "\n" + (currentNodeForCode.retry_message || "Intenta de nuevo.");
                }
            }
        } catch (e) {
            codeOutput.innerHTML = `Error de ejecución: ${e.message}`;
            await typeWriter(`LYSSA: 'Error de compilación o ejecución en tu protocolo. ${e.message}. Intenta de nuevo.'`);
            globalFailureCount++; // Incrementa el contador de fallos globales
            updateFailureDisplay(); // Actualiza la pantalla de fallos
            if (globalFailureCount >= MAX_GLOBAL_FAILURES) {
                localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "true");
                displayFailedConnectionScreen();
            }
            // Mantiene el editor abierto para reintentar
        }
    }
}


// ===============================================
// 4. CONTROLES DE DESARROLLADOR (DEBUG)
// ===============================================

function setupDevControls() {
    if (!DEV_MODE || !devControls) {
        if (devControls) devControls.style.display = 'none';
        return;
    }

    devControls.style.display = 'flex'; // Asegura que el contenedor sea visible

    if (devNextNodeButton) {
        devNextNodeButton.onclick = async () => {
            if (isTyping) {
                // Si está escribiendo, completa el texto inmediatamente
                terminalOutput.innerHTML = currentOutputText;
                isTyping = false;
                stopAudio(audioTeclado);
                // Si hay una pausa de ENTER activa, simular el ENTER
                if (waitForKeyPress) {
                    // Simula el evento de tecla ENTER para que waitForUserInput se resuelva
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                }
                return; // No avanzar el nodo aún, solo completar la escritura/pausa
            }

            // Si hay un desafío de código, ocultarlo
            if (document.getElementById('code-editor-area')) {
                document.getElementById('code-editor-area').style.display = 'none';
                document.getElementById('code-run-button').style.display = 'none';
                document.getElementById('code-output').style.display = 'none';
            }
            
            // Si hay una espera de input normal (enigma), forzar el avance
            if (waitForInput) {
                waitForInput = false; // Desactiva la espera de input
                // Aquí, podrías simular una respuesta correcta o simplemente avanzar.
                // Para debug, simplemente avanzaremos.
                let node = (currentPath === "library") ? nodes.library[currentNodeIndex] : nodes[currentPath][currentNodeIndex];
                if (node && (node.type === "enigma_input" || node.type === "visual_enigma_input" || node.type === "synonym_enigma")) {
                    // Forzar el avance al nodo "correcto" o al siguiente si no hay "correcto"
                    if (node.next_on_correct) {
                        const targetPathNodes = (currentPath === "library") ? nodes.library : nodes[currentPath];
                        for (let i = 0; i < targetPathNodes.length; i++) {
                            if (targetPathNodes[i].id === node.next_on_correct) {
                                currentNodeIndex = i;
                                break;
                            }
                        }
                    } else {
                        currentNodeIndex++; // Si no hay next_on_correct, simplemente el siguiente en secuencia
                    }
                    await displayCurrentNode();
                    return;
                }
            }
            
            // Lógica general de "Siguiente Nodo" para todos los tipos de nodos
            let currentNodes = (currentPath === "library") ? nodes.library : nodes[currentPath];
            if (currentNodes && currentNodeIndex < currentNodes.length - 1) {
                currentNodeIndex++;
                await displayCurrentNode();
            } else if (currentPath === "initial_access") {
                // Si estamos en la selección de path inicial, simular una elección (ej. Path A)
                await typeWriter("DEV: Saltando a Protocolo del Programador (Path A)...", 10);
                showLoadingBar(1000, async function() {
                    currentPath = "pathA";
                    // Asegúrate de que PATH_A_NODES esté cargado y accesible aquí
                    if (typeof PATH_A_NODES !== 'undefined') {
                        nodes.pathA = PATH_A_NODES; // Asigna
                        let initialNodeIndex = -1;
                        for (let i = 0; i < nodes.pathA.length; i++) {
                            if (nodes.pathA[i].id === "text_A1") { // O el ID del primer nodo real de Path A
                                initialNodeIndex = i;
                                break;
                            }
                        }
                        if (initialNodeIndex !== -1) {
                            currentNodeIndex = initialNodeIndex;
                            await displayCurrentNode();
                        } else {
                            await typeWriter("DEV ERROR: Nodo inicial 'text_A1' no encontrado en Path A.");
                        }
                    } else {
                        await typeWriter("DEV ERROR: PATH_A_NODES no cargado. Asegúrate de incluir pathA.js");
                    }
                });
            }
            // Si es el final de un path, manejarlo con lógica específica o reiniciar a selección
            else if (currentNodes && currentNodeIndex === currentNodes.length - 1) {
                await typeWriter("DEV: Fin del Path. Regresando a la selección de Path o Biblioteca.", 10);
                // Si el path terminó, llevar a la selección o biblioteca
                if (localStorage.getItem(PATH_A_COMPLETED_KEY) === "true" || localStorage.getItem(PATH_B_COMPLETED_KEY) === "true" || localStorage.getItem(PATH_C_COMPLETED_KEY) === "true") {
                    currentPath = "library";
                    currentNodeIndex = 0;
                    await displayCurrentNode();
                } else {
                    currentPath = "initial_access"; // Volver al inicio si no hay paths completados
                    currentNodeIndex = 0;
                    await displayCurrentNode();
                }
            }
        };
    }

    if (devShowAnswerButton && devCurrentAnswerSpan) {
        devShowAnswerButton.onclick = () => {
            let currentNodesArray = (currentPath === "library") ? nodes.library : nodes[currentPath];
            if (currentNodesArray && currentNodeIndex < currentNodesArray.length) {
                let node = currentNodesArray[currentNodeIndex];
                if (node.type === "enigma_input" || node.type === "visual_enigma_input") {
                    devCurrentAnswerSpan.textContent = node.answer;
                } else if (node.type === "synonym_enigma") {
                    // Mostrar la respuesta de la palabra actual en el enigma de sinónimos
                    if (synonymEnigmaState.currentIndex < synonymEnigmaState.words_to_solve.length) {
                        devCurrentAnswerSpan.textContent = synonymEnigmaState.words_to_solve[synonymEnigmaState.currentIndex].answer;
                    } else {
                        devCurrentAnswerSpan.textContent = "N/A (Sinónimos completos)";
                    }
                } else if (node.type === "code_challenge") {
                    devCurrentAnswerSpan.textContent = "Verifica 'expected_output' o 'validation_func' en el nodo.";
                }
                 else {
                    devCurrentAnswerSpan.textContent = "N/A (No es enigma)";
                }
            } else {
                devCurrentAnswerSpan.textContent = "N/A";
            }
        };
    }
}

function updateDevAnswerDisplay(answer) {
    if (DEV_MODE && devCurrentAnswerSpan) {
        devCurrentAnswerSpan.textContent = answer;
    }
}

// ===============================================
// 5. INICIALIZACIÓN
// ===============================================

// Asegúrate de que LIBRARY_NODES esté definido en libraryNodes.js y sea cargado
// antes de script.js, o cárgalo aquí dinámicamente si es necesario.

// Iniciar el juego cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initGame);