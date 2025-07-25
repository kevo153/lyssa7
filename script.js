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
var textSpeed = 10;
var isTyping = false;
var waitForInput = false;
var waitForKeyPress = false;
var continuePromptIsTyped = false;
var blockKeyboardInput = false;

var subvertidorPower = 0;
const SUBVERTIDOR_MAX_POWER = 3; // Mantener para referencia, aunque el path del programador ya no lo usa directamente para "perder"

var globalFailureCount = 0;
const MAX_GLOBAL_FAILURES = 5;

// Claves para localStorage
const GAME_FAILED_MAX_ATTEMPTS_KEY = "game_failed_max_attempts";
const PATH_A_COMPLETED_KEY = "pathA_completed";
const PATH_B_COMPLETED_KEY = "pathB_completed";
const PATH_C_COMPLETED_KEY = "pathC_completed";
const INITIAL_ACCESS_DONE_KEY = "initial_access_done"; // Para el mensaje inicial al recargar

/* MARKER: Funciones de Utilidad de la Terminal */

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
    terminalOutput.innerHTML = '';
    let i = 0;
    const speed = textSpeed;

    function type() {
        if (i < currentOutputText.length) {
            if (!blockKeyboardInput) { // Solo si no estamos bloqueando la entrada (para no interrumpir typing)
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
}

function removeGlitchEffect() {
    terminalContainer.classList.remove('glitch');
    stopAudio(audioGlitch);
}

function showLoadingBar(duration, callback) {
    clearTerminal();
    appendText("Cargando...");
    let progress = 0;
    const intervalTime = duration / 10; // 10 ticks for the bar
    let bar = "----------"; // 10 dashes

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

/* MARKER: Lógica del Juego - Inicio */

function initGame() {
    terminalOutput = document.getElementById('terminal-output');
    terminalInput = document.getElementById('terminal-input');
    terminalInputArea = document.getElementById('terminal-input-area');
    terminalContainer = document.getElementById('terminal-container');
    audioTeclado = document.getElementById('audio-teclado');
    audioGlitch = document.getElementById('audio-glitch');
    audioFondo = document.getElementById('audio-fondo');
    videoBackground = document.getElementById('background-video'); // Asegúrate de que este ID exista en tu HTML
    startOverlay = document.getElementById('start-overlay');
    failureCountDisplay = document.getElementById('failure-count');
    failureDisplayElement = document.getElementById('failure-display'); // Asigna el elemento aquí

    // Inicializar el contador de fallos global desde localStorage
    globalFailureCount = parseInt(localStorage.getItem('globalFailureCount') || '0', 10);
    updateFailureDisplay();

    // Event Listeners
    terminalInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita que se agregue una nueva línea en algunos casos
            if (!isTyping && waitForInput) {
                const input = terminalInput.value.trim();
                terminalInput.value = '';
                handleUserInput(input);
            } else if (waitForKeyPress) {
                handleContinuePrompt();
            }
        }
    });

    // Control para el overlay de inicio
    if (startOverlay) {
        startOverlay.addEventListener('click', startExperience);
        startOverlay.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { // También permite iniciar con Enter o Espacio
                e.preventDefault();
                startExperience();
            }
        });
        startOverlay.focus(); // Asegúrate de que el overlay tenga foco para capturar keypress
    }

    // Listener para el botón de Reiniciar Juego
    document.getElementById('reset-game-button').addEventListener('click', function() {
        localStorage.clear(); // Limpia todos los datos guardados
        location.reload(); // Recarga la página
    });

    // Reproducir audio de fondo al inicio (puede requerir interacción del usuario en algunos navegadores)
    document.body.addEventListener('click', function() {
        if (audioFondo.paused) {
            audioFondo.play().catch(e => console.error("Error al reproducir audio de fondo:", e));
        }
    }, { once: true });
}


