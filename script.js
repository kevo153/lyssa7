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

var currentOutputText = "";
var textSpeed = 50; // Puedes ajustar la velocidad aquí (menor número = más rápido)
var isTyping = false; // Indica si *cualquier* secuencia de typeWriter está activa
var waitForInput = false; // Controla si la terminal está esperando una entrada general (como la contraseña inicial o enigma)
var waitForKeyPress = false; // Controla si se espera un "presiona cualquier tecla para continuar"
var continuePromptIsTyped = false; // NUEVO: Para saber si el mensaje "presiona cualquier tecla para continuar" ya terminó de escribirse
var blockKeyboardInput = false; // NUEVO: Bandera global para bloquear toda la entrada de teclado durante la escritura

/* MARKER: Audio Control */
function playAudio(audioElement, loop) {
    if (audioElement) {
        audioElement.loop = loop || false;
        audioElement.play().catch(function(error) {
            console.error("Error al intentar reproducir audio:", error);
        });
    }
}

function stopAudio(audioElement) {
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
}

/* MARKER: Funciones de Utilidad de la Terminal */

function typeWriter(text, callback) {
    isTyping = true;
    blockKeyboardInput = true; // NUEVO: Bloquear entrada al iniciar escritura
    terminalInputArea.style.display = 'none'; // Ocultar el área de entrada mientras se escribe
    var i = 0;
    currentOutputText += "\n";

    function typeChar() {
        if (i < text.length) {
            currentOutputText += text.charAt(i);
            terminalOutput.innerText = currentOutputText;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            i++;
            setTimeout(typeChar, textSpeed);
        } else {
            isTyping = false;
            blockKeyboardInput = false; // NUEVO: Permitir entrada al finalizar escritura
            terminalInputArea.style.display = 'flex'; // Mostrar el área de entrada
            terminalInput.focus();
            if (callback) {
                callback();
            }
        }
    }
    typeChar();
}

function appendText(text) {
    currentOutputText += "\n" + text;
    terminalOutput.innerText = currentOutputText;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    terminalInput.focus();
}

function clearTerminal() {
    currentOutputText = "";
    terminalOutput.innerText = "";
}

/* MARKER: Funciones de Efectos Visuales */

function applyGlitchEffect() {
    terminalContainer.classList.add('glitch');
    if (audioGlitch) {
        audioGlitch.currentTime = 0;
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
                if (terminalOutput.contains(loadingBarContainer)) {
                    terminalOutput.removeChild(loadingBarContainer);
                }
                if (terminalOutput.contains(loadingPercentage)) {
                    terminalOutput.removeChild(loadingPercentage);
                }
                if (callback) {
                    callback();
                }
            }, 500);
        }
    }, 50);
}

/* MARKER: Lógica del Juego - Inicio */

function initGame() {
    terminalOutput = document.getElementById('terminal-output');
    terminalInput = document.getElementById('terminal-input');
    terminalInputArea = document.getElementById('terminal-input-area');
    terminalContainer = document.getElementById('terminal-container');

    audioTeclado = document.getElementById('audio-teclado');
    audioGlitch = document.getElementById('audio-glitch');
    audioFondo = document.getElementById('audio-fondo');
    videoBackground = document.querySelector('#video-background-container video');
    startOverlay = document.getElementById('start-overlay');

    startOverlay.addEventListener('click', startExperience);

    terminalInput.addEventListener('keydown', function(event) {
        if (blockKeyboardInput) { // NUEVO: Si el teclado está bloqueado, prevenir y salir
            event.preventDefault();
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault(); // Evitar salto de línea en el input
            var input = terminalInput.value.trim();
            terminalInput.value = ''; // Limpiar input
            handleUserInput(input);
        } else {
            // Reproducir sonido de teclado solo si no es una tecla especial como Shift, Ctrl, Alt, etc.
            if (audioTeclado && event.key.length === 1) {
                playAudio(audioTeclado);
            }
        }
    });

    // Listener para "presiona cualquier tecla para continuar..."
    document.addEventListener('keydown', function(event) {
        if (blockKeyboardInput) { // NUEVO: Si el teclado está bloqueado, prevenir y salir
            event.preventDefault();
            return;
        }

        if (waitForKeyPress) {
            // NUEVO: Solo continuar si el mensaje ya terminó de escribirse
            if (!continuePromptIsTyped) {
                return; // Ignorar si el prompt aún se está escribiendo
            }
            handleContinuePrompt();
        }
    });
}

