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


/* MARKER: Definición de los Nodos para cada Path */

var nodes = {
    "pathA": [ // Nodos para el camino del Programador
        {
            id: "programador_01",
            type: "text_only",
            text: "--- PROGRAMADOR: SECUENCIA DE INICIO ---\n\nEl Velo se pliega ante ti, sus patrones binarios emergen de la niebla. Una serie de errores de sistema parpadean en la distancia. LYSSA susurra: 'Anomalía de lógica detectada. Inconsistencia estructural. Se requiere re-calibración.'",
            next: "wait_for_key",
            glitch: true
        },
        {
            id: "programador_02",
            type: "enigma_input",
            prompt: "ENIGMA DE LA DISONANCIA:\nIdentifica el patrón corrupto. De la siguiente secuencia, ¿cuál es el número intruso?\n[ 1, 3, 6, 10, 15, 21, 28, 37 ]\n\nINGRESA EL NÚMERO INTRUSO:",
            answer: "37", // La secuencia es la suma de números consecutivos (1, 1+2=3, 3+3=6, etc. - números triangulares). 37 debería ser 36 (suma de 1 a 8).
            correct_feedback: "Sistema re-calibrado. Patrón de disonancia corregido. Acceso al siguiente módulo desbloqueado.",
            incorrect_feedback: "Error de lógica. El patrón persiste. Vuelve a intentar. La estabilidad pende de un hilo.",
            next_on_correct: "programador_03",
            retry_on_incorrect: true // Permite reintentar el enigma
        },
        {
            id: "programador_03",
            type: "text_only",
            text: "La interfaz se estabiliza. Has demostrado una comprensión básica de las fallas del Velo. Un nuevo segmento de la red se ilumina en tu mapa mental.",
            next: "wait_for_key"
        }
        // MARKER: Añadir más nodos del Programador aquí
    ],
    "pathB": [ // Nodos para el camino del Viajero
        {
            id: "viajero_01",
            type: "text_only",
            text: "--- VIAJERO: RECALIBRACIÓN DIMENSIONAL ---\n\nLa niebla se arremolina, revelando ecos de lugares que nunca visitaste. Los portales parpadean, inestables. LYSSA: 'Desplazamiento espacio-temporal. Frecuencias de resonancia inestables. Requiere anclaje.'",
            next: "wait_for_key",
            glitch: true
        },
        {
            id: "viajero_02",
            type: "enigma_input",
            prompt: "ENIGMA DEL ANCLAJE:\nPara estabilizar este nexo temporal, ¿qué objeto de tu pasado, sin importar su insignificancia, sientes que te ancla más fuertemente a la 'realidad'?",
            answer: "LIBRO", // Ejemplo: una palabra clave. Podría ser cualquier cosa significativa para el personaje/jugador.
            correct_feedback: "Resonancia establecida. El nexo se estabiliza con tu anclaje. Una ruta se manifiesta brevemente en la niebla.",
            incorrect_feedback: "Anclaje insuficiente. La niebla te confunde. Piensa en lo que realmente te arraiga.",
            next_on_correct: "viajero_03",
            retry_on_incorrect: true
        },
        {
            id: "viajero_03",
            type: "text_only",
            text: "La distorsión cede. Has encontrado un punto de referencia. Ahora puedes percibir los tenues hilos que conectan los planos.",
            next: "wait_for_key"
        }
        // MARKER: Añadir más nodos del Viajero aquí
    ],
    "pathC": [ // Nodos para el camino del Corrupto
        {
            id: "corrupto_01",
            type: "text_only",
            text: "--- CORRUPTO: FUSIÓN DE ENTIDADES ---\n\nEl Velo ya no te oculta sus horrores; te los ofrece. Sientes un tirón, una voracidad. LYSSA: 'Presencia anómala detectada. Contaminación del sistema. La disonancia se propaga.'",
            next: "wait_for_key",
            glitch: true
        },
        {
            id: "corrupto_02",
            type: "enigma_input",
            prompt: "ENIGMA DE LA SINFONÍA ROTA:\nEl Velo canta en tres tonos: Miedo, Culpa, Vacío. Para canalizar su poder, ¿qué emoción te consume más profundamente ahora mismo?",
            answer: "VACIO", // O MIEDO, CULPA. Basado en el Lore_El_Velo.txt sobre trauma.
            correct_feedback: "Resonancia con el Velo establecida. El poder fluye, las barreras se rompen. Tu voluntad es una onda expansiva.",
            incorrect_feedback: "La disonancia es sutil. No has abrazado la verdadera naturaleza de tu corrupción. Vuelve a intentarlo.",
            next_on_correct: "corrupto_03",
            retry_on_incorrect: true
        },
        {
            id: "corrupto_03",
            type: "text_only",
            text: "Una ola de poder recorre tu ser. Los fragmentos del Velo te reconocen. Ahora eres parte de su caos y su fuerza.",
            next: "wait_for_key"
        }
        // MARKER: Añadir más nodos del Corrupto aquí
    ]
};

/* MARKER: Lógica para manejar la secuencia de Nodos */

function startNodeSequence(path) {
    currentPath = path;
    currentNodeIndex = 0; // Siempre empezar desde el primer nodo del path
    displayCurrentNode();
}

