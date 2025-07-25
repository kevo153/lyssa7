// script.js
/* MARKER: Variables Globales */
var terminalOutput;
var terminalInput;
var terminalInputArea;
var terminalContainer;
var audioTeclado;
var audioGlitch;
var audioFondo;
var videoBackground;
var startOverlay;

var failureCountDisplay; // Elemento para mostrar el contador de fallos
var failureDisplayElement; // Referencia al div completo #failure-display

var currentOutputText = "";
var textSpeed = 50;
var isTyping = false;
var waitForInput = false;
var waitForKeyPress = false;
var continuePromptIsTyped = false;
var blockKeyboardInput = false; // Se usará si necesitamos pausar la entrada de teclado temporalmente

var subvertidorPower = 0;
const SUBVERTIDOR_MAX_POWER = 3; // Este valor puede ser ajustado según la dificultad deseada

var globalFailureCount = 0;
const MAX_GLOBAL_FAILURES = 5; // Máximo de fallos antes del Game Over

// Claves para localStorage
const GAME_FAILED_MAX_ATTEMPTS_KEY = "game_failed_max_attempts";
const PATH_A_COMPLETED_KEY = "pathA_completed";
const PATH_B_COMPLETED_KEY = "pathB_completed";
const PATH_C_COMPLETED_KEY = "pathC_completed";
const INITIAL_ACCESS_DONE_KEY = "initial_access_done"; // Para controlar si ya se vio la intro inicial

// Objeto para almacenar los nodos. Inicialmente, solo los nodos de éxito y la biblioteca.
// Los nodos de los paths (A, B, C) se cargarán dinámicamente aquí.
var nodes = {
    // --- NODOS DE ÉXITO PARA CADA PATH ---
    // Estos nodos se quedan aquí porque son estados finales comunes, no específicos de un path.
    "end_pathA_success": {
        id: "end_pathA_success",
        type: "function_call",
        func: function() {
            localStorage.setItem(PATH_A_COMPLETED_KEY, "true");
            typeWriter("LYSSA: 'El protocolo de Programador ha concluido con éxito. Los algoritmos de D-47 están restaurados. La Biblioteca de Ecos se ha desbloqueado. Preparando acceso...'", function() {
                showContinuePrompt(function() {
                    currentPath = "library";
                    currentNodeIndex = 0;
                    displayCurrentNode();
                });
            });
        }
    },
    "end_pathB_success": {
        id: "end_pathB_success",
        type: "function_call",
        func: function() {
            localStorage.setItem(PATH_B_COMPLETED_KEY, "true");
            typeWriter("LYSSA: 'El protocolo de Viajero ha concluido con éxito. Los nexos de D-47 están estabilizados. La Biblioteca de Ecos se ha desbloqueado. Preparando acceso...'", function() {
                showContinuePrompt(function() {
                    currentPath = "library";
                    currentNodeIndex = 0;
                    displayCurrentNode();
                });
            });
        }
    },
    "end_pathC_success": {
        id: "end_pathC_success",
        type: "function_call",
        func: function() {
            localStorage.setItem(PATH_C_COMPLETED_KEY, "true");
            typeWriter("LYSSA: 'El protocolo de Corrupto ha concluido con éxito. Las brechas de D-47 han sido reorientadas. La Biblioteca de Ecos se ha desbloqueado. Preparando acceso...'", function() {
                showContinuePrompt(function() {
                    currentPath = "library";
                    currentNodeIndex = 0;
                    displayCurrentNode();
                });
            });
        }
    },
    // --- NODOS DE LA BIBLIOTECA ---
    // Se asume que LIBRARY_NODES está definido en libraryNodes.js y cargado previamente.
    "library": LIBRARY_NODES
    // Los paths A, B, C se añadirán aquí dinámicamente: nodes.pathA = PATH_A_NODES;
};

/* MARKER: Funciones de Utilidad de la Terminal y Multimedia */

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

function typeWriter(text, callback) {
    isTyping = true;
    currentOutputText = text;
    terminalOutput.innerHTML = ''; // Limpia antes de escribir
    let i = 0;
    const speed = textSpeed;

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
            if (callback) {
                callback();
            }
        }
    }
    type();
}