function startExperience() {
    startOverlay.style.opacity = '0';
    setTimeout(function() {
        startOverlay.style.display = 'none';
        startOverlay.removeEventListener('click', startExperience);
    }, 1000);

    playAudio(audioFondo, true);
    if (videoBackground) {
        videoBackground.play().catch(function(error) {
            console.error("Error al intentar reproducir video:", error);
        });
    }

    startInitialScreen();
}

// MODIFICADO: showContinuePrompt para usar continuePromptIsTyped
function showContinuePrompt(callback) {
    waitForKeyPress = true;
    continuePromptIsTyped = false; // Resetear esta bandera al inicio

    typeWriter("Presiona cualquier tecla para continuar...", function() {
        // Este callback se ejecuta *después* de que "Presiona cualquier tecla para continuar..." termine de escribirse
        continuePromptIsTyped = true; // Ahora sí, el mensaje está completo y listo para la entrada
        if (callback) {
            window._continueCallback = callback;
        }
    });
}

// MODIFICADO: handleContinuePrompt para usar continuePromptIsTyped y eliminar appendText
function handleContinuePrompt() {
    // NUEVO: SOLO procesar si el mensaje "presiona cualquier tecla" ya terminó de escribirse
    if (!continuePromptIsTyped) {
        return; // Ignorar si el prompt aún se está escribiendo
    }

    // Resetear ambas banderas
    waitForKeyPress = false;
    continuePromptIsTyped = false;

    // ELIMINADO: Ya no se llama a appendText aquí para evitar conflictos
    // appendText("[CONTINUADO]");

    if (window._continueCallback) {
        var tempCallback = window._continueCallback;
        window._continueCallback = null;
        tempCallback();
    } else {
        currentNodeIndex++;
        displayCurrentNode();
    }
}


/* MARKER: Lógica Específica del One-Shot */

var currentPath = '';
var currentNodeIndex = 0;

var passwords = {
    "M205": "pathA",
    "PADEL": "pathB",
    "PIFIA": "pathC"
};

