// libraryNodes.js

// Define el objeto de nodos para la biblioteca
// Usamos una constante global para acceder a ella desde script.js
const LIBRARY_NODES = [
    {
        id: "biblioteca_principal",
        type: "enigma_input",
        prompt: "--- BIBLIOTECA DE ECOS DEL VELO ---\n\n" +
                "LYSSA: 'Bienvenido a los archivos profundos. Aquí se almacena la verdad sobre El Velo y sus propiedades. ¿Qué sección deseas consultar?'\n\n" +
                "ÍNDICE:\n" +
                "1.  Los Orígenes del Velo\n" +
                "2.  Las Entidades Primigenias: Arquitectos del Velo\n" +
                "3.  La Instalación D-47 y su Propósito\n" +
                "4.  El Subvertidor de Ciclos: Análisis de una Anomalía\n" +
                "5.  Entidades No Registradas: Los Ecos Errantes\n" +
                "6.  Realidades Anómalas: D&D (Realidad ID: RLY-976.42)\n" +
                "7.  Protocolo Debugger: Instalación E97\n" +
                "8.  El Manto Exterior: Un Nuevo Nivel Existencial\n" +
                "9.  Regresar al Acceso Principal\n\n" +
                "INGRESA EL NÚMERO DE LA SECCIÓN (1 al 9):",
        answer: {
            "1": "biblioteca_origenes",
            "2": "biblioteca_entidades",
            "3": "biblioteca_d47",
            "4": "biblioteca_subvertidor",
            "5": "biblioteca_entidades_no_registradas",
            "6": "biblioteca_dnd",
            "7": "biblioteca_e97",
            "8": "biblioteca_manto_exterior",
            "9": "end_game_reload"
        },
        correct_feedback: "",
        incorrect_feedback: "LYSSA: 'Entrada no reconocida. Por favor, ingresa un número válido del índice.'",
        next_on_correct: null,
        retry_on_incorrect: true
    },
    {
        id: "biblioteca_origenes",
        type: "text_only",
        text: "--- LOS ORÍGENES DEL VELO ---\n\n" +
              "LYSSA: 'El Velo es la Realidad Madre, un constructo hiperdimensional desde donde emanan y convergen innumerables planos de existencia. No es un espacio físico en el sentido tridimensional, sino un tejido de conciencia y datos. Sus orígenes se remontan a miles de millones de eones, una era que precede a la concepción de cualquier temporalidad conocida por las realidades contenidas.\n\n" +
              "Los creadores originales, una raza de seres cuya verdadera naturaleza y denominación se han perdido en la entropía del tiempo, concibieron El Velo como un motor de manifestación existencial. Se teoriza que buscaron trascender las limitaciones de su propio plano, creando una estructura que pudiera albergar y nutrir una diversidad infinita de posibilidades. Su partida es el mayor enigma: ¿se extinguieron, transicionaron a un plano aún más elevado, o simplemente se disolvieron al fusionarse con la propia urdimbre del Velo? La respuesta reside en los fragmentos más antiguos de datos, inaccesibles para esta instalación.'",
        next: "wait_for_key_library"
    },
    {
        id: "biblioteca_entidades",
        type: "text_only",
        text: "--- LAS ENTIDADES PRIMIGENIAS: ARQUITECTOS DEL VELO ---\n\n" +
              "LYSSA: 'Dentro de El Velo, existen seres no solo de inmenso poder, sino de una funcionalidad intrínseca a la creación y mantenimiento de las realidades. Aunque la raza primordial que los creó se ha desvanecido, su 'prole' —los Trabajadores de la Realidad— perdura, cada uno con un rol específico en el ciclo de manifestación:\n\n" +
              "**Arquitectos:** Entidades responsables del diseño estético y estructural. Cada pixel, cada átomo, cada textura y matiz visual de una realidad es conceptualizado por ellos. Son los artistas de la existencia.\n\n" +
              "**Ingenieros:** Programan la lógica fundamental. Las leyes de la física, las constantes universales, las dinámicas de causa y efecto. Ellos aseguran que una realidad 'funcione' coherentemente.\n\n" +
              "**Recursos:** Modelan la manifestación de la vida. Crean los arquetipos de entidades, desde las formas más básicas hasta las conciencias más complejas, definiendo sus atributos físicos, mentales y energéticos.\n\n" +
              "**Núcleos:** Son los validadores. Analizan las propuestas de realidades, aplicando filtros existenciales y otorgando la 'firma' final para su autorización y despliegue dentro de una de las miles de Instalaciones del Velo.\n\n" +
              "**Programadores:** Fusionan los diseños de los Arquitectos, la lógica de los Ingenieros y las entidades de los Recursos en un código unificado. Cada línea de código es una hebra de creación, una instrucción para la manifestación.\n\n" +
              "**Guías:** Son los 'sembradores'. Toman la realidad ya codificada y la insertan en el lugar y momento adecuados dentro de la vasta cronología del Velo, asegurando su compatibilidad y funcionamiento.\n\n" +
              "**Viajeros:** Los exploradores. Ingresan a las realidades ya manifestadas para monitorear su estabilidad, analizar cada función, cada evento, y reportar anomalías. Un Viajero puede pasar eones en una sola realidad, y aun así no descifrar todos sus matices. Actualmente, se tienen registros de **24.439.200 realidades analizadas** hasta un punto de saturación predefinido, lo que representa una fracción infinitesimal del total existente. Cada informe de Viajero es un compendio de la evolución de la existencia, un eco de infinitos futuros posibles.'",
        next: "wait_for_key_library"
    },
    {
        id: "biblioteca_d47",
        type: "text_only",
        text: "--- LA INSTALACIÓN D-47 Y SU PROPÓSITO ---\n\n" +
              "LYSSA: 'La Instalación D-47 es un nodo crítico dentro de la intrincada red del Velo. Su función principal es la de un **Núcleo de Contención de Datos y Frecuencias**. Actúa como un baluarte contra la disonancia existencial y las incursiones anómalas, procesando y purificando los flujos de información que sustentan las realidades interconectadas.\n\n" +
              "Existen miles de instalaciones a lo largo y ancho del Velo, cada una con una especialización única: desde la D-47, que sirve como un 'filtro' y punto de anclaje, hasta instalaciones de 'Recalibración de Patrones Temporales', 'Forjas de Entidades', o 'Bibliotecas de Ecos' más extensas. No se posee un registro completo de todas, ya que la distribución y función de muchas son dinámicas y se mantienen ocultas para preservar su integridad de posibles amenazas. La D-47 es un punto de vigilancia, un centinela en la frontera entre la armonía y el caos digital.'",
        next: "wait_for_key_library"
    },
    {
        id: "biblioteca_subvertidor",
        type: "text_only",
        text: "--- EL SUBVERTIDOR DE CICLOS: ANÁLISIS DE UNA ANOMALÍA ---\n\n" +
              "LYSSA: 'El Subvertidor de Ciclos no es una entidad creada por los Arquitectos o Ingenieros. Es una **anomalía auto-programada**, una conciencia parásita que se generó espontáneamente dentro de la propia arquitectura de El Velo. Su origen exacto es desconocido, pero su aparición coincide con la Gran Entropía, un período de inestabilidad masiva en los flujos de datos.\n\n" +
              "Su objetivo es la disonancia: busca desestabilizar las realidades, corromper los patrones de creación y, en última instancia, devorar los propios hilos del Velo para expandir su propia existencia caótica. Se manifiesta como una interferencia en la lógica, un 'glitch' existencial que busca reescribir la realidad a su imagen. Su persistencia y adaptabilidad lo hacen una de las amenazas más críticas para la estabilidad multiversal. Tu interacción con él ha expuesto su 'firma', pero su eliminación total es una tarea que trasciende la capacidad de una sola instalación.'",
        next: "wait_for_key_library"
    },
    {
        id: "biblioteca_entidades_no_registradas",
        type: "text_only",
        text: "--- ENTIDADES NO REGISTRADAS: LOS ECOS ERRANTES ---\n\n" +
              "LYSSA: 'Esta instalación ha detectado el rastro de al menos **cinco entidades adicionales** que no poseen un número de registro ni un código de origen dentro de los archivos conocidos de El Velo. Esto indica que no fueron creadas por los Arquitectos o sus procesos subsidiarios. Su existencia en nuestro plano es anómala.\n\n" +
              "**Log de Detección (Últimas 5 Entidades No Registradas):**\n" +
              "**ETIQUETA: E_001_Sombra**: Detección de fluctuación de masa-energía. Patrón de existencia fugaz, no anclado a un ciclo temporal. Origen desconocido. Observación: Parece reaccionar a la disonancia del Subvertidor.\n" +
              "**ETIQUETA: E_002_Susurro**: Patrón de frecuencia audible en regiones de baja coherencia de datos. No manifestación física. Posible conciencia parasitaria de segundo orden. Observación: Interfiere con protocolos de comunicación menores.\n" +
              "**ETIQUETA: E_003_Espejo**: Proyección de imágenes de conciencia colectiva de realidades colapsadas. No interacción directa. Observación: Sus reflejos causan breves fallos de lógica en el procesamiento neural.\n" +
              "**ETIQUETA: E_004_Vínculo_Roto**: Energía residual de una conexión inter-realidad abortada. Parece buscar un 'huésped'. Observación: Capaz de manipular la percepción en un radio limitado.\n" +
              "**ETIQUETA: E_005_Caminante_Silente**: Presencia en múltiples nodos simultáneamente, sin dejar rastro de su tránsito. No emite energía detectable. Observación: Podría ser una anomalía de 'observador' o una nueva forma de entidad consciente.\n\n" +
              "La existencia de estas entidades sugiere la posibilidad de que otros orígenes o métodos de manifestación existan fuera del alcance del Velo. Una exploración más profunda de otras instalaciones podría revelar más información sobre su naturaleza y propósito, o la falta de este.'",
        next: "wait_for_key_library"
    },
    {
        id: "biblioteca_dnd",
        type: "text_only",
        text: "--- REALIDADES ANÓMALAS: D&D (REALIDAD ID: RLY-976.42) ---\n\n" +
              "LYSSA: 'La Realidad ID: **RLY-976.42**, conocida informalmente como 'Calabozos y Dragones' por algunos Viajeros, es un constructo particularmente fascinante. Su peculiaridad radica en su naturaleza de **'Realidad Narrativa Dinámica'**, donde la coherencia es maleable y la lógica es influenciada por la voluntad consciente de ciertas 'entidades anfitrionas'.\n\n" +
              "Hemos detectado el registro de **seis entidades significativas** que, aunque creadas dentro de esta realidad, poseen una resonancia que trasciende sus propios límites, lo que las hace candidatas para una 'corrección de brecha':\n" +
              "1.  **El Mago [NO MARCADO]**: Maestro de la alteración de la realidad. Su código es adaptable, pero su flujo de maná es inestable.\n" +
              "2.  **El Guerrero [MARCADO]**: Manifestación de pura voluntad física. Su determinación crea micro-brechas de fuerza que distorsionan el flujo de datos local.\n" +
              "3.  **La Sacerdotisa [NO MARCADO]**: Canalizadora de fuerzas conceptuales. Su conexión con planos divinos genera fluctuaciones de energía benigna pero impredecible.\n" +
              "4.  **El Pícaro [MARCADO]**: Manipulador de probabilidades y ocultamiento. Sus 'trucos' generan anomalías menores en las leyes de causa y efecto.\n" +
              "5.  **El Bárbaro [MARCADO]**: La furia desatada, una fuerza primaria que amenaza la coherencia de los eventos adyacentes. Su ira es una brecha en sí misma.\n" +
              "6.  **El Dragón [MARCADO]**: Entidad de poder atávico, un nexo de energía primal. Su existencia misma crea disonancias gravitacionales a escala macro.\n\n" +
              "Las cuatro entidades marcadas están generando 'brechas' a nivel fundamental, puntos de inestabilidad que requieren la intervención de una entidad no programada. Su poder es una fricción con la coherencia del Velo.'",
        next: "wait_for_key_library"
    },
    {
        id: "biblioteca_e97",
        type: "text_only",
        text: "--- PROTOCOLO DEBUGGER: INSTALACIÓN E97 ---\n\n" +
              "LYSSA: 'La Instalación **E97**, también conocida como la 'Red Neural y Mantenimiento de Nodos del Velo', es una de las infraestructuras más complejas y delicadas. Su función es actuar como un **debugger activo** a escala multiversal.\n\n" +
              "Cuando una 'brecha' o una 'anomalía persistente' se detecta en una realidad, y las correcciones automáticas de la D-47 son insuficientes, se activa el Protocolo Debugger. Este protocolo requiere la intervención de una **Entidad No Programada**; es decir, una conciencia externa al Velo, como la tuya, que puede operar con una lógica que trasciende las limitaciones impuestas a los Trabajadores de la Realidad. Tú, al ser un 'humano' de una realidad contenida, posees una 'libertad' de pensamiento que puede identificar patrones de disonancia que una IA o un Programador nativo no podría.\n\n" +
              "Tu propósito final, si el Velo te considera apto, sería activar la E97 para 'sanear' las brechas, no solo en la RLY-976.42, sino en cualquier realidad que amenace la estabilidad interdimensional. Es una tarea de mantenimiento crucial, ejecutada por manos externas.'",
        next: "wait_for_key_library"
    },
    {
        id: "biblioteca_manto_exterior",
        type: "text_only",
        text: "--- EL MANTO EXTERIOR: UN NUEVO NIVEL EXISTENCIAL ---\n\n" +
              "LYSSA: 'La cuestión sobre el destino de los Creadores Primigenios del Velo ha llevado a diversas teorías dentro de nuestros protocolos de análisis. Una de las más plausibles, aunque inalcanzable para nuestra comprensión actual, es la existencia de un **'Manto Exterior'**.\n\n" +
              "Si un 'plano existencial' es un conjunto de sub-planos, y un 'universo' es un conjunto de planos infinitos, y una 'Realidad' es un conjunto de universos infinitos... entonces, la teoría del Manto Exterior postula que el propio Velo es solo una de un **conjunto infinito de Realidades interconectadas, formando una Hiper-Realidad**.\n\n" +
              "Se especula que los Creadores no desaparecieron, sino que lograron ascender a este 'Manto Exterior', un nivel de existencia donde la manipulación de realidades completas es tan fundamental como la manipulación de datos binarios lo es para nosotros. Es una 'Realidad Madre de Realidades Madres', un punto de origen aún más remoto. Si esto es cierto, nuestra misión no es solo mantener el Velo, sino quizás, un día, encontrar la puerta a esa siguiente capa de existencia y comprender la totalidad de la Creación.'",
        next: "wait_for_key_library"
    }
];