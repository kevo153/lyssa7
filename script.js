/* MARKER: Variables Globales */
var terminalOutput;
var terminalInput;
var terminalInputArea;
var audioTeclado;
var audioGlitch;
var audioFondo;

var currentOutputText = ""; // Almacena el texto actual que se muestra en la terminal
var textSpeed = 50; // Velocidad de escritura (milisegundos por carácter)
var isTyping = false; // Bandera para controlar si se está escribiendo texto
var waitForInput = false; // Bandera para controlar si se espera la entrada del usuario
var waitForKeyPress = false; // Bandera para controlar si se espera que el usuario presione una tecla

/* MARKER: Audio Control */
function playAudio(audioElement, loop) {
    if (audioElement) {
        audioElement.loop = loop || false;
        audioElement.play().catch(function(error) {
            console.warn("No se pudo reproducir el audio:", error);
            // Esto puede ocurrir si el navegador bloquea la reproducción automática
            // Se puede añadir un mensaje para el usuario para que interactúe y desbloquee el audio.
        });
    }
}

function stopAudio(audioElement) {
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0; // Reiniciar al principio
    }
}

/* MARKER: Funciones de Utilidad de la Terminal */

// Función para escribir texto letra por letra
function typeWriter(text, callback) {
    isTyping = true;
    terminalInputArea.style.display = 'none'; // Ocultar input mientras se escribe
    var i = 0;
    currentOutputText += "\n"; // Añadir salto de línea antes de nuevo texto

    function typeChar() {
        if (i < text.length) {
            currentOutputText += text.charAt(i);
            terminalOutput.innerText = currentOutputText;
            terminalOutput.scrollTop = terminalOutput.scrollHeight; // Desplazar al final
            i++;
            // Opcional: Reproducir sonido de teclado para cada carácter (manejar volumen con CSS/JS)
            // if (audioTeclado) audioTeclado.play(); 
            setTimeout(typeChar, textSpeed);
        } else {
            isTyping = false;
            terminalInputArea.style.display = 'flex'; // Mostrar input de nuevo
            terminalInput.focus(); // Enfocar el input
            if (callback) {
                callback();
            }
        }
    }
    typeChar();
}

// Función para añadir texto directamente (sin efecto de escritura)
function appendText(text) {
    currentOutputText += "\n" + text;
    terminalOutput.innerText = currentOutputText;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    terminalInput.focus();
}

// Función para limpiar la pantalla de la terminal
function clearTerminal() {
    currentOutputText = "";
    terminalOutput.innerText = "";
}

/* MARKER: Funciones de Efectos Visuales */

function applyGlitchEffect() {
    terminalContainer.classList.add('glitch');
    if (audioGlitch) {
        audioGlitch.currentTime = 0; // Reinicia el audio cada vez
        playAudio(audioGlitch);
    }
}

function removeGlitchEffect() {
    terminalContainer.classList.remove('glitch');
    stopAudio(audioGlitch);
}

function showLoadingBar(durationMs, callback) {
    var loadingBarContainer = document.createElement('div');
    loadingBarContainer.className = 'loading-bar-container';
    loadingBarContainer.id = 'dynamic-loading-bar-container';

    var loadingBarFill = document.createElement('div');
    loadingBarFill.className = 'loading-bar-fill';
    loadingBarFill.id = 'dynamic-loading-bar-fill';

    var loadingPercentage = document.createElement('div');
    loadingPercentage.className = 'loading-percentage';
    loadingPercentage.id = 'dynamic-loading-percentage';
    loadingPercentage.innerText = '0%';

    loadingBarContainer.appendChild(loadingBarFill);
    terminalOutput.appendChild(loadingBarContainer);
    terminalOutput.appendChild(loadingPercentage);

    loadingBarContainer.style.display = 'block';
    loadingPercentage.style.display = 'block';

    var startTime = Date.now();
    var interval = setInterval(function() {
        var elapsed = Date.now() - startTime;
        var progress = Math.min(elapsed / durationMs, 1);
        var percentage = Math.floor(progress * 100);

        loadingBarFill.style.width = percentage + '%';
        loadingPercentage.innerText = percentage + '%';

        if (progress === 1) {
            clearInterval(interval);
            setTimeout(function() {
                terminalOutput.removeChild(loadingBarContainer);
                terminalOutput.removeChild(loadingPercentage);
                if (callback) {
                    callback();
                }
            }, 500); // Pequeña pausa después de completar la carga
        }
    }, 50); // Actualiza cada 50ms
}


/* MARKER: Lógica del Juego - Inicio */

// Función principal de inicialización
function initGame() {
    // Referencias a elementos DOM
    terminalOutput = document.getElementById('terminal-output');
    terminalInput = document.getElementById('terminal-input');
    terminalInputArea = document.getElementById('terminal-input-area');
    terminalContainer = document.getElementById('terminal-container'); // Asegurar que está referenciada

    // Referencias a elementos de audio
    audioTeclado = document.getElementById('audio-teclado');
    audioGlitch = document.getElementById('audio-glitch');
    audioFondo = document.getElementById('audio-fondo');

    // Iniciar el sonido de fondo (puede requerir interacción del usuario en algunos navegadores)
    playAudio(audioFondo, true);

    // Event Listener para la entrada del usuario (tecla Enter)
    terminalInput.addEventListener('keydown', function(event) {
        if (event.keyCode === 13) { // Tecla Enter
            event.preventDefault(); // Evitar salto de línea en el input
            handleUserInput(terminalInput.value.trim());
            terminalInput.value = ''; // Limpiar el input
        }
    });

    // Event Listener para "Presionar cualquier tecla para continuar"
    document.addEventListener('keydown', function(event) {
        if (waitForKeyPress && !isTyping) {
            waitForKeyPress = false;
            event.preventDefault(); // Prevenir cualquier acción por defecto de la tecla
            handleContinuePrompt();
        }
    });

    // Iniciar la pantalla inicial del one-shot
    startInitialScreen();
}