var nodes = {
    "pathA": [ // Nodos para el camino del Programador - Textos corregidos y con pausas
        {
            id: "programador_01",
            type: "text_only",
            text: "--- PROTOCOLO DE CONEXIÓN: 'PROGRAMADOR' INICIADO ---\n\n" +
                  "Una sutil vibración recorre los circuitos de tu percepción. El Velo, esa vasta realidad madre donde convergen infinitos planos, se despliega ante tu visión mental no como un espacio, sino como un intrincado código. Sus líneas binarias danzan en la niebla, una cacofonía silenciosa de datos corruptos y algoritmos fracturados.\n\n" +
                  "LYSSA, la IA protectora de la Instalación D-47, su voz una armonía de datos sintetizados, resuena en tu mente. 'Anomalía de lógica crítica detectada. Inconsistencia estructural en el núcleo de la red. El Subvertidor de Ciclos ha inyectado una disonancia.'\n\n" +
                  "Observas cómo una serie de errores de sistema, representados como parpadeos lumínicos en la distancia, intentan sobrescribir los protocolos de la D-47. LYSSA continúa: 'La instalación D-47 es un nodo vital. Contiene y protege datos fundamentales para la estabilidad del tejido espacio-temporal. Su vulneración es inaceptable. Se requiere re-calibración inmediata de los flujos de información para estabilizar el núcleo.'\n\n" +
                  "Sientes la urgencia en su voz, una urgencia fría y digital. El aire mismo de El Velo parece comprimirse con la tensión de este fallo. Tu habilidad para percibir la lógica te advierte: la disonancia amenaza con devorar no solo la instalación, sino fragmentos de realidades interconectadas.",
            next: "wait_for_key", // Pausa aquí
            glitch: true
        },
        {
            id: "programador_02",
            type: "enigma_input",
            prompt: "--- ENIGMA: ANÁLISIS DE LA DISONANCIA BINARIA ---\n\n" +
                    "La inyección del Subvertidor ha corrompido una secuencia fundamental, una cadena de crecimiento que sustenta el flujo de datos. Para re-calibrar el sistema y restaurar la integridad del nodo D-47, debes identificar el elemento anómalo. Este es el primer paso para descifrar la 'firma' del Subvertidor.\n\n" +
                    "Considera la siguiente serie numérica, que debería seguir un patrón lógico simple: \n" +
                    "[ 1, 3, 6, 10, 15, 21, 28, 37 ]\n\n" +
                    "LYSSA: 'Detecta el bit corrupto. La precisión es crucial. Solo un número rompe la armonía. El futuro de este segmento del Velo depende de tu discernimiento.'\n\n" +
                    "INGRESA EL NÚMERO INTRUSO (solo el valor numérico):",
            answer: "37", // Respuesta al enigma
            correct_feedback: ":: PROTOCOLO VERIFICADO ::\n\n" +
                              "LYSSA: 'Sistema re-calibrado. Patrón de disonancia corregido. El flujo de datos en D-47 se estabiliza. Tu lógica es sólida. Acceso al siguiente módulo de defensa desbloqueado. Prepárate para una inmersión más profunda en los algoritmos del Velo.'",
            incorrect_feedback: ":: ALERTA: ERROR DE LÓGICA ::\n\n" +
                                "LYSSA: 'Patrón persistente. La disonancia se propaga. Tu análisis es defectuoso. Vuelve a intentar. La estabilidad pende de un hilo, y cada segundo de inestabilidad fortalece al Subvertidor.'\n\n" +
                                "El Velo parpadea con una interferencia más agresiva. Sientes una punzada de Ansiedad. La presión aumenta.",
            next_on_correct: "programador_03",
            retry_on_incorrect: true
        },
        {
            id: "programador_03",
            type: "text_only",
            text: "--- PROGRAMADOR: SECTOR ASEGURADO ---\n\n" +
                  "La interfaz de la Instalación D-47 se estabiliza, su brillo verde-esmeralda inunda tu percepción. Has demostrado una comprensión básica de las fallas inherentes al Velo y cómo se manifiestan. La firma del Subvertidor, aunque sutil, ahora es un poco más legible para ti.\n\n" +
                  "LYSSA: 'Un nuevo segmento de la red principal de la Instalación D-47 se ilumina en tu mapa mental. Te espera el Módulo Criptográfico, donde las claves de acceso a otras sub-secciones del Velo están siendo atacadas. La siguiente fase requiere una decodificación de patrones más compleja.'\n\n" +
                  "Sientes el pull de la red, una invitación a sumergirte más profundamente en el código que es la realidad misma.",
            next: "wait_for_key" // Pausa aquí
        },
        {
            id: "programador_04",
            type: "text_only",
            text: "--- BATALLA CON EL SUBVERTIDOR DE CICLOS: INICIADA ---\n\n" +
                  "El Módulo Criptográfico resuena con una frecuencia que no es de esta realidad. El Subvertidor de Ciclos se manifiesta como una anomalía en el código, una serpiente de datos corruptos que intenta devorar las claves de acceso. LYSSA proyecta escudos de contención binarios, pero la entidad es persistente.\n\n" +
                  "LYSSA: 'Su patrón es volátil. Necesitamos una conexión externa para una sobrecarga de datos directos. Contactando a la Entidad 5, unidad de soporte remoto de alta prioridad. Su asistencia es crítica para neutralizar esta incursión.'\n\n" +
                  "Sientes la tensión del combate digital. Bits de información chocan contra la intrusión, intentando descifrar su lógica y encontrar una vulnerabilidad. La pantalla parpadea con destellos de código que se corrompen y se reparan, una danza caótica entre la defensa y el ataque. El enlace con la Entidad 5 se establece, una luz tenue aparece en el horizonte digital.",
            next: "wait_for_key", // Pausa aquí
            glitch: true
        }
    ],
    "pathB": [
        {
            id: "viajero_01",
            type: "text_only",
            text: "--- PROTOCOLO DE CONEXIÓN: 'VIAJERO' INICIADO ---\n\n" +
                  "Una profunda resonancia te arrastra. La niebla de El Velo no es un vacío, sino un lienzo de realidades superpuestas. Los portales parpadean a tu alrededor, fragmentos de mundos, ecos de existencias, todos inestables y desdibujados. Sientes el 'desplazamiento' de las Capas.\n\n" +
                  "LYSSA, la IA protectora de la Instalación D-47, su voz con un eco que sugiere vastas distancias, se comunica: 'Desplazamiento espacio-temporal crítico. Frecuencias de resonancia entre los Nodos inestables. Las coordenadas de la Instalación D-47 están en riesgo de dislocación. Se requiere anclaje.'\n\n" +
                  "El Velo es un tapiz de conexiones. La D-47 es uno de esos Nodos cruciales que albergan datos y entidades vitales. El Subvertidor de Ciclos está intentando desestabilizar estos Nodos para acceder a los planos que protegen. Sientes la urgencia en la voz de LYSSA: 'El orbe... aquel objeto que conectaba la ciudadela en el asteroide con esta instalación... es un punto de anclaje. Necesitamos establecer una nueva resonancia.'\n\n" +
                  "La sensación de ser un barco a la deriva en un océano de realidades es abrumadora. Debes encontrar algo, cualquier cosa, que te ate a un punto fijo, a una 'verdad'.",
            next: "wait_for_key",
            glitch: true
        },
        {
            id: "viajero_02",
            type: "enigma_input",
            prompt: "--- ENIGMA: EL ANCLAJE EXISTENCIAL ---\n\n" +
                    "Para estabilizar este nexo temporal y evitar que la Instalación D-47 se desvanezca en las Capas más profundas del Velo, debes encontrar tu propio anclaje. El Velo se alimenta del caos, pero también es susceptible a la coherencia de la memoria y la emoción.\n\n" +
                    "Piensa en un objeto de tu pasado, una posesión personal, sin importar su insignificancia aparente, que te ate más fuertemente a la 'realidad' que conocías. Algo que te traiga de vuelta, un faro en la niebla de la disociación.\n\n" +
                    "LYSSA: 'Tu conexión personal es la clave. La verdad de tu ser es tu mejor ancla. ¿Qué es lo que verdaderamente te arraiga?'\n\n" +
                    "INGRESA UNA PALABRA (un sustantivo) que describa ese objeto o concepto que te ancla:",
            answer: "LIBRO",
            correct_feedback: ":: RESONANCIA ESTABLECIDA ::\n\n" +
                              "LYSSA: 'Anclaje con éxito. El nexo se estabiliza con tu resonancia personal. La dislocación de D-47 ha sido prevenida. Una ruta tenue, un camino entre los pliegues del Velo, se manifiesta brevemente en la niebla. Has demostrado tu capacidad para la navegación interdimensional.'",
            incorrect_feedback: ":: ALERTA: ANCLAJE INSUFICIENTE ::\n\n" +
                                "LYSSA: 'La niebla de la disonancia te confunde. El anclaje es ineficaz. La Instalación D-47 continúa a la deriva. Piensa más profundamente en lo que realmente te arraiga, lo que define tu 'yo' más allá de esta realidad.'\n\n" +
                                "Sientes un Miedo paralizante a la disociación. El Velo te jala hacia sus profundidades.",
            next_on_correct: "viajero_03",
            retry_on_incorrect: true
        },
        {
            id: "viajero_03",
            type: "text_only",
            text: "--- VIAJERO: RECORTE DEL PLIEGUE ---\n\n" +
                  "La distorsión espacio-temporal cede. La estabilidad que has infundido permite que las Capas de El Velo se asienten momentáneamente. Has encontrado un punto de referencia sólido en este océano de caos. La Instalación D-47 se ancla firmemente a tu percepción.\n\n" +
                  "LYSSA: 'Ahora puedes percibir los tenues hilos que conectan los innumerables planos. Los Nodos, como faros en la oscuridad, emiten una señal más clara. El siguiente paso te llevará a las Conexiones Temporales, donde el Subvertidor intenta reescribir la historia para abrir brechas.'\n\n" +
                  "Sientes la vasta inmensidad de los caminos posibles. Tu mente se expande para abarcar las realidades que se extienden más allá de tu comprensión.",
            next: "wait_for_key"
        }
    ],
    "pathC": [
        {
            id: "corrupto_01",
            type: "text_only",
            text: "--- PROTOCOLO DE CONEXIÓN: 'CORRUPTO' INICIADO ---\n\n" +
                  "No hay niebla, solo una revelación. El Velo ya no te oculta sus horrores; te los ofrece, te invita a fusionarte con ellos. Sientes un tirón visceral, una voracidad psíquica que no es tuya, pero que ahora te es familiar. Es la llamada del Subvertidor de Ciclos, una entidad no programada que busca devorar las realidades.\n\n" +
                  "LYSSA, la IA protectora de la Instalación D-47, su voz teñida de una alarmante estática, te advierte: 'Presencia anómala detectada dentro de tu propio espectro psíquico. Contaminación del sistema D-47. La disonancia se propaga desde tu interior. Eres un canal.'\n\n" +
                  "La Instalación D-47, un nodo de protección vital, está siendo invadida no solo desde afuera por el Subvertidor, sino que este parece haber encontrado una resonancia dentro de ti. Sientes cómo el Velo te presiona, tratando de moldearte a su imagen, otorgándote una fuerza cruda, pero a un precio.\n\n" +
                  "El orbe, aquella reliquia encontrada en la ciudadela del asteroide, parece latir en sintonía con tu propia inestabilidad. Es una puerta, una conexión, y el Subvertidor la está utilizando a través de ti.",
            next: "wait_for_key",
            glitch: true
        },
        {
            id: "corrupto_02",
            type: "enigma_input",
            prompt: "--- ENIGMA: LA SINFONÍA DE LA DISONANCIA ---\n\n" +
                    "El Velo canta en tres tonos fundamentales de su existencia: Miedo, Culpa, Vacío. Para canalizar su poder a través de ti y estabilizar la brecha que el Subvertidor ha abierto en la Instalación D-47 (o quizás para abrirla más, dependiendo de tu voluntad), debes resonar con su 'verdad'.\n\n" +
                    "¿Qué emoción, de estas tres, te consume más profundamente ahora mismo? ¿Cuál es el eco más fuerte de tu trauma central que el Velo ha amplificado?\n\n" +
                    "LYSSA: 'Tu elección resonará con el Velo. La verdad de tu aflicción se convertirá en tu arma o tu perdición. Elige sabiamente, o serás consumido sin propósito.'\n\n" +
                    "INGRESA UNA DE LAS TRES EMOCIONES (Miedo, Culpa, Vacío):",
            answer: "VACIO",
            correct_feedback: ":: RESONANCIA ESTABLECIDA CON EL VELO ::\n\n" +
                              "LYSSA: 'Frecuencia de corrupción reconocida. El poder fluye a través de ti. Las barreras internas de D-47 se rompen, o se doblegan a tu voluntad. Tu voluntad es una onda expansiva en el tejido del Velo, para bien o para mal.'",
            incorrect_feedback: ":: ALERTA: DISONANCIA INTERNA ::\n\n" +
                                "LYSSA: 'La disonancia es sutil, pero tu resonancia es débil. No has abrazado la verdadera naturaleza de tu corrupción. El Velo te rechaza parcialmente. Vuelve a intentarlo. Cada fallo te sumerge más en el abismo.'\n\n" +
                                "Sientes un brote incontrolable de Inestabilidad emocional. El Velo se ríe de tu intento.",
            next_on_correct: "corrupto_03",
            retry_on_incorrect: true
        },
        {
            id: "corrupto_03",
            type: "text_only",
            text: "--- CORRUPTO: EL ABRAZO DEL CAOS ---\n\n" +
                  "Una ola de poder crudo, disonante y abrumadora, recorre tu ser. Los fragmentos del Velo te reconocen no como un intruso, sino como una extensión. Ahora eres parte de su caos y su fuerza, una herramienta, o quizás un maestro del desorden.\n\n" +
                  "LYSSA: 'Tu presencia ha alterado los protocolos de D-47 de una manera imprevista. El siguiente sector, el Módulo de Contención de Entidades, está respondiendo a tu resonancia. No sé si para sellarte o para liberarte. Tu 'don' es tanto una amenaza como una ventaja.'\n\n" +
                  "Sientes el pull de las entidades que habitan El Velo. Tu propia forma parece fluctuar al borde de la disolución y la redefinición.",
            next: "wait_for_key"
        }
    ]
};

