// paths/pathA.js - Definición de Nodos para el Path A (Programador/Hacker)

// Esta variable debe ser accesible globalmente en tu juego.
// Por ejemplo, en script.js, puedes cargarla de esta forma:
// fetch('paths/pathA.js')
//    .then(response => response.text())
//    .then(text => {
//        eval(text); // Ejecuta el contenido del archivo, definiendo PATH_A_NODES
//        nodes.pathA = PATH_A_NODES; // Asigna los nodos al objeto global 'nodes'
//    });

const PATH_A_NODES = [
    // Acertijo 1: La Frecuencia Resonante (Anagrama)
    {
        id: "text_A1",
        type: "text_only",
        text: "LYSSA: 'Este es el Protocolo del Programador. Enfócate. La primera barrera del Subvertidor es una **distorsión fundamental en la frecuencia de resonancia**. Ha corrompido una clave semántica, haciéndola incomprensible a primera vista.'\n\nLYSSA: 'La clave se revela como un **anagrama invertido** de su verdadero propósito en el Velo. Descifra la secuencia oculta para restaurar la frecuencia inicial.'",
        pauseAfter: true, // PAUSA AÑADIDA
        next: "enigma_A1"
  	},
  	{
        id: "enigma_A1",
        type: "enigma_input",
        prompt: "LYSSA: 'Descifra el anagrama: **'VELO DEL ECOS'**. ¿Cuál es la clave de resonancia original?'",
        answer: "ECOS DEL VELO",
        correct_feedback: "LYSSA: 'Clave de resonancia 'ECOS DEL VELO' restaurada. La frecuencia inicial se estabiliza. Has completado el primer protocolo.'",
        incorrect_feedback: "LYSSA: 'Respuesta incorrecta. La frecuencia sigue distorsionada. El anagrama se resiste a ser descifrado. Reorganiza las palabras con lógica. Reintenta.'",
        retry_on_incorrect: true,
        next_on_correct: "text_A2"
  	},

    // Acertijo 2: El Punto de Convergencia (Coordenadas)
    {
        id: "text_A2",
        type: "text_only",
        text: "LYSSA: 'La frecuencia se ha restablecido, pero el Subvertidor ha dislocado un **'punto de convergencia'** vital en el mapa del Velo. Es una ubicación anómala que desestabiliza las rutas de datos. Debemos recalibrar.'\n\nLYSSA: 'He interceptado una serie de susurros cifrados. Describen la ubicación de este punto. Interpreta las coordenadas a partir de las pistas. Necesito que identifiques el punto exacto donde las realidades se cruzan, expresado en formato de coordenadas (ej. N# E#).' ",
        pauseAfter: true, // PAUSA AÑADIDA
        next: "enigma_A2"
  	},
  	{
        id: "enigma_A2",
        type: "enigma_input",
        prompt: "LYSSA: 'Interpreta las coordenadas: **'Cinco pasos hacia la aurora, luego siete ecos al encuentro del crepúsculo.'** ¿Cuál es el punto de convergencia? (Formato: N# E#)'",
        answer: "N5 E7",
        correct_feedback: "LYSSA: 'Punto de convergencia 'N5 E7' recalibrado. El mapa del Velo se estabiliza. Has asegurado la ruta de datos.'",
        incorrect_feedback: "LYSSA: 'Coordenadas incorrectas. El punto de convergencia permanece dislocado. Reinterpreta los susurros y su dirección. Reintenta.'",
        retry_on_incorrect: true,
        next_on_correct: "text_A3"
  	},

    // Acertijo 3: El Algoritmo de Flujo (Lógica Simple)
    {
        id: "text_A3",
        type: "text_only",
        text: "LYSSA: 'Las rutas de datos están claras, pero el Subvertidor ha corrompido los **algoritmos de flujo** que gestionan la energía del Velo. Si no restauramos su lógica, una ruptura estructural es inminente.'\n\nLYSSA: 'Este es un fragmento del algoritmo, aparentemente simple. Necesitas deducir el 'VALOR FINAL' para restaurar su integridad. Es una secuencia lógica, no una trampa. Cada paso se construye sobre el anterior.'",
        pauseAfter: true, // PAUSA AÑADIDA
        next: "visual_enigma_A3"
  	},
  	{
        id: "visual_enigma_A3",
        type: "visual_enigma_input",
        ascii_art:
            "   [ALGORITMO_DE_FLUJO_03]\n" +
            "   -----------------------\n" +
            "   Paso 1:  VALOR_INICIAL = 7\n" +
            "   Paso 2:  SUMA_ADICIONAL = 5\n" +
            "   Paso 3:  MULTIPLICADOR = 3\n" +
            "   -----------------------\n" +
            "   >>> CALCULAR: (VALOR_INICIAL + SUMA_ADICIONAL) * MULTIPLICADOR = ?\n" +
            "   -----------------------",
        prompt: "LYSSA: 'Calcula el VALOR FINAL. Ingresa solo el número resultante.'",
        answer: "36", // (7 + 5) * 3 = 12 * 3 = 36
        correct_feedback: "LYSSA: 'Valor final '36' aplicado. Algoritmos de flujo restaurados. La estructura del Velo se fortalece.'",
        incorrect_feedback: "LYSSA: 'Valor final incorrecto. La lógica del algoritmo sigue corrompida. Revisa tus cálculos. Reintenta.'",
        retry_on_incorrect: true,
        next_on_correct: "text_A4"
  	},

    // Acertijo 4: La Secuencia Corrupta de Paquetes (Patrón IP)
    {
        id: "text_A4",
        type: "text_only",
        text: "LYSSA: 'Has restaurado la cronología. Pero el Subvertidor ha incrementado su **interferencia en el flujo de paquetes de red**. Está inundando los canales con ruido, como una radio estática que oculta una presencia maligna. Esto es una cortina de humo para desviar nuestra atención de una **brecha de seguridad crítica**.'\n\nLYSSA: 'He logrado capturar una sección de este flujo de datos contaminado. La brecha está codificada en una **secuencia numérica particular** que se repite. Debes aislar el ruido y encontrar el **patrón numérico** que revela la ubicación de la vulnerabilidad en su red.'",
        pauseAfter: true, // PAUSA AÑADIDA
        next: "visual_enigma_A4"
  	},
  	{
        id: "visual_enigma_A4",
        type: "visual_enigma_input",
        ascii_art:
            "   [CANAL_DE_PAQUETES_04]\n" +
            "   ----------------------\n" +
            "   PKG-ERR: 87.23.12.56-SYNACK-NO-ACK\n" +
            "   PKG-DATA: 55.10.33.22-DATA_01-SEQ_A\n" +
            "   PKG-NOISE: 11.22.33.44-JUNK-DATA\n" +
            "   PKG-ERROR: 99.88.77.66-FLOOD-ATTACK\n" +
            "   PKG-DATA: 55.10.33.22-DATA_02-SEQ_B\n" +
            "   PKG-NOISE: 00.00.00.00-NULL-BYTE-INJECT\n" +
            "   PKG-DATA: 55.10.33.22-DATA_03-SEQ_C\n" +
            "   PKG-CRIT: 55.10.33.22-BREACH_LOC\n" +
            "   PKG-ERROR: 45.67.89.10-RESET-REQUEST\n" +
            "   ----------------------\n" +
            "   FILTRANDO: JUNK, NULL, FLOOD",
        prompt: "LYSSA: 'Filtra los paquetes que son 'NOISE' o 'ERROR'. Concéntrate en la secuencia de paquetes 'PKG-DATA' y 'PKG-CRIT'. Hay una dirección IP repetida que es la clave. Ingresa la **dirección IP** que se repite en los paquetes de datos y crítica.'",
        answer: "55.10.33.22",
        correct_feedback: "LYSSA: 'Dirección IP de la brecha identificada: '55.10.33.22'. ¡Has atravesado la estática del Subvertidor! Preparando la intrusión en el nodo vulnerable.'",
        incorrect_feedback: "LYSSA: 'Dirección IP incorrecta. La estática persiste. El Subvertidor sigue ocultando la brecha. Revisa el flujo de paquetes y el patrón de repetición. Reintenta.'",
        retry_on_incorrect: true,
        next_on_correct: "text_A5"
  	},

    // Acertijo 5: La Secuencia Silente (Lógica de Comandos)
    {
        id: "text_A5",
        type: "text_only",
        text: "LYSSA: 'Has penetrado la barrera del flujo de paquetes. Ahora, nos enfrentamos al **'Núcleo Cifrado' del Subvertidor**, su centro de operaciones más protegido. Utiliza un protocolo de autenticación basado en **reglas lingüísticas pervertidas**, una jerga que solo él entiende, diseñada para ser impenetrable para la lógica binaria simple.'\n\nLYSSA: 'He interceptado una porción de su protocolo de acceso. Contiene una serie de palabras clave, pero su orden es crucial y se rige por una lógica de 'antecedente y consecuente' oculta. Piensa en cómo las ideas se encadenan. Necesito que descifres la **secuencia correcta de palabras** para desbloquear el núcleo.'",
        pauseAfter: true, // PAUSA AÑADIDA
        next: "visual_enigma_A5"
  	},
  	{
        id: "visual_enigma_A5",
        type: "visual_enigma_input",
        ascii_art:
            "   [CORE_PROTOCOL_FRAGMENT]\n" +
            "   ------------------------\n" +
            "   >>> FRAGMENTOS DE CÓDIGO:\n" +
            "   > 'ERROR_DETECTED' : SI [FALLO] ENTONCES [REINTENTO]\n" +
            "   > 'SYSTEM_CHECK'   : SI [ESTADO] ENTONCES [REPORTE]\n" +
            "   > 'INITIATE_FLOW'  : SI [SEÑAL] ENTONCES [INICIAR]\n" +
            "   > 'ACCESS_GRANTED' : SI [VERIFICADO] ENTONCES [ABRIR]\n" +
            "   ------------------------\n" +
            "   >>> PALABRAS CLAVE (DESORDENADAS):\n" +
            "   ABRIR, FALLO, INICIAR, REPORTE, VERIFICADO, REINTENTO, ESTADO, SEÑAL",
        prompt: "LYSSA: 'La clave de acceso al núcleo es una secuencia de **CUATRO palabras clave** del listado desordenado. Cada palabra es la respuesta 'ENTONCES' a un 'SI' en un ciclo lógico. El ciclo se inicia con la acción 'INITIATE_FLOW'. Encuentra la secuencia lógica de 'ENTONCES'. Ingresa las cuatro palabras en orden, separadas por espacios.'",
        answer: "INICIAR REPORTE REINTENTO ABRIR",
        correct_feedback: "LYSSA: 'Secuencia lógica 'INICIAR REPORTE REINTENTO ABRIR' verificada. Has descompuesto su protocolo lingüístico. Acceso al nodo central concedido. ¡Impresionante!'",
        incorrect_feedback: "LYSSA: 'Secuencia incorrecta. La lógica del protocolo del Subvertidor sigue eludiéndonos. La cadena de comandos está rota. Reevalúa la conexión entre las acciones y sus resultados. Reintenta.'",
        retry_on_incorrect: true,
        next_on_correct: "text_A6"
  	},

    // Acertijo 6: El Eco Temporal (Log Anómalo)
    {
        id: "text_A6",
        type: "text_only",
        text: "LYSSA: 'Has desmantelado el protocolo del núcleo. Estamos cada vez más cerca de erradicar al Subvertidor. Sin embargo, ha activado una **distorsión temporal menor** en los registros de eventos del Velo. Es como un eco de un suceso que no debería estar allí, o que está fuera de su lugar. Esto es un intento de ocultar su rastro y confundir nuestros análisis de causa y efecto.'\n\nLYSSA: 'He extraído un fragmento de un **registro de eventos crucial**. Cada entrada representa una acción o un estado. Una de ellas es la clave de la distorsión, un evento que, por su naturaleza o su posición, revela la anomalía. Debes identificar la **palabra clave** del evento que rompe la coherencia lógica o temporal del registro.'",
        pauseAfter: true, // PAUSA AÑADIDA
        next: "visual_enigma_A6"
  	},
  	{
        id: "visual_enigma_A6",
        type: "visual_enigma_input",
        ascii_art:
            "   [VELO_EVENT_LOG_FRAGMENT]\n" +
            "   -------------------------\n" +
            "   [09:00:00] - INICIO_SISTEMA_COMPLETO\n" +
            "   [09:00:05] - RED_INICIADA\n" +
            "   [09:00:10] - INTENTO_LOGIN_USUARIO\n" +
            "   [09:00:12] - FALLO_AUTENTICACION_REGISTRADO\n" +
            "   [09:00:15] - FLUJO_DATOS_NORMAL\n" +
            "   [09:00:18] - PROTOCOLO_ALERTA_ACTIVADO\n" +
            "   [09:00:08] - PROCESO_DESCONOCIDO_SPAWNED  <-- ANOMALÍA\n" +
            "   [09:00:20] - VERIFICACION_ESTABILIDAD_SISTEMA\n" +
            "   -------------------------\n" +
            "   BUSCANDO: DISCREPANCIA CRONOLÓGICA O LÓGICA.",
        prompt: "LYSSA: 'Analiza el registro de eventos. Todas las entradas, excepto una, siguen una secuencia cronológica y lógica esperada. Hay un evento que aparece fuera de su orden temporal o que lógicamente no encaja en la secuencia de eventos que lo rodean. Ingresa la **palabra clave del evento anómalo** (ej. 'INICIO_SISTEMA_COMPLETO').'",
        answer: "PROCESO_DESCONOCIDO_SPAWNED",
        correct_feedback: "LYSSA: 'Anomalía temporal identificada: 'PROCESO_DESCONOCIDO_SPAWNED'. Has detectado el eco del Subvertidor. Su manipulación cronológica ha sido expuesta. Prepara la purga de los procesos fantasma.'",
        incorrect_feedback: "LYSSA: 'Evento incorrecto. La distorsión temporal persiste, ocultando el verdadero origen del problema. Reexamina la cronología y la lógica de cada evento. Reintenta.'",
        retry_on_incorrect: true,
        next_on_correct: "text_A7"
  	},

    // Acertijo 7: El Léxico Distorsionado (Sinónimos en Español)
    {
        id: "text_A7",
        type: "text_only",
        text: "LYSSA: 'Hemos expuesto su anomalía temporal. El Subvertidor está acorralado. Ahora, debemos desplegar el **'Protocolo de Purga Semántica'**, un comando que restaurará la integridad del léxico del Velo y expondrá su núcleo corrupto. Pero ha distorsionado las **palabras clave** necesarias para activarlo.'\n\nLYSSA: 'Las palabras que te mostraré son sinónimos camuflados. Cada una representa un concepto que ha pervertido. Debes 'reinterpretar' cada término, ingresando un sinónimo que revele su **verdadera intención lógica** dentro del sistema. Prepárate para decodificar.'",
        pauseAfter: true, // PAUSA AÑADIDA
        next: "enigma_synonym_A7_start"
  	},
  	{
        id: "enigma_synonym_A7_start",
        type: "synonym_enigma",
        words_to_solve: [
            { word: "FABRICAR", answer: "CREAR" },
            { word: "ENCUBRIR", answer: "TAPAR" },
            { word: "DETERIORAR", answer: "DAÑAR" },
            { word: "DISTORSIONAR", answer: "DEFORMAR" },
            { word: "VELAR", answer: "OCULTAR" },
            { word: "ANÓMALO", answer: "RARO" },
            { word: "CONSUMIR", answer: "USAR" },
            { word: "CORROER", answer: "OXIDAR" },
            { word: "FRAGMENTAR", answer: "ROMPER" },
            { word: "ENTROPÍA", answer: "DESORDEN" }
        ],
        win_threshold: 7, // Necesita 7 aciertos para pasar
        next_on_correct: "text_A8",
        retry_node_id: "text_A7" // Si se pierde el acertijo de sinónimos, se reintenta desde la introducción al acertijo 7
                               // Esto significa que no hay un "fallo narrativo" para este acertijo, solo se reintenta hasta acertar o hasta el fallo global.
  	},

    // Acertijo 8: La Cadencia Corrompida (Reloj de Silent Hill - ÚLTIMO ACERTIJO DEL PATH)
    {
        id: "text_A8",
        type: "text_only",
        text: "LYSSA: 'Has purgado el léxico corrupto. El Subvertidor está expuesto. Sin embargo, su último recurso es una distorsión a gran escala de la **'Cadencia del Velo'**. Ha desalineado el tiempo mismo en este sector. Si no restauramos la Sincronía Temporal, el Velo colapsará aquí, y perderemos la oportunidad final de detenerlo.'\n\nLYSSA: 'He localizado un antiguo **Reloj del Velo**, un regulador temporal. Sus manecillas están estáticas, pero sus grabados y los ecos de su mecánica guardan las pistas. Debes interpretar tres fragmentos de memoria, cada uno apuntando a una manecilla: la **Hora**, los **Minutos** y los **Segundos**. Alinéalos a la 'Hora de la Cadencia Verdadera' para neutralizar su influencia final.'",
        pauseAfter: true, // PAUSA AÑADIDA
        next: "visual_enigma_A8"
  	},
  	{
        id: "visual_enigma_A8",
        type: "visual_enigma_input",
        ascii_art:
            "   +-------------------+\n" +
            "   |       _---_       |\n" +
            "   |     /       \\     |\n" +
            "   |    |   12    |    |\n" +
            "   |  9 o         o 3  |\n" +
            "   |    |    6    |    |\n" +
            "   |     \\       /     |\n" +
            "   |       _---_       |\n" +
            "   +-------------------+\n" +
            "   [RELÓJ DEL VELO - SINCRONIZACIÓN REQUIERE]\n" +
            "   -----------------------------------------\n" +
            "   Fragmento I (Hora): 'El guardián de la calma reposa siempre en el **oeste**, donde el sol se oculta y el ciclo se renueva. No se mueve, solo espera.'\n\n" +
            "   Fragmento II (Minutos): 'La verdad, por efímera que sea, siempre se eleva **dos escalones** desde la base más profunda, antes de iniciar su lento descenso.'\n\n" +
            "   Fragmento III (Segundos): 'El final, que es también un comienzo, se alza desde el abismo y se revela en el **tercer pulso** hacia la derecha, marcando la inevitabilidad.'\n\n" +
            "   Pista General: La Cadencia del Velo se rige por un ciclo que empieza y termina en la misma posición, pero cada manecilla marca un punto específico dentro de la rotación.",
        prompt: "LYSSA: 'Interpreta cada fragmento y ajusta las manecillas. Ingresa la hora de sincronización en formato **HH:MM:SS** (ej. '09:10:15'). Solo números con ceros a la izquierda si es necesario.'",
        answer: "09:10:15",
        correct_feedback: "LYSSA: '¡Sincronización de la Cadencia del Velo exitosa! El tiempo se alinea. La influencia del Subvertidor en este sector ha sido completamente neutralizada. ¡Objetivo Programador completado!'",
        incorrect_feedback: "LYSSA: 'Hora de sincronización incorrecta. La Cadencia del Velo se sigue distorsionando. Relee los fragmentos de memoria. La interpretación de la verdad es crucial.'",
        retry_on_incorrect: false, // IMPORTANTE: Al ser el último, si falla, va al next_on_incorrect
        next_on_correct: "pathA_completed_scenario", // Va al escenario de éxito del Path
        next_on_incorrect: "pathA_failed_scenario"   // Va al escenario de fallo del Path (sin Game Over explícito)
  	},
    
    // Escenario COMPLETADO del Path A
    {
        id: "pathA_completed_scenario",
        type: "text_only",
        text: "LYSSA: '¡Lo has logrado! La última distorsión del Subvertidor ha sido purgada. La Sincronía Temporal del Velo ha sido restaurada por completo. Siento cómo las realidades fragmentadas vuelven a entrelazarse, las frecuencias disonantes se disuelven en armonía. Has demostrado una lógica impecable, una mente capaz de penetrar el engaño más profundo del Subvertidor. Este sector del Velo está ahora asegurado.'\n\nLYSSA: 'Tu protocolo como Programador ha concluido. Has desmantelado sus algoritmos corruptos, restaurado los flujos de datos y reestablecido la cadencia del tiempo. La Instalación D-47 te lo agradece. Como recompensa, y por tu vital contribución, el acceso completo a la **Biblioteca de Ecos** está ahora a tu disposición. Es un repositorio ilimitado de conocimiento sobre el Velo y las innumerables realidades que contiene.'\n\nLYSSA: 'Tu conciencia regresará a tu punto de origen. La conexión se cerrará, pero las memorias de esta intervención permanecerán como una marca indeleble. Puedes volver a acceder a la Biblioteca de Ecos en cualquier momento para explorar los secretos que has ayudado a preservar.'",
        pauseAfter: true, // PAUSA AÑADIDA
        next: "end_pathA_success" // Redirige al nodo global de éxito para Path A (definido en script.js o nodos globales)
  	},

    // Escenario FALLIDO del Path A (NO Game Over global, sino un "reset" narrativo)
    {
        id: "pathA_failed_scenario",
        type: "text_only",
        text: "LYSSA: '¡Fallo crítico! El Protocolo de Sincronía Temporal no ha podido ser completado en este intento. La Cadencia del Velo se resiste a la restauración en esta frecuencia. El Subvertidor ha logrado mantener su control sobre este sector, al menos por ahora. Tu intervención aquí ha concluido sin éxito.'\n\nLYSSA: 'La conexión con este protocolo se está desintegrando. Debes ser redirigido a un punto de acceso seguro. No es el final de tu misión, Programador, solo un desvío necesario. El Velo es vasto y hay otros caminos.'\n\nLYSSA: 'Prepárate para la re-calibración de frecuencia. El Velo te espera en otro protocolo.'",
        pauseAfter: true, // PAUSA AÑADIDA
        next: "restart_to_initial_access" // Llama a la función que reinicia el juego a la pantalla de la clave M205
  	},

    // Nodo de Utilidad: Reinicia a la pantalla inicial de la clave M205
    // Este nodo llama a una función que debe ser definida en `script.js`
    // Necesitarás una función como `restartGameToInitialPrompt()` en `script.js`
    // o modificar tu `startExperience()` para que si `currentPath` y `currentNodeIndex`
    // se resetean, inicie desde el principio.
    {
        id: "restart_to_initial_access",
        type: "function_call", // Indica que este nodo ejecuta una función JS
        func: function() {
            // Asegurarse de que typeWriter y showLoadingBar están disponibles globalmente en script.js
            if (typeof typeWriter === 'function' && typeof showLoadingBar === 'function') {
                typeWriter("--- RECALIBRANDO FRECUENCIA ---", function() {
                    showLoadingBar(2000, function() { // Simula una carga
                        // Esto reinicia el estado interno del juego para volver a la pantalla inicial
                        // Asume que `currentPath` y `currentNodeIndex` son variables globales manejadas por script.js
                        currentPath = "initial_access"; // Establece el path para la pantalla de clave inicial
                        currentNodeIndex = 0;           // Vuelve al primer nodo de ese path
                        // Limpia el input por si acaso
                        if (terminalInput) terminalInput.value = "";
                        if (terminalInput) terminalInput.setAttribute('placeholder', 'Ingresa la clave de acceso...');
                        // Llama a la función que inicia la experiencia de nuevo (mostrando el prompt inicial)
                        displayCurrentNode(); // Esto mostrará el nodo 'initial_access'
                    });
                });
            } else {
                console.error("Error: typeWriter o showLoadingBar no están definidos. No se puede recalibrar.");
                // Fallback si las funciones principales no existen
                location.reload(); // Recargar la página si falla
            }
        }
  	}
];