function appendText(text) {
    terminalOutput.innerHTML += text + '\n';
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function clearTerminal() {
    terminalOutput.innerHTML = '';
}

function applyGlitchEffect() {
    terminalContainer.classList.add('glitch');
    playAudio(audioGlitch);
    blockKeyboardInput = true; // Bloquea la entrada durante el glitch visual
}

function removeGlitchEffect() {
    terminalContainer.classList.remove('glitch');
    stopAudio(audioGlitch);
    blockKeyboardInput = false; // Desbloquea la entrada
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

function updateFailureDisplay() {
    const displayElement = document.getElementById('failure-count');
    if (displayElement) {
        displayElement.textContent = globalFailureCount;
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

    typeWriter(promptText, function() {
        waitForInput = true;
        terminalInput.setAttribute('placeholder', 'Tu respuesta...');
        if (callback) callback();
    });
}


/* MARKER: Lógica del Juego - Inicio y Reinicio */

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
    failureCountDisplay = document.getElementById('failure-count');
    failureDisplayElement = document.getElementById('failure-display');

    // Cargar el contador de fallos global desde localStorage
    globalFailureCount = parseInt(localStorage.getItem('globalFailureCount') || '0', 10);
    updateFailureDisplay();

    // Event Listener para la entrada del teclado (tecla Enter)
    terminalInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Previene el salto de línea por defecto del Enter
            if (!isTyping && waitForInput) { // Si no está escribiendo y se espera una entrada de texto
                const input = terminalInput.value.trim();
                terminalInput.value = ''; // Limpia el input
                handleUserInput(input);
            } else if (waitForKeyPress) { // Si se espera cualquier tecla para continuar
                handleContinuePrompt();
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
    document.getElementById('reset-game-button').addEventListener('click', function() {
        localStorage.clear(); // Limpia todo el localStorage
        location.reload();    // Recarga la página
    });

    // Reproducir audio de fondo al primer click en el body (requerimiento de navegadores)
    document.body.addEventListener('click', function() {
        if (audioFondo.paused) {
            audioFondo.play().catch(e => console.error("Error al reproducir audio de fondo:", e));
        }
    }, { once: true }); // 'once: true' asegura que el listener se ejecute solo una vez
}

function startExperience() {
    // Oculta el overlay de inicio
    if (startOverlay) {
        startOverlay.style.opacity = '0';
        setTimeout(() => {
            startOverlay.style.display = 'none';
        }, 1000); // Coincide con la duración de la transición CSS
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
        typeWriter("LYSSA: 'Bienvenido de nuevo. Acceso a la Biblioteca de Ecos activado. Ingresa un protocolo de acceso para continuar, o 'BIBLIOTECA' para explorar los archivos.'", function() {
            waitForInput = true;
            terminalInput.setAttribute('placeholder', 'Introduzca clave...');
        });
        currentPath = "initial_access"; // Establece el estado para manejar la entrada de clave
        currentNodeIndex = 0; // Se mantiene en 0 para la primera parte de la introducción o elección de path
    } else {
        // Si es la primera vez o no se ha completado ningún path aún, muestra la introducción completa
        localStorage.setItem(INITIAL_ACCESS_DONE_KEY, "true"); // Marca que ya se vio la intro
        typeWriter(
            "--- INICIANDO CONEXIÓN CON EL VELO ---\n\n" +
            "Se activa el protocolo de enlace neuronal. Tus sentidos se agudizan, y la realidad conocida se disuelve en un mar de datos pulsantes. La voz sintética de LYSSA, la IA principal de la Instalación D-47, resuena directamente en tu conciencia:\n\n" +
            "'Anomalía detectada. Interferencia persistente en las frecuencias de resonancia de esta 'Instalación D-47'. El Subvertidor de Ciclos se ha manifestado una vez más. Su patrón es de naturaleza parasitaria, buscando infiltrarse en los protocolos existenciales para generar disonancia y consumir realidades.'\n\n" +
            "Sientes una extraña sensación de familiaridad con esta voz y este entorno, como un eco de un pasado que no recuerdas. LYSSA continúa: 'Tu acceso fue activado por una resonancia atípica. Eres una entidad no programada. Necesitamos tu intervención. Debes seleccionar tu 'protocolo de acceso' para iniciar la calibración y el contra-ataque contra el Subvertidor.'\n\n" +
            "LYSSA: 'Para iniciar tu intervención, el Velo requiere una **clave de resonancia**. Esta clave no te será dada, sino que debe ser **percibida**. Es el reflejo de tu propósito aquí, el primer paso para alinearte con las capas de existencia.'\n\n" +
            "LYSSA: '**Ingresa la clave de resonancia** que te conecta con tu verdadero rol en esta crisis.'",
            function() {
                waitForInput = true;
                terminalInput.setAttribute('placeholder', 'Introduzca clave de resonancia...');
            }
        );
        currentPath = "initial_access"; // Estado para manejar la clave inicial
        currentNodeIndex = 0;
    }
    terminalInput.focus(); // Pone el foco en el input para que el usuario pueda escribir
}

function showContinuePrompt(callback) {
    waitForKeyPress = true; // Indica que se espera una pulsación de tecla
    continuePromptIsTyped = true; // Flag para saber si ya se mostró el prompt
    appendText("\n\nPresiona cualquier tecla para continuar...");
    // Envuelve el callback para asegurar que los flags se reseteen
    if (callback) {
        const originalCallback = callback;
        callback = () => {
            originalCallback();
            waitForKeyPress = false;
            continuePromptIsTyped = false;
        };
    }
}

function handleContinuePrompt() {
    // Si ya se ha mostrado el prompt "Presiona cualquier tecla..."
    if (continuePromptIsTyped) {
        waitForKeyPress = false;
        continuePromptIsTyped = false;

        // Lógica específica para la Biblioteca
        if (currentPath === "library" && nodes.library[currentNodeIndex].next === "wait_for_key_library") {
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

function displayFailedConnectionScreen() {
    clearTerminal();
    terminalContainer.classList.add('glitch');
    terminalOutput.classList.add('glitch-red-text');
    playAudio(audioGlitch); // Reproduce el sonido de glitch

    typeWriter(
        "--- ERROR CRÍTICO: CONEXIÓN CON EL VELO INTERRUMPIDA ---\n\n" +
        "La disonancia ha consumido este segmento. Tu mente se disocia del Velo, arrastrada de vuelta a una realidad fragmentada. La conexión se ha roto.\n\n" +
        "Has alcanzado el límite de fallos globales. La Instalación D-47 se desconecta de tu frecuencia.\n\n" +
        "LYSSA: 'Acceso denegado. La realidad se resetea. Tu intervención ha concluido.'\n\n" +
        "----------------------------------------------------------------------------------\n" +
        "// Fallo de conexión. Intentando re-rutear a un nodo de respaldo...\n" +
        "// Protocolo de emergencia activado. Buscando puntos de acceso alternativos...\n" +
        "// Ubicación de respaldo identificada: 'Ciudad Flotante' o 'Ciudad Asteroide'.\n" +
        "// Posible nueva frecuencia de acceso detectada: <span class='glitch-text-hint'>'Ecos de un Protocolo Olvidado'</span>\n" +
        "// Se requiere re-calibración manual para intentar una nueva conexión.",
        function() {
            // Remover efectos de glitch después de un tiempo
            setTimeout(() => {
                terminalContainer.classList.remove('glitch');
                terminalOutput.classList.remove('glitch-red-text');
                stopAudio(audioGlitch);
            }, 2000);

            // Ofrecer reiniciar el juego
            showContinuePrompt(function() {
                location.reload(); // Recarga la página para reiniciar
            });
        }
    );
}

/* MARKER: Lógica del Juego - Core */

var currentPath = ''; // Almacena el ID del path actual ('pathA', 'pathB', 'pathC', 'library', 'initial_access')
var currentNodeIndex = 0; // Índice del nodo actual dentro del path

// Objeto que mapea las claves de entrada a los IDs de los paths
var passwords = {
    "M205": "pathA",    // Clave para el Path del Programador
    "PADEL": "pathB",   // Clave para el Path del Viajero
    "PIFIA": "pathC",   // Clave para el Path del Corrupto
    "BIBLIOTECA": "library" // Clave para la Biblioteca
};

function displayCurrentNode() {
    clearTerminal(); // Limpia la terminal al mostrar un nuevo nodo
    let node;

    // Obtener el nodo actual del path correcto
    if (currentPath === "library") {
        node = nodes.library[currentNodeIndex];
    } else if (nodes[currentPath]) { // Verifica si el path (e.g., nodes.pathA) ya ha sido cargado dinámicamente
        node = nodes[currentPath][currentNodeIndex];
    } else {
        // Esto no debería ocurrir si el flujo de carga dinámica es correcto.
        // Si pasa, indica un error grave.
        typeWriter("ERROR: Path '" + currentPath + "' no cargado o no válido. Reiniciando el Velo...", function() {
            showContinuePrompt(function() {
                // Reinicia el juego si hay un error en la carga del path
                localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                localStorage.setItem('globalFailureCount', '0');
                updateFailureDisplay();
                location.reload();
            });
        });
        return;
    }

    // Manejo para el final de un path que no conduce a un estado de victoria o biblioteca
    if (!node) {
        typeWriter("--- FIN DE LA SECUENCIA DE NODOS ---\n\nEl Velo se cierra. Presiona cualquier tecla para reiniciar y explorar otros caminos.", function() {
            showContinuePrompt(function() {
                // Al final de un camino sin siguiente nodo específico, reinicia para permitir explorar otros.
                localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                localStorage.setItem('globalFailureCount', '0');
                updateFailureDisplay();
                location.reload();
            });
        });
        return;
    }

    // Lógica para nodos de función (como end_pathX_success)
    if (node.type === "function_call") {
        node.func();
        return;
    }

    // Aplica efecto glitch si el nodo lo requiere
    if (node.glitch) {
        applyGlitchEffect();
        setTimeout(removeGlitchEffect, 2000); // Remueve el glitch después de 2 segundos
    }

    // Maneja los diferentes tipos de nodos
    if (node.type === "text_only") {
        typeWriter(node.text, function() {
            if (node.next === "wait_for_key_library") {
                // Retorna a la pantalla principal de la biblioteca
                showContinuePrompt(function() {
                    currentPath = "library";
                    currentNodeIndex = 0;
                    displayCurrentNode();
                });
            } else if (node.next === "wait_for_key") {
                // Simplemente espera una tecla para continuar en el mismo path
                showContinuePrompt();
            } else if (node.next === "end_game_reload") {
                // Recarga el juego completamente
                showContinuePrompt(function() {
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
                    displayCurrentNode();
                } else {
                    // Si el nodo "next" no se encuentra, hay un error en la definición del nodo
                    typeWriter("ERROR: Nodo siguiente '" + node.next + "' no encontrado en el path '" + currentPath + "'. Terminando secuencia.", function() {
                        showContinuePrompt(function() {
                            localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                            localStorage.setItem('globalFailureCount', '0');
                            updateFailureDisplay();
                            location.reload();
                        });
                    });
                }
            } else {
                // Si no hay un nodo "next" definido, es el final de una secuencia de texto
                typeWriter("Secuencia de nodo de texto finalizada sin siguiente instrucción. Fin de este segmento.", function(){
                     showContinuePrompt(function() {
                        localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                        localStorage.setItem('globalFailureCount', '0');
                        updateFailureDisplay();
                        location.reload();
                    });
                });
            }
        });
    } else if (node.type === "enigma_input") {
        // Nodo de acertijo de texto
        typeWriter(node.prompt, function() {
            waitForInput = true;
            terminalInput.setAttribute('placeholder', 'Tu respuesta...');
        });
    } else if (node.type === "visual_enigma_input") {
        // Nodo para acertijos visuales con imagen o ASCII art
        // Prioriza ascii_art si existe, de lo contrario, usa 'image'
        if (node.ascii_art) {
            displayVisualContentPrompt(node.ascii_art, node.prompt, function() {
                waitForInput = true;
                terminalInput.setAttribute('placeholder', 'Tu respuesta...');
            }, true); // El 'true' final indica que es ASCII Art
        } else if (node.image) {
            displayVisualContentPrompt(node.image, node.prompt, function() {
                waitForInput = true;
                terminalInput.setAttribute('placeholder', 'Tu respuesta...');
            }, false); // El 'false' final indica que es una imagen real
        } else {
            // Manejo de error si no hay contenido visual definido
            typeWriter("ERROR: Nodo visual_enigma_input sin contenido ('ascii_art' ni 'image'). Reporte esto al sistema. Presiona cualquier tecla para continuar.", function() {
                showContinuePrompt();
            });
        }
    }
}

function handleUserInput(input) {
    if (isTyping) {
        terminalInput.value = ''; // Evita que el usuario escriba mientras la IA está escribiendo
        return;
    }

    // Lógica para la entrada inicial de clave (M205, PADEL, PIFIA, BIBLIOTECA)
    if (currentPath === "initial_access") {
        waitForInput = false; // Detiene la espera de entrada mientras se procesa
        terminalInput.removeAttribute('placeholder');
        appendText("> " + input); // Muestra la entrada del usuario

        const inputKey = input.toUpperCase();
        var matchedPathKey = passwords[inputKey]; // Obtiene el ID del path (ej. "pathA")

        if (matchedPathKey) {
            // Comprobación de paths ya completados (no permite reingresar a un path ya terminado, excepto la biblioteca)
            if (inputKey !== "BIBLIOTECA" &&
                ((inputKey === "M205" && localStorage.getItem(PATH_A_COMPLETED_KEY) === "true") ||
                 (inputKey === "PADEL" && localStorage.getItem(PATH_B_COMPLETED_KEY) === "true") ||
                 (inputKey === "PIFIA" && localStorage.getItem(PATH_C_COMPLETED_KEY) === "true")))
            {
                typeWriter(
                    "<span class='glitch-red-text'>ERROR CRÍTICO: CONEXIÓN REMOTA '" + inputKey + "' DESHABILADA.</span>\n" +
                    "El Subvertidor de Ciclos ha sellado o estabilizado este nodo. Acceso denegado a caminos ya completados.\n" +
                    "Explora la Biblioteca de Ecos ('BIBLIOTECA') o intenta un protocolo diferente no completado.",
                    function() {
                        terminalOutput.classList.add('glitch-red-text');
                        applyGlitchEffect(); // Glitch visual para el error
                        setTimeout(() => {
                            terminalOutput.classList.remove('glitch-red-text');
                            removeGlitchEffect();
                        }, 2000);

                        setTimeout(function() { // Espera un poco antes de volver a pedir input
                            waitForInput = true;
                            terminalInput.setAttribute('placeholder', 'Introduzca clave...');
                        }, 2000);
                    }
                );
                return;
            }

            // Si intenta acceder a la biblioteca pero ningún path ha sido completado
            if (inputKey === "BIBLIOTECA" &&
                !(localStorage.getItem(PATH_A_COMPLETED_KEY) === "true" ||
                  localStorage.getItem(PATH_B_COMPLETED_KEY) === "true" ||
                  localStorage.getItem(PATH_C_COMPLETED_KEY) === "true"))
            {
                typeWriter("LYSSA: 'La Biblioteca de Ecos está sellada. Se requiere la finalización de al menos un protocolo principal para desbloquear el acceso a sus archivos profundos.'", function() {
                    waitForInput = true;
                    terminalInput.setAttribute('placeholder', 'Introduzca clave...');
                });
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
                scriptElement.onload = () => {
                    // Este callback se ejecuta una vez que el script (e.g., pathA.js) ha terminado de cargar.
                    // En ese momento, la variable global (e.g., PATH_A_NODES) definida en ese script estará disponible.
                    if (matchedPathKey === "pathA") nodes.pathA = PATH_A_NODES;
                    else if (matchedPathKey === "pathB") nodes.pathB = PATH_B_NODES;
                    else if (matchedPathKey === "pathC") nodes.pathC = PATH_C_NODES;

                    if (failureDisplayElement) {
                        failureDisplayElement.style.display = 'block'; // Muestra el contador de fallos
                    }
                    currentPath = matchedPathKey; // Establece el path actual
                    typeWriter(
                        "Clave de autenticación aceptada.\n" +
                        "Conectando a la red del Velo: " + currentPath.toUpperCase() + "...",
                        function() {
                            showLoadingBar(3000, function() {
                                proceedAfterAuthentication(); // Inicia el juego en el path cargado
                            });
                        }
                    );
                };
                scriptElement.onerror = () => {
                    // Manejo de errores si el script no se carga
                    typeWriter("ERROR CRÍTICO: No se pudo cargar el protocolo de " + matchedPathKey.toUpperCase() + ". La realidad se desgarra. Presiona cualquier tecla para reiniciar.", function() {
                        showContinuePrompt(() => location.reload());
                    });
                };
                document.body.appendChild(scriptElement); // Añade el script al DOM para que el navegador lo cargue
            } else {
                // Si es la biblioteca o el path ya estaba cargado, procede directamente
                if (failureDisplayElement) {
                    failureDisplayElement.style.display = 'block';
                }
                currentPath = matchedPathKey;
                typeWriter(
                    "Clave de autenticación aceptada.\n" +
                    "Conectando a la red del Velo: " + currentPath.toUpperCase() + "...",
                    function() {
                        showLoadingBar(3000, function() {
                            if (currentPath === "library") {
                                // Si es la biblioteca, comienza desde el primer nodo de la biblioteca
                                currentNodeIndex = 0;
                                displayCurrentNode();
                            } else {
                                proceedAfterAuthentication(); // Inicia el juego en el path existente
                            }
                        });
                    }
                );
            }
        } else {
            // Clave inicial incorrecta
            typeWriter(
                "Clave de autenticación denegada.\n" +
                "Acceso no autorizado. Intentos restantes: Ilimitados. El Velo no juzga la persistencia, solo la comprensión.",
                function() {
                    waitForInput = true; // Vuelve a pedir input
                    terminalInput.setAttribute('placeholder', 'Introduzca clave...');
                }
            );
            applyGlitchEffect();
            setTimeout(removeGlitchEffect, 1500);
        }
    }
    // Lógica para acertijos (enigma_input o visual_enigma_input) dentro de un path
    else if (waitForInput && nodes[currentPath] && nodes[currentPath][currentNodeIndex]) {
        var node = nodes[currentPath][currentNodeIndex];
        if (node.type === "enigma_input" || node.type === "visual_enigma_input") {
            waitForInput = false;
            terminalInput.removeAttribute('placeholder');
            appendText("> " + input);

            // Comprueba la respuesta del acertijo (case-insensitive)
            if (input.toUpperCase() === String(node.answer).toUpperCase()) {
                subvertidorPower = Math.max(0, subvertidorPower - 1); // Reduce el poder del Subvertidor
                typeWriter(node.correct_feedback + "\n\n[NIVEL DE AMENAZA DEL SUBVERTIDOR: " + subvertidorPower + "]", function() {
                    updateFailureDisplay(); // Actualiza el contador (aunque no cambia en éxito)
                    showContinuePrompt(function() {
                        if (node.next_on_correct) {
                            // Busca el siguiente nodo por ID
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
                                displayCurrentNode();
                            } else {
                                // Error si el nodo "next_on_correct" no existe
                                typeWriter("ERROR: Nodo siguiente correcto '" + node.next_on_correct + "' no encontrado. Terminando secuencia.", function() {
                                    showContinuePrompt(function() {
                                        localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                                        localStorage.setItem('globalFailureCount', '0');
                                        updateFailureDisplay();
                                        location.reload();
                                    });
                                });
                            }
                        } else {
                            currentNodeIndex++; // Si no hay "next_on_correct", avanza linealmente
                            displayCurrentNode();
                        }
                    });
                });
            } else {
                // Respuesta incorrecta
                subvertidorPower++; // Aumenta el poder del Subvertidor
                globalFailureCount++; // Incrementa el contador de fallos globales
                localStorage.setItem('globalFailureCount', globalFailureCount.toString());
                updateFailureDisplay();

                if (globalFailureCount >= MAX_GLOBAL_FAILURES) {
                    // Si se alcanza el límite de fallos globales, activa el Game Over
                    localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "true");
                    displayFailedConnectionScreen();
                    return;
                }

                typeWriter(
                    node.incorrect_feedback +
                    "\n\n[NIVEL DE AMENAZA DEL SUBVERTIDOR: " + subvertidorPower + "]\n" +
                    "[FALLOS GLOBALES: " + globalFailureCount + " / " + MAX_GLOBAL_FAILURES + "]",
                    function() {
                        if (node.retry_on_incorrect) {
                            waitForInput = true; // Permite reintentar el mismo acertijo
                            terminalInput.setAttribute('placeholder', 'Tu respuesta...');
                        } else {
                            // Si no permite reintentar, termina el juego
                            typeWriter("Secuencia interrumpida por fallo crítico. Reiniciando el Velo...", function() {
                                 showContinuePrompt(function() {
                                    localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                                    localStorage.setItem('globalFailureCount', '0');
                                    updateFailureDisplay();
                                    location.reload();
                                });
                            });
                        }
                    }
                );
                applyGlitchEffect(); // Aplica glitch visual por fallo
                setTimeout(removeGlitchEffect, 1500);
            }
        } else if (node.type === "text_only" && node.next === "end_game_reload") {
             // Este caso se asegura de que si un nodo de texto final lleva a reiniciar, se maneje
            showContinuePrompt(function() {
                localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                localStorage.setItem('globalFailureCount', '0');
                updateFailureDisplay();
                location.reload();
            });
        }
    }
    // Si la entrada no coincide con ningún estado esperado
    else {
        appendText("> " + input);
        typeWriter("Comando no reconocido o no se espera entrada en este momento. Intente 'ayuda' si está disponible.", null);
    }
}

// Función que se ejecuta después de que la autenticación inicial es exitosa y la barra de carga termina
function proceedAfterAuthentication() {
    currentNodeIndex = 0; // Reinicia el índice del nodo para empezar el path desde el principio
    displayCurrentNode(); // Muestra el primer nodo del path recién cargado/seleccionado
}

/* MARKER: Inicialización del Juego */
document.addEventListener('DOMContentLoaded', initGame);