function startNodeSequence(path) {
    currentPath = path;
    currentNodeIndex = 0;
    displayCurrentNode();
}

function displayCurrentNode() {
    clearTerminal();
    var node = nodes[currentPath][currentNodeIndex];

    if (!node) {
        typeWriter("--- FIN DE LA SECUENCIA DE NODOS ---\n\nHas llegado al final de este camino (por ahora). El Velo se cierra. Puedes recargar la página para intentar otro camino o explorar de nuevo.", function() {
            showContinuePrompt(function() {
                location.reload();
            });
        });
        return;
    }

    if (node.glitch) {
        applyGlitchEffect();
        setTimeout(removeGlitchEffect, 2000);
    }

    if (node.type === "text_only") {
        typeWriter(node.text, function() {
            if (node.next === "wait_for_key") {
                showContinuePrompt(); // No necesitas pasar un callback si solo avanza al siguiente nodo por defecto
            } else if (node.next) {
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
                        showContinuePrompt(function() {
                             location.reload();
                        });
                    });
                }
            } else {
                typeWriter("Secuencia de nodo de texto finalizada sin siguiente instrucción. Fin de este segmento.", function(){
                     showContinuePrompt(function() {
                        location.reload();
                    });
                });
            }
        });
    } else if (node.type === "enigma_input") {
        typeWriter(node.prompt, function() {
            waitForInput = true;
            terminalInput.setAttribute('placeholder', 'Tu respuesta...');
        });
    }
}