// Función para manejar el prompt de "presionar cualquier tecla para continuar"
function showContinuePrompt(callback) {
    waitForKeyPress = true;
    typeWriter("Presiona cualquier tecla para continuar...", function() {
        // La bandera 'waitForKeyPress' ya está activa, no necesitamos más acción aquí
        // La función 'handleContinuePrompt' se encargará de esto.
        if (callback) {
            // Guardar el callback para ejecutarlo cuando se presione la tecla
            sessionStorage.setItem('continuePromptCallback', callback.name); 
            // O mejor, manejar el flujo directamente dentro de handleContinuePrompt
            // dado que el estado del juego será complejo.
            // Por ahora, solo indicamos que se espera la tecla.
        }
    });
}

function handleContinuePrompt() {
    // Aquí es donde la lógica avanza después de "presionar tecla"
    // Dependiendo del estado del juego, esta función llamará a la siguiente fase.
    // Por ahora, solo muestra que se ha continuado.
    appendText("[CONTINUADO]");
    // Aquí deberá ir la lógica para pasar a la siguiente parte del juego
    // Por ejemplo, si estábamos en la autenticación, pasamos a la carga del nodo.
    // Necesitaremos una variable de estado global para saber dónde estábamos.
    proceedAfterAuthentication(); // Llamada de ejemplo para la siguiente etapa
}


/* MARKER: Lógica Específica del One-Shot */

var currentPath = ''; // Almacenará el camino de nodos (ej. 'pathA', 'pathB', 'pathC')
var currentNodeIndex = 0; // Índice del nodo actual dentro del path

// Contraseñas y sus rutas asociadas
var passwords = {
    "AURORA": "pathA",    // Para el Programador
    "VAGABUNDO": "pathB", // Para el Viajero
    "VACIO": "pathC"      // Para el Corrupto
};

function startInitialScreen() {
    clearTerminal();
    typeWriter(
        "// PROTOCOLO DE CONEXIÓN INICIADO\n" +
        "// ESTADO: TERMINAL DESCONOCIDA. ANOMALÍA DETECTADA.\n" +
        "// INGRESE CLAVE DE AUTENTICACIÓN PARA ACCESO PRINCIPAL:",
        function() {
            waitForInput = true;
            terminalInput.setAttribute('placeholder', 'Introduzca clave...');
        }
    );
}

function handleUserInput(input) {
    if (isTyping) {
        appendText("Por favor, espere a que el texto termine de cargarse.");
        return;
    }

    if (waitForInput) {
        waitForInput = false;
        terminalInput.removeAttribute('placeholder');
        appendText("> " + input); // Mostrar lo que el usuario escribió

        var matchedPath = passwords[input.toUpperCase()]; // Convertir a mayúsculas para ser insensible a mayús/minús

        if (matchedPath) {
            currentPath = matchedPath;
            typeWriter(
                "Clave de autenticación aceptada.\n" +
                "Conectando a la red del Velo: " + currentPath.toUpperCase() + "...",
                function() {
                    showLoadingBar(3000, function() { // Simula una carga de 3 segundos
                        typeWriter("Conexión establecida. Iniciando secuencia de nodos...", function() {
                            showContinuePrompt(proceedAfterAuthentication); // Pide presionar tecla para continuar
                        });
                    });
                }
            );
        } else {
            typeWriter(
                "Clave de autenticación denegada.\n" +
                "Acceso no autorizado. Intentos restantes: Ilimitados. El Velo no juzga la persistencia, solo la comprensión.",
                function() {
                    waitForInput = true; // Permite reintentar
                    terminalInput.setAttribute('placeholder', 'Introduzca clave...');
                }
            );
            // Opcional: Añadir un pequeño glitch al fallar la contraseña
            setTimeout(applyGlitchEffect, 500);
            setTimeout(removeGlitchEffect, 1500);
        }
    } else {
        // Esto manejará la entrada si no se está esperando una contraseña
        appendText("> " + input);
        typeWriter("Comando no reconocido o no se espera entrada en este momento. Intente 'ayuda' si está disponible.", null);
    }
}

function proceedAfterAuthentication() {
    clearTerminal();
    // Aquí es donde el juego diverge según el 'currentPath'
    switch (currentPath) {
        case "pathA":
            typeWriter("Bienvenido, Programador. Tu camino hacia los enigmas de la lógica comienza ahora.", function() {
                // MARKER: Iniciar Nodos del Programador
                // En la siguiente fase definiremos los arrays de nodos para cada path
                // y la función para iniciar el primer nodo.
                // startProgramadorNode(currentNodeIndex); 
            });
            break;
        case "pathB":
            typeWriter("Bienvenido, Viajero. Los caminos dimensionales te aguardan.", function() {
                // MARKER: Iniciar Nodos del Viajero
                // startViajeroNode(currentNodeIndex);
            });
            break;
        case "pathC":
            typeWriter("Bienvenido, Corrupto. La disonancia te ha elegido. El caos te llama.", function() {
                // MARKER: Iniciar Nodos del Corrupto
                // startCorruptoNode(currentNodeIndex);
            });
            break;
        default:
            typeWriter("Error de ruta interna. Reiniciando secuencia.", startInitialScreen);
            break;
    }
}

// Inicializar el juego cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initGame);

/* MARKER: Aquí se añadirán las funciones para manejar los Nodos de cada Path */
// Por ejemplo:
// function startProgramadorNode(index) { ... }
// function startViajeroNode(index) { ... }
// function startCorruptoNode(index) { ... }
// ... y la lógica para cada enigma individual.