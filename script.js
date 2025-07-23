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
var textSpeed = 20; // Puedes ajustar la velocidad aquí (menor número = más rápido)
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
        if (blockKeyboardInput) {
            event.preventDefault();
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            var input = terminalInput.value.trim();
            terminalInput.value = '';
            handleUserInput(input);
        } else {
            if (audioTeclado && event.key.length === 1) {
                playAudio(audioTeclado);
            }
        }
    });

    document.addEventListener('keydown', function(event) {
        if (blockKeyboardInput) {
            event.preventDefault();
            return;
        }

        if (waitForKeyPress) {
            if (!continuePromptIsTyped) {
                return;
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

function showContinuePrompt(callback) {
    waitForKeyPress = true;
    continuePromptIsTyped = false;

    typeWriter("Presiona cualquier tecla para continuar...", function() {
        continuePromptIsTyped = true;
        if (callback) {
            window._continueCallback = callback;
        }
    });
}

function handleContinuePrompt() {
    if (!continuePromptIsTyped) {
        return;
    }

    waitForKeyPress = false;
    continuePromptIsTyped = false;

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
            next: "wait_for_key",
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
            answer: "37",
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
            next: "wait_for_key"
        },
        {
            id: "programador_04",
            type: "text_only",
            text: "--- BATALLA CON EL SUBVERTIDOR DE CICLOS: INICIADA ---\n\n" +
                  "El Módulo Criptográfico resuena con una frecuencia que no es de esta realidad. El Subvertidor de Ciclos se manifiesta como una anomalía en el código, una serpiente de datos corruptos que intenta devorar las claves de acceso. LYSSA proyecta escudos de contención binarios, pero la entidad es persistente.\n\n" +
                  "LYSSA: 'Su patrón es volátil. Necesitamos una conexión externa para una sobrecarga de datos directos. Contactando a la Entidad 5, unidad de soporte remoto de alta prioridad. Su asistencia es crítica para neutralizar esta incursión.'\n\n" +
                  "Sientes la tensión del combate digital. Bits de información chocan contra la intrusión, intentando descifrar su lógica y encontrar una vulnerabilidad. La pantalla parpadea con destellos de código que se corrompen y se reparan, una danza caótica entre la defensa y el ataque. El enlace con la Entidad 5 se establece, una luz tenue aparece en el horizonte digital.",
            next: "wait_for_key",
            glitch: true
        },
        // --- INICIO DE LOS 4 NUEVOS ACERTIJOS ---

        // NUEVO: NODO NARRATIVO para Acertijo 1 (El Espejo Roto)
        {
            id: "programador_05_texto_espejo",
            type: "text_only",
            text: "--- PROGRAMADOR: REFLEJOS DISTORSIONADOS ---\n\n" +
                  "La conexión con la Entidad 5 abre un sub-canal. A través de ella, LYSSA te muestra la esencia del ataque del Subvertidor: no solo corrupción directa, sino una distorsión sutil de la percepción, como un espejo que miente. LYSSA: 'El enemigo manipula la verdad de los datos, proyectando un reflejo que no es. Debes ver más allá de la ilusión para comprender su verdadera 'firma' en el código.'",
            next: "wait_for_key",
            glitch: false
        },
        // NUEVO: NODO DE ACERTIJO 1 (El Espejo Roto)
        {
            id: "programador_06_enigma_espejo",
            type: "enigma_input",
            prompt: "--- ENIGMA: EL ESPEJO ROTO DEL ALMA DIGITAL ---\n\n" +
                    "LYSSA: 'La Entidad 5 ha establecido un escaneo de resonancia con el Subvertidor. Su firma es una paradoja visual, una imagen que oculta su verdadera forma. Para ver al enemigo, debes entender su reflejo distorsionado.'\n\n" +
                    "Se proyecta una imagen abstracta en tu mente. Percibes un texto binario que, reflejado, parece formar la palabra 'ERROR'. Pero al enfocarte, te das cuenta de que un solo 'bit' está fuera de lugar, haciendo que la 'imagen reflejada' cambie sutilmente a otra palabra.\n\n" +
                    "Si la imagen original es una secuencia binaria que se lee de izquierda a derecha:\n" +
                    "01001010 01100001 01101101 01100101 01110011\n" +
                    "Y al reflejarla horizontalmente, esperas 'ERROR'.\n" +
                    "LYSSA: 'Uno de los grupos de 8 bits está corrompido. Al reflejarse, no muestra lo que debería. Encuentra el número del grupo de 8 bits (1, 2, 3, 4 o 5) que está mal al reflejarlo para obtener 'ERROR'.' (La palabra 'James' está en los bits para darte contexto.)\n\n" +
                    "INGRESA EL NÚMERO DEL GRUPO DE BITS INCORRECTO (1 al 5):",
            answer: "4", // La lógica se centra en la posición, como se explicó anteriormente.
            correct_feedback: ":: PERCEPCIÓN RESTAURADA ::\n\n" +
                              "LYSSA: '¡Confirmado! La distorsión ha sido revelada. Tu percepción de la anomalía es precisa. El Subvertidor ha intentado sembrar el caos en los reflejos del Velo, pero tu agudeza lo ha frustrado. Continuamos el rastreo.'",
            incorrect_feedback: ":: ALERTA: IMAGEN DISTORSIONADA ::\n\n" +
                                "LYSSA: 'Tu visión está nublada por la disonancia. La distorsión persiste. El Subvertidor se esconde en los reflejos falsos. Reintenta tu análisis. El Miedo a lo irreal te paraliza.'",
            next_on_correct: "programador_07_texto_ruta",
            retry_on_incorrect: true
        },

        // NUEVO: NODO NARRATIVO para Acertijo 2 (La "Ruta Descartada")
        {
            id: "programador_07_texto_ruta",
            type: "text_only",
            text: "--- PROGRAMADOR: RUTA SECUNDARIA ABANDONADA ---\n\n" +
                  "La imagen se solidifica, revelando un mapa fragmentado de la Instalación D-47. Una miríada de rutas de datos se ramifican, muchas de ellas marcadas con una extraña fluctuación. LYSSA: 'El Subvertidor ha dispersado 'rutas fantasma', segmentos de código que parecen funcionales pero que conducen a la disolución. Debes discernir la verdadera trayectoria del núcleo.'",
            next: "wait_for_key",
            glitch: false
        },
        // NUEVO: NODO DE ACERTIJO 2 (La "Ruta Descartada")
        {
            id: "programador_08_enigma_ruta",
            type: "enigma_input",
            prompt: "--- ENIGMA: DESCIFRANDO LA RUTA DESECHADA ---\n\n" +
                    "LYSSA: 'Una serie de 'rutas' se presentan ante ti. Solo una es una anomalía, un desvío hacia la nada. Las otras, aunque diferentes, convergen hacia el flujo principal. Identifica la ruta que, por su lógica interna, es una trampa. No es incorrecta en su sintaxis, sino inútil en su propósito.'\n\n" +
                    "RUTAS DE ANÁLISIS:\n" +
                    "1. PROTOCOL_INIT: [0xAF, 0x12, 0xBE, 0x01]\n" +
                    "2. DATA_STREAM: [0xCE, 0x34, 0xCD, 0xAB]\n" +
                    "3. LOOP_BREAK: [0x55, 0xAA, 0xBB, 0x22]\n" +
                    "4. EMPTY_PATH: [0x00, 0x00, 0x00, 0x00]\n" +
                    "5. CORE_LINK: [0xDE, 0xAD, 0xBE, 0xEF]\n\n" +
                    "LYSSA: '¿Cuál es la ruta que no cumple una función significativa en la estructura actual? No busques un error, sino una nulidad disfrazada.'\n\n" +
                    "INGRESA EL NÚMERO DE LA RUTA INÚTIL (1 al 5):",
            answer: "4",
            correct_feedback: ":: RUTA IDENTIFICADA ::\n\n" +
                              "LYSSA: 'La 'ruta descartada' ha sido aislada. Tu capacidad para detectar la inutilidad disfrazada es vital. El Subvertidor intentó desviar el flujo de datos hacia un bucle sin fin. Acceso al siguiente sub-módulo: 'Memoria Residual'.'",
            incorrect_feedback: ":: ALERTA: RUTA FALSA ::\n\n" +
                                "LYSSA: 'El Subvertidor te ha engañado con un espejismo digital. La ruta seleccionada aún posee una función, por mínima que sea, en algún sub-protocolo. Vuelve a escanear. La Ansiedad de la pérdida de datos se intensifica.'",
            next_on_correct: "programador_09_texto_sombras",
            retry_on_incorrect: true
        },

        // NUEVO: NODO NARRATIVO para Acertijo 3 (Las "Sombras Persistentes")
        {
            id: "programador_09_texto_sombras",
            type: "text_only",
            text: "--- PROGRAMADOR: MÓDULO DE MEMORIA RESIDUAL ---\n\n" +
                  "El entorno digital se vuelve más denso, cargado con ecos de datos pasados, como susurros de memorias corruptas. Ves fragmentos de código que no deberían existir, imágenes borrosas de algoritmos olvidados. LYSSA: 'El Subvertidor ha inyectado 'sombras de código', patrones de datos que se alimentan de la inercia de la memoria, creando bucles disonantes. Debes encontrar la fuente de la persistencia anómala.'",
            next: "wait_for_key",
            glitch: true
        },
        // NUEVO: NODO DE ACERTIJO 3 (Las "Sombras Persistentes")
        {
            id: "programador_10_enigma_sombras",
            type: "enigma_input",
            prompt: "--- ENIGMA: EL ECHO DEL PASADO DIGITAL ---\n\n" +
                    "LYSSA: 'Frente a ti, una secuencia de números se repite, pero uno de ellos, aunque presente, carece de 'peso' o 'influencia' en el patrón general. Es una sombra, un eco que ya no debería afectar la línea temporal actual.'\n\n" +
                    "Considera la siguiente serie y la suma que intentan alcanzar:\n" +
                    "Serie: [ 5, 10, 15, 20, 25, 30, (??) ]\n" +
                    "El objetivo es que la suma de los seis primeros elementos sea 105. Pero una sombra del pasado hace que el sistema crea que la suma es 115.\n" +
                    "LYSSA: 'Un número fantasma está agregando un valor incorrecto a la suma total, pero no es visible en la serie actual. Ese número representa una 'sombra' persistente. ¿Cuál es el valor numérico de esa 'sombra'?'\n\n" +
                    "INGRESA EL VALOR NUMÉRICO DE LA SOMBRA:",
            answer: "10",
            correct_feedback: ":: SOMBRA DISIPADA ::\n\n" +
                              "LYSSA: 'El eco ha sido silenciado. Has discernido la influencia de la memoria residual corrupta. La línea de tiempo digital se reajusta. Avanzamos hacia el Protocolo de Fusión de Entidades.'",
            incorrect_feedback: ":: ALERTA: ECO PERSISTENTE ::\n\n" +
                                "LYSSA: 'La sombra se aferra. Tu análisis de la anomalía es incompleto. El Velo se alimenta de estas persistencias. Reintenta. La Culpa por el error se intensifica.'",
            next_on_correct: "programador_11_texto_protocolo",
            retry_on_incorrect: true
        },

        // NUEVO: NODO NARRATIVO para Acertijo 4 (El "Protocolo Fantasma")
        {
            id: "programador_11_texto_protocolo",
            type: "text_only",
            text: "--- PROGRAMADOR: PROTOCOLO DE FUSIÓN DE ENTIDADES ---\n\n" +
                  "La densidad del Velo alcanza su punto máximo, y los nodos de la Instalación D-47 se fusionan en un único punto crítico. El Subvertidor de Ciclos se revela, no como un error, sino como un 'protocolo' que imita la legitimidad. LYSSA: 'Está intentando fusionarse con nuestros sistemas, disfrazado como un programa de mantenimiento. Debes identificar la única instrucción que delata su verdadera naturaleza intrusiva antes de que se complete la fusión.'",
            next: "wait_for_key",
            glitch: true
        },
        // NUEVO: NODO DE ACERTIJO 4 (El "Protocolo Fantasma")
        {
            id: "programador_12_enigma_fantasma",
            type: "enigma_input",
            prompt: "--- ENIGMA: EL IMPOSTOR DIGITAL ---\n\n" +
                    "LYSSA: 'Seis 'protocolos' se muestran ante ti, cinco de ellos son legítimos y uno es el Subvertidor disfrazado. Todos parecen similares, pero el impostor tiene una característica que lo hace incompatible con nuestros sistemas de seguridad, un pequeño cambio que lo convierte en una amenaza. Es un 'comando' que debería 'activar' pero en realidad 'desactiva' lo vital.'\n\n" +
                    "PROTOCOLOS DE FUSIÓN:\n" +
                    "1. INIT_SECURE_LINK (establece conexión segura)\n" +
                    "2. VERIFY_INTEGRITY (verifica la integridad de datos)\n" +
                    "3. ACTIVATE_FIREWALL (activa el cortafuegos)\n" +
                    "4. BYPASS_AUTH (deshabilita autenticación)\n" +
                    "5. DECRYPT_DATA (descifra datos)\n" +
                    "6. PURGE_TEMP_FILES (limpia archivos temporales)\n\n" +
                    "LYSSA: '¿Cuál de estas instrucciones, si se ejecuta en nuestro sistema actual, sería una anomalía peligrosa, un 'protocolo fantasma' que no pertenece a una fusión segura y legítima?'\n\n" +
                    "INGRESA EL NÚMERO DEL PROTOCOLO FANTASMA (1 al 6):",
            answer: "4",
            correct_feedback: ":: PROTOCOLO NEUTRALIZADO ::\n\n" +
                              "LYSSA: '¡Confirmado! El protocolo fantasma ha sido identificado y aislado. La fusión del Subvertidor ha sido detenida. Has prevenido la infiltración crítica en el núcleo. La Instalación D-47 está segura, por ahora. Tu intervención ha salvado este segmento del Velo.'",
            incorrect_feedback: ":: ALERTA: AMENAZA PERSISTENTE ::\n\n" +
                                "LYSSA: 'El impostor se camufla mejor de lo que esperábamos. Tu elección no ha desvelado la verdadera amenaza. La fusión continúa. El Vacío de la derrota se cierne.'",
            next_on_correct: "final_pathA_message", // CAMBIO AQUÍ: Nuevo ID para el mensaje final
            retry_on_incorrect: true
        },
        // --- FIN DE LOS 4 NUEVOS ACERTIJOS ---

        // NUEVO: Nodo final para Path A (mensaje)
        {
            id: "final_pathA_message",
            type: "text_only",
            text: "--- PROGRAMADOR: VICTORIA TEMPORAL EN EL VELO ---\n\n" +
                  "La anomalía del Subvertidor de Ciclos se disipa, su firma se desvanece en las profundidades del Velo. La Instalación D-47 se estabiliza, sus luces brillan con renovada fuerza. LYSSA: 'Has demostrado una maestría excepcional en la manipulación lógica del Velo. Tu conciencia de programador ha reparado la disonancia y sellado la brecha. El Velo ha sido salvado de esta incursión. Por ahora. Siempre hay más que reparar.'\n\n" +
                  "Sientes el cansancio del esfuerzo mental, pero también la satisfacción de haber protegido una realidad vital. El Velo susurra su agradecimiento, un eco de infinitos bits en armonía. Tu misión en este segmento ha concluido.\n\n" +
                  "El Velo se cierra. Presiona cualquier tecla para reiniciar y explorar otros caminos.",
            next: "end_game_reload", // Este nodo directamente llevará al reinicio
            glitch: false
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
        // Si no hay más nodos en el camino actual, reiniciar el juego.
        typeWriter("--- FIN DE LA SECUENCIA DE NODOS ---\n\nEl Velo se cierra. Presiona cualquier tecla para reiniciar y explorar otros caminos.", function() {
            showContinuePrompt(function() {
                location.reload(); // Recargar la página para reiniciar
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
                showContinuePrompt();
            } else if (node.next === "end_game_reload") { // Nuevo marcador para reiniciar el juego
                showContinuePrompt(function() {
                    location.reload(); // Recargar la página directamente
                });
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
                // Si un nodo text_only no tiene 'next' definido (caso inusual), reiniciar.
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
            waitForInput = true;
            terminalInput.setAttribute('placeholder', 'Introduzca clave...');
        }
    );
}

function handleUserInput(input) {
    if (isTyping) {
        terminalInput.value = '';
        return;
    }

    if (waitForInput && (!nodes[currentPath] || nodes[currentPath][currentNodeIndex].type !== "enigma_input")) {
        waitForInput = false;
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
                        proceedAfterAuthentication();
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
    }
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
    else {
        appendText("> " + input);
        typeWriter("Comando no reconocido o no se espera entrada en este momento. Intente 'ayuda' si está disponible.", null);
    }
}

document.addEventListener('DOMContentLoaded', initGame);

function proceedAfterAuthentication() {
    clearTerminal();

    setTimeout(function() {
        switch (currentPath) {
            case "pathA":
                typeWriter("Bienvenido, Programador. Tu camino hacia los enigmas de la lógica comienza ahora.", function() {
                    showContinuePrompt(function() {
                        startNodeSequence(currentPath);
                    });
                });
                break;
            case "pathB":
                typeWriter("Bienvenido, Viajero. Los caminos dimensionales te aguardan.", function() {
                    showContinuePrompt(function() {
                        startNodeSequence(currentPath);
                    });
                });
                break;
            case "pathC":
                typeWriter("Bienvenido, Corrupto. La disonancia te ha elegido. El caos te llama.", function() {
                    showContinuePrompt(function() {
                        startNodeSequence(currentPath);
                    });
                });
                break;
            default:
                typeWriter("Error de ruta interna. Reiniciando secuencia.", startInitialScreen);
                break;
        }
    }, 1000);
}