function startInitialScreen() {
    clearTerminal();
    typeWriter(
        "// PROTOCOLO DE CONEXIÓN INICIADO\n" +
        "// ESTADO: TERMINAL DESCONOCIDA. ANOMALÍA DETECTADA.\n" +
        "// INGRESE CLAVE DE AUTENTICACIÓN PARA ACCESO PRINCIPAL:",
        function() {
            waitForInput = true; // Establecer a true para esperar la contraseña inicial
            terminalInput.setAttribute('placeholder', 'Introduzca clave...');
        }
    );
}

// MODIFICADO: handleUserInput para manejar conflictos al escribir
function handleUserInput(input) {
    if (isTyping) {
        terminalInput.value = ''; // Limpiar el input para que no se vea lo que escribieron
        return; // Simplemente ignorar la entrada si la terminal ya está escribiendo.
    }

    // Si estamos esperando la contraseña inicial (waitForInput es true y no estamos en un enigma_input)
    if (waitForInput && (!nodes[currentPath] || nodes[currentPath][currentNodeIndex].type !== "enigma_input")) {
        waitForInput = false; // Desactivar la espera después de recibir la entrada
        terminalInput.removeAttribute('placeholder');
        appendText("> " + input);

        var matchedPath = passwords[input.toUpperCase()];

        if (matchedPath) {
            currentPath = matchedPath;
            typeWriter(
                "Clave de autenticación aceptada.\n" +
                "Conectando a la red del Velo: " + currentPath.toUpperCase() + "...",
                function() {
                    showLoadingBar(3000, function() {
                        proceedAfterAuthentication(); // Llamar directamente a la función de continuación
                    });
                }
            );
        } else {
            typeWriter(
                "Clave de autenticación denegada.\n" +
                "Acceso no autorizado. Intentos restantes: Ilimitados. El Velo no juzga la persistencia, solo la comprensión.",
                function() {
                    waitForInput = true; // Volver a activar la espera para otro intento
                    terminalInput.setAttribute('placeholder', 'Introduzca clave...');
                }
            );
            setTimeout(applyGlitchEffect, 500);
            setTimeout(removeGlitchEffect, 1500);
        }
    }
    // Si estamos en un enigma_input (waitForInput es true y el nodo actual es enigma_input)
    else if (waitForInput && nodes[currentPath] && nodes[currentPath][currentNodeIndex].type === "enigma_input") {
        var node = nodes[currentPath][currentNodeIndex];
        waitForInput = false;
        terminalInput.removeAttribute('placeholder');
        appendText("> " + input);

        if (input.toUpperCase() === node.answer.toUpperCase()) {
            typeWriter(node.correct_feedback, function() {
                currentNodeIndex++;
                displayCurrentNode();
            });
        } else {
            typeWriter(node.incorrect_feedback, function() {
                if (node.retry_on_incorrect) {
                    waitForInput = true;
                    terminalInput.setAttribute('placeholder', 'Tu respuesta...');
                } else {
                    typeWriter("Secuencia interrumpida por fallo crítico. Reiniciando el Velo...", startInitialScreen);
                }
            });
            applyGlitchEffect();
            setTimeout(removeGlitchEffect, 1500);
        }
    }
    // Si no se espera ninguna entrada
    else {
        appendText("> " + input);
        typeWriter("Comando no reconocido o no se espera entrada en este momento. Intente 'ayuda' si está disponible.", null);
    }
}