function startExperience() {
    if (startOverlay) {
        startOverlay.style.opacity = '0';
        setTimeout(() => {
            startOverlay.style.display = 'none';
        }, 1000); // Espera la transición
    }
    playAudio(audioFondo); // Asegura que el audio de fondo se reproduzca

    // Si ya se accedió al juego antes y no se reseteó, y se completó un path
    const pathACompleted = localStorage.getItem(PATH_A_COMPLETED_KEY) === "true";
    const pathBCompleted = localStorage.getItem(PATH_B_COMPLETED_KEY) === "true";
    const pathCCompleted = localStorage.getItem(PATH_C_COMPLETED_KEY) === "true";
    const initialAccessDone = localStorage.getItem(INITIAL_ACCESS_DONE_KEY) === "true";

    // Si ya completó alguno y es un acceso "recurrente" (no la primera vez), lleva a la biblioteca
    if ((pathACompleted || pathBCompleted || pathCCompleted) && initialAccessDone) {
        // Asegurarse de mostrar el contador de fallos si se vuelve a cargar y ya hay un path completado
        if (failureDisplayElement) {
            failureDisplayElement.style.display = 'block';
        }
        typeWriter("LYSSA: 'Bienvenido de nuevo. Acceso a la Biblioteca de Ecos activado. Ingresa un protocolo de acceso para continuar, o 'BIBLIOTECA' para explorar los archivos.'", function() {
            waitForInput = true;
            terminalInput.setAttribute('placeholder', 'Introduzca clave...');
        });
        currentPath = "initial_access"; // Establecer un path inicial de "entrada"
        currentNodeIndex = 0;
    } else {
        // Primera vez o no ha completado ningún path
        localStorage.setItem(INITIAL_ACCESS_DONE_KEY, "true");
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
        currentPath = "initial_access";
        currentNodeIndex = 0;
    }
    terminalInput.focus();
}

function showContinuePrompt(callback) {
    waitForKeyPress = true;
    continuePromptIsTyped = true;
    appendText("\n\nPresiona cualquier tecla para continuar...");
    if (callback) {
        // Envuelve el callback para asegurar que se ejecute solo una vez
        const originalCallback = callback;
        callback = () => {
            originalCallback();
            waitForKeyPress = false; // Resetear después de la ejecución
            continuePromptIsTyped = false;
        };
    }
}

function handleContinuePrompt() {
    waitForKeyPress = false;
    continuePromptIsTyped = false;
    // Lógica para manejar el "Presiona cualquier tecla para continuar"
    // Si estamos en un nodo de la biblioteca y se espera volver al menú principal
    if (currentPath === "library" && nodes.library[currentNodeIndex].next === "wait_for_key_library") {
        currentPath = "library";
        currentNodeIndex = 0; // Volver al índice del menú principal de la biblioteca
        displayCurrentNode();
    } else {
        currentNodeIndex++;
        displayCurrentNode();
    }
}


function displayFailedConnectionScreen() {
    clearTerminal();
    applyGlitchEffect();
    typeWriter(
        "--- FALLO CRÍTICO: CONEXIÓN PERDIDA CON EL VELO ---\n\n" +
        "La disonancia ha consumido este segmento. Tu mente se disocia del Velo, arrastrada de vuelta a una realidad fragmentada. La conexión se ha roto.\n\n" +
        "Has alcanzado el límite de fallos globales. La Instalación D-47 se desconecta de tu frecuencia.\n\n" +
        "LYSSA: 'Acceso denegado. La realidad se resetea. Tu intervención ha concluido.'\n\n" +
        "// Reiniciando la simulación. Presiona cualquier tecla para intentar de nuevo...",
        function() {
            showContinuePrompt(function() {
                localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                localStorage.setItem('globalFailureCount', '0'); // Reiniciar globalFailureCount
                updateFailureDisplay();
                location.reload();
            });
        }
    );
}

/* MARKER: Lógica Específica del One-Shot */

var currentPath = ''; // 'pathA', 'pathB', 'pathC', 'library'
var currentNodeIndex = 0;

var passwords = {
    "M205": "pathA", // Programador
    "PADEL": "pathB", // Viajero
    "PIFIA": "pathC", // Corrupto
    "BIBLIOTECA": "library" // Acceso directo a la biblioteca si está disponible
};