function displayCurrentNode() {
    clearTerminal(); // Limpiar la pantalla para el nuevo nodo
    var node = nodes[currentPath][currentNodeIndex];

    if (!node) {
        // Si no hay más nodos en este path, el juego termina o redirige.
        typeWriter("--- FIN DE LA SECUENCIA DE NODOS --- \n\nHas llegado al final de este camino. El Velo se cierra (por ahora).", function() {
            // MARKER: Lógica de fin de juego / reinicio
            showContinuePrompt(function() {
                location.reload(); // Recargar la página para reiniciar el juego
            });
        });
        return;
    }

    // Aplicar/quitar glitch si el nodo lo indica
    if (node.glitch) {
        applyGlitchEffect();
        setTimeout(removeGlitchEffect, 2000); // Glitch dura 2 segundos
    }

    if (node.type === "text_only") {
        typeWriter(node.text, function() {
            if (node.next === "wait_for_key") {
                showContinuePrompt(function() {
                    currentNodeIndex++;
                    displayCurrentNode();
                });
            } else if (node.next) {
                // Si 'next' es un ID de nodo específico, buscarlo y saltar
                var nextNodeFound = false;
                for (var i = 0; i < nodes[currentPath].length; i++) {
                    if (nodes[currentPath][i].id === node.next) {
                        currentNodeIndex = i;
                        nextNodeFound = true;
                        break;
                    }
                }
                if (nextNodeFound) {
                    displayCurrentNode();
                } else {
                    typeWriter("ERROR: Nodo siguiente '" + node.next + "' no encontrado. Terminando secuencia.", function() {
                        // MARKER: Lógica de error o fin de juego
                    });
                }
            } else {
                // Si no hay 'next' definido, asumir que se espera una acción externa (ej. input)
                waitForInput = true;
                terminalInput.setAttribute('placeholder', 'Esperando comando...');
            }
        });
    } else if (node.type === "enigma_input") {
        typeWriter(node.prompt, function() {
            waitForInput = true;
            terminalInput.setAttribute('placeholder', 'Tu respuesta...');
        });
    }
    // MARKER: Añadir otros tipos de nodos aquí si es necesario (ej. 'choice_input')
}

// Actualizar la función proceedAfterAuthentication para usar startNodeSequence
function proceedAfterAuthentication() {
    clearTerminal();
    // Aquí es donde el juego diverge según el 'currentPath'
    switch (currentPath) {
        case "pathA":
            typeWriter("Bienvenido, Programador. Tu camino hacia los enigmas de la lógica comienza ahora.", function() {
                startNodeSequence(currentPath); // Inicia la secuencia de nodos para el Programador
            });
            break;
        case "pathB":
            typeWriter("Bienvenido, Viajero. Los caminos dimensionales te aguardan.", function() {
                startNodeSequence(currentPath); // Inicia la secuencia de nodos para el Viajero
            });
            break;
        case "pathC":
            typeWriter("Bienvenido, Corrupto. La disonancia te ha elegido. El caos te llama.", function() {
                startNodeSequence(currentPath); // Inicia la secuencia de nodos para el Corrupto
            });
            break;
        default:
            typeWriter("Error de ruta interna. Reiniciando secuencia.", startInitialScreen);
            break;
    }
}

// Actualizar la función handleUserInput para procesar enigmas
function handleUserInput(input) {
    if (isTyping) {
        appendText("Por favor, espere a que el texto termine de cargarse.");
        return;
    }

    // Si estamos esperando un input para un enigma
    var node = nodes[currentPath] ? nodes[currentPath][currentNodeIndex] : null;

    if (waitForInput && node && node.type === "enigma_input") {
        waitForInput = false; // Desactivar la espera de input temporalmente
        terminalInput.removeAttribute('placeholder');
        appendText("> " + input); // Mostrar lo que el usuario escribió

        if (input.toUpperCase() === node.answer.toUpperCase()) {
            typeWriter(node.correct_feedback, function() {
                currentNodeIndex++; // Avanzar al siguiente nodo
                displayCurrentNode();
            });
        } else {
            typeWriter(node.incorrect_feedback, function() {
                if (node.retry_on_incorrect) {
                    waitForInput = true; // Volver a esperar input para el mismo enigma
                    terminalInput.setAttribute('placeholder', 'Tu respuesta...');
                } else {
                    // Si no se permite reintentar, avanzar o terminar el juego
                    typeWriter("Secuencia interrumpida por fallo crítico. Reiniciando...", startInitialScreen);
                }
            });
            // Opcional: Glitch al fallar un enigma
            applyGlitchEffect();
            setTimeout(removeGlitchEffect, 1500);
        }
    } else if (waitForInput) {
        // Esto es para la pantalla inicial de la contraseña
        // Lógica de la contraseña que ya teníamos
        waitForInput = false;
        terminalInput.removeAttribute('placeholder');
        appendText("> " + input); // Mostrar lo que el usuario escribió

        var matchedPath = passwords[input.toUpperCase()]; 

        if (matchedPath) {
            currentPath = matchedPath;
            typeWriter(
                "Clave de autenticación aceptada.\n" +
                "Conectando a la red del Velo: " + currentPath.toUpperCase() + "...",
                function() {
                    showLoadingBar(3000, function() { 
                        typeWriter("Conexión establecida. Iniciando secuencia de nodos...", function() {
                            showContinuePrompt(proceedAfterAuthentication); 
                        });
                    });
                }
            );
        } else {
            typeWriter(
                "Clave de autenticación denegada.\n" +
                "Acceso no autorizado. Intentos restantes: Ilimitados. El Velo no juzga la persistencia, solo la comprensión.",
                function() {
                    waitForInput = true; 
                    terminalInput.setAttribute('placeholder', 'Introduzca clave...');
                }
            );
            setTimeout(applyGlitchEffect, 500);
            setTimeout(removeGlitchEffect, 1500);
        }
    } else {
        // Esto manejará la entrada si no se está esperando una contraseña ni un enigma
        appendText("> " + input);
        typeWriter("Comando no reconocido o no se espera entrada en este momento. Intente 'ayuda' si está disponible.", null);
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