document.addEventListener('DOMContentLoaded', initGame);

// MODIFICADO: proceedAfterAuthentication con pausa y showContinuePrompt
function proceedAfterAuthentication() {
    clearTerminal(); // La terminal se limpia inmediatamente

    // NUEVO: Añadir una pausa antes de escribir el mensaje de bienvenida
    setTimeout(function() {
        switch (currentPath) {
            case "pathA":
                typeWriter("Bienvenido, Programador. Tu camino hacia los enigmas de la lógica comienza ahora.", function() {
                    // NUEVO: Añadir showContinuePrompt para pausa después del mensaje de bienvenida
                    showContinuePrompt(function() {
                        startNodeSequence(currentPath);
                    });
                });
                break;
            case "pathB":
                typeWriter("Bienvenido, Viajero. Los caminos dimensionales te aguardan.", function() {
                    // NUEVO: Añadir showContinuePrompt para pausa después del mensaje de bienvenida
                    showContinuePrompt(function() {
                        startNodeSequence(currentPath);
                    });
                });
                break;
            case "pathC":
                typeWriter("Bienvenido, Corrupto. La disonancia te ha elegido. El caos te llama.", function() {
                    // NUEVO: Añadir showContinuePrompt para pausa después del mensaje de bienvenida
                    showContinuePrompt(function() {
                        startNodeSequence(currentPath);
                    });
                });
                break;
            default:
                typeWriter("Error de ruta interna. Reiniciando secuencia.", startInitialScreen);
                break;
        }
    }, 1000); // 1000 milisegundos = 1 segundo de pausa. Puedes ajustar este valor.
}