// **AQUÍ ES DONDE SE CARGAN LOS NODOS DE LA BIBLIOTECA EXTERNALMENTE**
// Asegúrate de que LIBRARY_NODES esté definido en libraryNodes.js
// ANTES de que este script se cargue.
var nodes = {
    "pathA": [ // Nodos para el camino del Programador
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
            next: "programador_04_5_texto_fracturado",
            glitch: true
        },
        // --- INICIO DE LOS 5 ACERTIJOS ---
        {
            id: "programador_04_5_texto_fracturado",
            type: "text_only",
            text: "--- PROGRAMADOR: INTERFERENCIA EN LA SINAPSIS ---\n\n" +
                    "Una nueva ola de disonancia golpea el Módulo Criptográfico, manifestándose como un fragmento de código que se niega a ensamblarse correctamente. LYSSA: 'El Subvertidor ha inyectado una sintaxis rota, una directiva que paraliza los enlaces neuronales del Velo. Debes encontrar el 'comando' correcto que complete el fragmento y restaure el flujo de datos cruciales.'",
            next: "wait_for_key",
            glitch: true
        },
        {
            id: "programador_04_6_enigma_fracturado",
            type: "enigma_input",
            prompt: "--- ENIGMA: EL CÓDIGO FRACTURADO ---\n\n" +
                    "LYSSA: 'Un segmento vital de código ha sido corrompido, dejando una brecha en su lógica. Para reparar la sinapsis y avanzar, debes encontrar la palabra clave correcta que complete la secuencia de programación. Piensa en el comando que se usaría para establecer una 'conexión' segura o 'vínculo' en un sistema informático básico.'\n\n" +
                    "Fragmento de código:\n" +
                    "INIT_PROTOCOL (SYSTEM_CORE)\n" +
                    "AUTHENTICATE_USER (ADMIN_01)\n" +
                    "ESTABLISH_??? (SECURE_CHANNEL)\n" +
                    "ENCRYPT_DATA (ALL_TRAFFIC)\n\n" +
                    "LYSSA: '¿Cuál es el comando que falta en el lugar de los '???' para completar la operación de un canal seguro? Una sola palabra clave, común en protocolos de red.'\n\n" +
                    "INGRESA EL COMANDO FALTANTE (una palabra):",
            answer: "LINK",
            correct_feedback: ":: SINTAXIS REPARADA ::\n\n" +
                              "LYSSA: '¡Confirmado! El fragmento ha sido ensamblado. La sinapsis se restablece. Tu comprensión de la lógica binaria es excepcional. El camino está más claro.'",
            incorrect_feedback: ":: ALERTA: CÓDIGO INVÁLIDO ::\n\n" +
                                "LYSSA: 'El comando no es reconocido. La sintaxis permanece rota. La disonancia persiste. Reintenta tu análisis. La frustración distorsiona tu percepción.'",
            next_on_correct: "programador_05_texto_espejo",
            retry_on_incorrect: true
        },
        {
            id: "programador_05_texto_espejo",
            type: "text_only",
            text: "--- PROGRAMADOR: REFLEJOS DISTORSIONADOS ---\n\n" +
                  "La conexión con la Entidad 5 abre un sub-canal. A través de ella, LYSSA te muestra la esencia del ataque del Subvertidor: no solo corrupción directa, sino una distorsión sutil de la percepción, como un espejo que miente. LYSSA: 'El enemigo manipula la verdad de los datos, proyectando un reflejo que no es. Debes ver más allá de la ilusión para comprender su verdadera 'firma' en el código.'",
            next: "wait_for_key",
            glitch: false
        },
        {
            id: "programador_06_enigma_espejo",
            type: "enigma_input",
            prompt: "--- ENIGMA: EL ESPEJO ROTO DEL ALMA DIGITAL ---\n\n" +
                    "LYSSA: 'La Entidad 5 ha establecido un escaneo de resonancia con el Subvertidor. Su firma es una paradoja visual, una imagen que oculta su verdadera forma. Para ver al enemigo, debes entender su reflejo distorsionado.'\n\n" +
                    "Se proyecta una imagen abstracta en tu mente. Percibes un texto binario que, reflejado, parece formar la palabra 'ERROR'. Pero al enfocarte, te das cuenta de que un solo 'bit' está fuera de lugar, haciendo que la 'imagen reflejada' cambie sutilmente a otra palabra.\n\n" +
                    "Si la imagen original es una secuencia binaria que se lee de izquierda a derecha:\n" +
                    "01001010 01100001 01101101 01100101 01110010\n" +
                    "Y al reflejarla horizontalmente, esperas 'ERROR'.\n" +
                    "LYSSA: 'Uno de los grupos de 8 bits (o byte) está corrompido. Al reflejarse, no muestra lo que debería. Encuentra el número del grupo de 8 bits (1, 2, 3, 4 o 5) que está mal al reflejarlo para obtener 'ERROR'.' (La palabra 'Jamer' está en los bits para darte contexto.)\n\n" +
                    "INGRESA EL NÚMERO DEL GRUPO DE BITS INCORRECTO (1 al 5):",
            answer: "4",
            correct_feedback: ":: PERCEPCIÓN RESTAURADA ::\n\n" +
                              "LYSSA: '¡Confirmado! La distorsión ha sido revelada. Tu percepción de la anomalía es precisa. El Subvertidor ha intentado sembrar el caos en los reflejos del Velo, pero tu agudeza lo ha frustrado. Continuamos el rastreo.'",
            incorrect_feedback: ":: ALERTA: IMAGEN DISTORSIONADA ::\n\n" +
                                "LYSSA: 'Tu visión está nublada por la disonancia. La distorsión persiste. El Subvertidor se esconde en los reflejos falsos. Reintenta tu análisis. El Miedo a lo irreal te paraliza.'",
            next_on_correct: "programador_07_texto_ruta",
            retry_on_incorrect: true
        },
        {
            id: "programador_07_texto_ruta",
            type: "text_only",
            text: "--- PROGRAMADOR: RUTA SECUNDARIA ABANDONADA ---\n\n" +
                  "La imagen se solidifica, revelando un mapa fragmentado de la Instalación D-47. Una miríada de rutas de datos se ramifican, muchas de ellas marcadas con una extraña fluctuación. LYSSA: 'El Subvertidor ha dispersado 'rutas fantasma', segmentos de código que parecen funcionales pero que conducen a la disolución. Debes discernir la verdadera trayectoria del núcleo.'",
            next: "wait_for_key",
            glitch: false
        },
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
        {
            id: "programador_09_texto_sombras",
            type: "text_only",
            text: "--- PROGRAMADOR: MÓDULO DE MEMORIA RESIDUAL ---\n\n" +
                  "El entorno digital se vuelve más denso, cargado con ecos de datos pasados, como susurros de memorias corruptas. Ves fragmentos de código que no deberían existir, imágenes borrosas de algoritmos olvidados. LYSSA: 'El Subvertidor ha inyectado 'sombras de código', patrones de datos que se alimentan de la inercia de la memoria, creando bucles disonantes. Debes encontrar la fuente de la persistencia anómala.'",
            next: "wait_for_key",
            glitch: true
        },
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
        {
            id: "programador_11_texto_protocolo",
            type: "text_only",
            text: "--- PROGRAMADOR: PROTOCOLO DE FUSIÓN DE ENTIDADES ---\n\n" +
                  "La densidad del Velo alcanza su punto máximo, y los nodos de la Instalación D-47 se fusionan en un único punto crítico. El Subvertidor de Ciclos se revela, no como un error, sino como un 'protocolo' que imita la legitimidad. LYSSA: 'Está intentando fusionarse con nuestros sistemas, disfrazado como un programa de mantenimiento. Debes identificar la única instrucción que delata su verdadera naturaleza intrusiva antes de que se complete la fusión.'",
            next: "wait_for_key",
            glitch: true
        },
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
            next_on_correct: "end_pathA_success", // Nuevo nodo de éxito
            retry_on_incorrect: true
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
            answer: "LIBRO", // Respuesta de ejemplo, cámbiala si lo deseas
            correct_feedback: ":: RESONANCIA ESTABLECIDA ::\n\n" +
                              "LYSSA: 'Anclaje con éxito. El nexo se estabiliza con tu resonancia personal. La dislocación de D-47 ha sido prevenida. Una ruta tenue, un camino entre los pliegues del Velo, se manifiesta brevemente en la niebla. Has demostrado tu capacidad para la navegación interdimensional.'",
            incorrect_feedback: ":: ALERTA: ANCLAJE INSUFICIENTE ::\n\n" +
                                "LYSSA: 'La niebla de la disonancia te confunde. El anclaje es ineficaz. La Instalación D-47 continúa a la deriva. Piensa más profundamente en lo que realmente te arraiga, lo que define tu 'yo' más allá de esta realidad.'\n\n" +
                                "Sientes un Miedo paralizante a la disociación. El Velo te jala hacia sus profundidades.",
            next_on_correct: "end_pathB_success", // Nuevo nodo de éxito
            retry_on_incorrect: true
        },
        // Aquí podrías tener más nodos para el path B, terminando en end_pathB_success
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
            answer: "VACIO", // Respuesta de ejemplo, cámbiala si lo deseas
            correct_feedback: ":: RESONANCIA ESTABLECIDA CON EL VELO ::\n\n" +
                              "LYSSA: 'Frecuencia de corrupción reconocida. El poder fluye a través de ti. Las barreras internas de D-47 se rompen, o se doblegan a tu voluntad. Tu voluntad es una onda expansiva en el tejido del Velo, para bien o para mal.'",
            incorrect_feedback: ":: ALERTA: DISONANCIA INTERNA ::\n\n" +
                                "LYSSA: 'La disonancia es sutil, pero tu resonancia es débil. No has abrazado la verdadera naturaleza de tu corrupción. El Velo te rechaza parcialmente. Vuelve a intentarlo. Cada fallo te sumerge más en el abismo.'\n\n" +
                                "Sientes un brote incontrolable de Inestabilidad emocional. El Velo se ríe de tu intento.",
            next_on_correct: "end_pathC_success", // Nuevo nodo de éxito
            retry_on_incorrect: true
        },
        // Aquí podrías tener más nodos para el path C, terminando en end_pathC_success
    ],
    // --- NUEVOS NODOS DE ÉXITO PARA CADA PATH ---
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
    // --- NODOS DE LA BIBLIOTECA (CARGADOS DESDE libraryNodes.js) ---
    "library": LIBRARY_NODES // ¡Importante! Aquí se asigna la constante global
};

/* MARKER: Lógica del Juego - Core */

function displayCurrentNode() {
    clearTerminal();
    let node;

    // Determinar qué conjunto de nodos usar
    if (currentPath === "library") {
        node = nodes.library[currentNodeIndex];
    } else {
        node = nodes[currentPath][currentNodeIndex];
    }

    if (!node) {
        // Manejo del final de un path que no conduce a un estado de victoria o biblioteca
        typeWriter("--- FIN DE LA SECUENCIA DE NODOS ---\n\nEl Velo se cierra. Presiona cualquier tecla para reiniciar y explorar otros caminos.", function() {
            showContinuePrompt(function() {
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
        node.func(); // Ejecuta la función definida en el nodo
        return; // Detiene el procesamiento adicional del nodo actual
    }

    if (node.glitch) {
        applyGlitchEffect();
        setTimeout(removeGlitchEffect, 2000);
    }

    if (node.type === "text_only") {
        typeWriter(node.text, function() {
            // Lógica para el "wait_for_key" en la biblioteca
            if (node.next === "wait_for_key_library") {
                showContinuePrompt(function() {
                    // Después de "cualquier tecla" en la biblioteca, regresar al menú principal de la biblioteca
                    currentPath = "library";
                    currentNodeIndex = 0; // Volver al índice del menú principal de la biblioteca
                    displayCurrentNode();
                });
            } else if (node.next === "wait_for_key") {
                showContinuePrompt();
            } else if (node.next === "end_game_reload") {
                // Opción "9. Regresar al Acceso Principal" de la biblioteca
                showContinuePrompt(function() {
                    localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false");
                    localStorage.setItem('globalFailureCount', '0');
                    updateFailureDisplay();
                    location.reload();
                });
            } else if (node.next) {
                var nextNodeFound = false;
                // Buscar el siguiente nodo dentro del path actual
                var targetPathNodes = nodes[currentPath]; // Usar nodes[currentPath] para todos los paths
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
                    // Esto indica un error en la definición del nodo 'next_on_correct'
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
                // Caso por defecto para nodos sin 'next' explícito (deberían ser los de función)
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
        typeWriter(node.prompt, function() {
            waitForInput = true;
            terminalInput.setAttribute('placeholder', 'Tu respuesta...');
        });
    }
}

function handleUserInput(input) {
    if (isTyping) {
        terminalInput.value = '';
        return;
    }

    // Lógica para el menú de la biblioteca (si currentPath es 'library' y el nodo es 'biblioteca_principal')
    if (currentPath === "library" && nodes.library[currentNodeIndex].id === "biblioteca_principal") {
        var node = nodes.library[currentNodeIndex];
        waitForInput = false;
        terminalInput.removeAttribute('placeholder');
        appendText("> " + input);

        var selectedOptionId = node.answer[input]; // Busca la ID del nodo asociado a la opción

        if (selectedOptionId) {
            if (selectedOptionId === "end_game_reload") {
                typeWriter("LYSSA: 'Regresando al acceso principal. El Velo espera tu siguiente elección.'", function() {
                    showContinuePrompt(function() {
                        localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "false"); // Limpiar estado de derrota
                        localStorage.setItem('globalFailureCount', '0'); // Reiniciar contador de fallos
                        updateFailureDisplay(); // Actualizar display
                        location.reload(); // Recargar la página
                    });
                });
            } else {
                var nextNodeFound = false;
                for (var i = 0; i < nodes.library.length; i++) {
                    if (nodes.library[i].id === selectedOptionId) {
                        currentNodeIndex = i;
                        nextNodeFound = true;
                        break;
                    }
                }
                if (nextNodeFound) {
                    displayCurrentNode();
                } else {
                    typeWriter("ERROR: Sección '" + selectedOptionId + "' no encontrada en la Biblioteca. Volviendo al índice.", function() {
                        currentPath = "library";
                        currentNodeIndex = 0; // Volver al índice del menú principal de la biblioteca
                        displayCurrentNode();
                    });
                }
            }
        } else {
            typeWriter(node.incorrect_feedback, function() {
                waitForInput = true;
                terminalInput.setAttribute('placeholder', 'Tu respuesta...');
            });
        }
        return; // Salir de la función para no procesar como enigma normal
    }

    // Lógica para la entrada de la clave inicial (M205, PADEL, PIFIA, BIBLIOTECA)
    if (waitForInput && (currentPath === "initial_access")) { // Solo para el primer input
        waitForInput = false;
        terminalInput.removeAttribute('placeholder');
        appendText("> " + input);

        const inputKey = input.toUpperCase();
        var matchedPath = passwords[inputKey];

        // Verificar si el camino ya ha sido completado y bloquearlo (excepto la biblioteca)
        if (inputKey !== "BIBLIOTECA" &&
            ((inputKey === "M205" && localStorage.getItem(PATH_A_COMPLETED_KEY) === "true") ||
             (inputKey === "PADEL" && localStorage.getItem(PATH_B_COMPLETED_KEY) === "true") ||
             (inputKey === "PIFIA" && localStorage.getItem(PATH_C_COMPLETED_KEY) === "true")))
        {
            typeWriter(
                "<span class='glitch-red'>ERROR CRÍTICO: CONEXIÓN REMOTA '" + inputKey + "' DESHABILADA.</span>\n" +
                "El Subvertidor de Ciclos ha sellado o estabilizado este nodo. Acceso denegado a caminos ya completados.\n" +
                "Explora la Biblioteca de Ecos ('BIBLIOTECA') o intenta un protocolo diferente no completado.",
                function() {
                    applyGlitchEffect();
                    setTimeout(removeGlitchEffect, 2000);
                    setTimeout(function() {
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


        if (matchedPath) {
            if (localStorage.getItem(GAME_FAILED_MAX_ATTEMPTS_KEY) === "true") {
                displayFailedConnectionScreen();
                return;
            }

            // --- ¡AQUÍ ES DONDE HACEMOS VISIBLE EL CONTADOR DE FALLOS! ---
            if (failureDisplayElement) {
                failureDisplayElement.style.display = 'block'; // O 'flex' si #game-container usa flex-direction: column
            }

            currentPath = matchedPath;
            typeWriter(
                "Clave de autenticación aceptada.\n" +
                "Conectando a la red del Velo: " + currentPath.toUpperCase() + "...",
                function() {
                    showLoadingBar(3000, function() {
                        // Si el camino es la biblioteca, simplemente la mostramos
                        if (currentPath === "library") {
                            currentNodeIndex = 0; // Asegurarse de que empiece en el índice 0 del array LIBRARY_NODES
                            displayCurrentNode();
                        } else {
                            // Para paths normales, iniciar el display
                            proceedAfterAuthentication();
                        }
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
            applyGlitchEffect();
            setTimeout(removeGlitchEffect, 1500);
        }
    }
    // Lógica para las respuestas a los enigmas (fuera del menú de la biblioteca)
    else if (waitForInput && nodes[currentPath] && nodes[currentPath][currentNodeIndex] && nodes[currentPath][currentNodeIndex].type === "enigma_input") {
        var node = nodes[currentPath][currentNodeIndex];
        waitForInput = false;
        terminalInput.removeAttribute('placeholder');
        appendText("> " + input);

        // Ajustar la comparación para manejar la respuesta del enigma
        if (input.toUpperCase() === String(node.answer).toUpperCase()) { // Convertir node.answer a String para comparación consistente
            subvertidorPower = Math.max(0, subvertidorPower - 1);
            typeWriter(node.correct_feedback + "\n\n[NIVEL DE AMENAZA DEL SUBVERTIDOR: " + subvertidorPower + "]", function() {
                updateFailureDisplay();
                // --- CAMBIO CLAVE AQUÍ: AÑADIMOS showContinuePrompt() ---
                showContinuePrompt(function() { // Espera una tecla antes de continuar
                    if (node.next_on_correct) {
                        var nextNodeFound = false;
                        var targetPathNodes = nodes[currentPath];
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
                        currentNodeIndex++;
                        displayCurrentNode();
                    }
                });
                // --- FIN DEL CAMBIO ---
            });
        } else {
            // ... (código para respuestas incorrectas, que ya debería tener showContinuePrompt o similar) ...
            subvertidorPower++; // Incrementa el poder del subvertidor en fallo de enigma
            globalFailureCount++; // Incrementa los fallos globales
            localStorage.setItem('globalFailureCount', globalFailureCount.toString());
            updateFailureDisplay();

            typeWriter(
                node.incorrect_feedback +
                "\n\n[NIVEL DE AMENAZA DEL SUBVERTIDOR: " + subvertidorPower + "]\n" +
                "[FALLOS GLOBALES: " + globalFailureCount + " / " + MAX_GLOBAL_FAILURES + "]",
                function() {
                    if (globalFailureCount >= MAX_GLOBAL_FAILURES) {
                        localStorage.setItem(GAME_FAILED_MAX_ATTEMPTS_KEY, "true");
                        displayFailedConnectionScreen();
                        return;
                    }

                    if (node.retry_on_incorrect) {
                        waitForInput = true;
                        terminalInput.setAttribute('placeholder', 'Tu respuesta...');
                    } else {
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
            applyGlitchEffect();
            setTimeout(removeGlitchEffect, 1500);
        }
    }
    else {
        appendText("> " + input);
        typeWriter("Comando no reconocido o no se espera entrada en este momento. Intente 'ayuda' si está disponible.", null);
    }
}


function proceedAfterAuthentication() {
    currentNodeIndex = 0; // Resetear para el inicio del path
    displayCurrentNode();
}

/* MARKER: Inicialización del Juego */
document.addEventListener('DOMContentLoaded', initGame);