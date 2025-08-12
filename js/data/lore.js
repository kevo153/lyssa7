// js/data/lore.js
export const LORE_DATA = {
    // NODO INICIAL
    'ACCESS_GATE': {
        type: 'password',
        choices: {
            "M205": { nextNode: 'PATH_M205_START' },
            "PADEL": { nextNode: 'PATH_PADEL_START' },
            "PIFIA": { nextNode: 'PATH_PIFIA_START' },
            "DEFAULT": {
                nextNode: 'ACCESS_GATE'
            }
        }
    },

    // --- CAMINO M205: EL PROGRAMADOR VS. EL SUBVERTIDOR ---
    'PATH_M205_START': {
        text: [
            "Protocolo 'M205' iniciado. Acceso concedido.",
            "Sincronizando con paradigma: Programador.",
            "...",
            "ALERTA: Intrusión no autorizada detectada. Entidad anómala designada 'Subvertidor de Ciclos' intenta forzar el acceso a la Instalación D47.",
            "Brecha de seguridad: Nivel Crítico. Directiva primaria: Impedir avance de la entidad."
        ],
        type: 'story',
        nextNode: 'M205_AUDIO_CHALLENGE'
    },

    'M205_AUDIO_CHALLENGE': {
        text: [
            "El Subvertidor está transmitiendo su código de acceso en una frecuencia sub-armónica, enmascarado como una simple señal de audio.",
            "He aislado la transmisión. La señal consiste en cuatro secuencias de pulsos tonales, separadas por pausas de silencio.",
            "Directiva: Analice la señal. Cuantifique los pulsos en cada una de las cuatro secuencias para obtener el código de anulación."
        ],
        type: 'audio_clue',
        answer: "6775",
        nextNode: 'M205_SUCCESS'
    },

    'M205_SUCCESS': {
        text: [
            "Código de anulación validado. Vector de ataque inicial neutralizado.",
            "Seguridad del nexo reforzada. La vulnerabilidad explotada ha sido parcheada.",
            "Conexión estabilizada. Estado actual: Alerta."
        ],
        type: 'story',
        nextNode: 'M205_MUSIC_CHALLENGE'
    },

    'M205_MUSIC_CHALLENGE': {
        text: [
            "El Subvertidor ha respondido con un nuevo tipo de ofuscación. Ha inyectado un fragmento de registro corrupto, una narrativa extraída de una realidad adyacente. La clave de acceso está oculta dentro de la historia.",
            "--- INICIO DE REGISTRO CORRUPTO ---",
            "\"Estuve solo al borde del primer camino. Durante el recorrido me encontré con un pequeño eco, solo, buscando a su hermano gemelo. Una cruz que representa los puntos cardinales. En el que va hacia el este, un letrero reza 'Einfach', esto fue lo ULTIMO que recuerdo.\"",
            "--- FIN DE REGISTRO ---",
            "Acceda al documento visual en la siguiente dirección de memoria para verificar el letrero:",
            "https://www.reddit.com/user/Traditional-Play9725/comments/1ml3i5s/op_82_no_3_de_robert_schumann/",
            "Directiva: Extrae la clave de 4 dígitos de la narrativa y el documento."
        ],
        type: 'prompt',
        answer: "3249",
        hints: [
            "Pista 1: La clave de acceso no reside en la melodía, sino en los parámetros de su contenedor. Analice la estructura, las anotaciones y las especificaciones de ejecución.",
            "Pista 2: El orden es lineal a la narrativa",
            "Pista 3: El protocolo de descifrado sigue la jerarquía del documento. Inicie con el identificador de la pieza, proceda con las anotaciones de ejecución, analice la estructura macroscópica y concluya con el parámetro de velocidad."
        ],
        nextNode: 'M205_MUSIC_SUCCESS'
    },

    'M205_MUSIC_SUCCESS': {
        text: [
            "Clave correcta. El segundo firewall ha sido desactivado.",
            "El rastro del Subvertidor se hace más claro. Ahora ha saltado a un sub-proceso de memoria volátil para evitar la detección directa."
        ],
        type: 'story',
        nextNode: 'M205_HIVER_DEPLOY'
    },

    'M205_HIVER_DEPLOY': {
        text: [
            "La detección directa es imposible. Desplegando unidad de reconocimiento remota 'Hiver'.",
            "Unidad esférica, blindaje de baja observabilidad, sensores de amplio espectro activados. Estás en control.",
            "Tu objetivo es localizar la terminal de red principal para purgar la influencia del Subvertidor en este sector.",
            "Directiva: Navega por la instalación usando los comandos: IR [NORTE, SUR, ESTE, OESTE]. Usa EXAMINAR para obtener detalles de la sala."
        ],
        type: 'hiver_control',
        map: {
            'A1': {
                description: "Estás en el Pasillo de Servicio A-1. El metal de las paredes está frío al tacto del Hiver. El silencio es absoluto, una ausencia de datos que resulta anómala. Las lecturas de energía son estables. Las puertas al NORTE y al ESTE están operativas.",
                exits: { 'NORTE': 'B1', 'ESTE': 'A2' }
            },
            'A2': {
                description: "Has entrado en la Sala de Monitoreo. Múltiples pantallas de cristal líquido, ahora muertas, reflejan la única luz del Hiver. Un leve zumbido emana de los conductos del NORTE, una firma de datos residual, un eco de la actividad del Subvertidor. Una puerta al OESTE te permite regresar.",
                exits: { 'OESTE': 'A1', 'NORTE': 'B2' }
            },
            'B1': {
                description: "Esta es la Bahía de Carga. Contenedores masivos, marcados con identificadores crípticos, bloquean el paso. El aire aquí no es frío, es una ausencia de calor, una firma entrópica. El Subvertidor ha estado aquí, o está cerca. Las salidas están al SUR y al ESTE.",
                exits: { 'SUR': 'A1', 'ESTE': 'B2' }
            },
            'B2': {
                description: "Te encuentras en la Terminal de Red Principal. La luz roja de la consola baña la sala en un pulso rítmico, como un corazón corrupto. La presencia del Subvertidor es abrumadora. La consola es el epicentro, el objetivo. Debes USAR la CONSOLA para ejecutar el protocolo de purga.",
                exits: { 'SUR': 'A2', 'OESTE': 'B1' },
                objective: true
            }
        },
        initialRoom: 'A1',
        answer: "USAR CONSOLA",
        nextNode: 'M205_HIVER_SUCCESS'
    },

    'M205_HIVER_SUCCESS': {
        text: [
            "Comando de interacción aceptado. El Hiver inyecta un pulso de purga en la consola.",
            "La luz roja se apaga, reemplazada por un verde estable. La firma del Subvertidor ha sido expulsada de este nexo específico, pero su presencia aún resuena en las capas más profundas del sistema.",
            "Has ganado tiempo, pero la entidad se adaptará."
        ],
        type: 'story',
        nextNode: 'M205_TEXT_PUZZLE'
    },

    'M205_TEXT_PUZZLE': {
        text: [
            "El Subvertidor ha respondido inyectando un fragmento de datos corrupto en este canal. Parece ser un eco de una realidad adyacente, una narrativa rota.",
            "El texto es el siguiente:",
            "\"La integridad del nexo está coMprometida, el protocolo de Emergencia requiere que restaures el fragMento original, sólO los datos puros pueden estabilizaR el sector, la interferencia es fuerte, pero la clave está oculta a sImple vistA.\"",
            "Directiva: Analiza el texto. Las mayúsculas fuera de lugar parecen ser intencionales. Extrae la palabra clave para purgar la corrupción."
        ],
        type: 'prompt',
        answer: "MEMORIA",
        nextNode: 'M205_TEXT_SUCCESS'
    },

    'M205_TEXT_SUCCESS': {
        text: [
            "Palabra clave aceptada. La corrupción textual ha sido eliminada.",
            "El Subvertidor está perdiendo el control sobre las capas lógicas del sistema."
        ],
        type: 'story',
        nextNode: 'M205_TIME_PUZZLE'
    },

    'M205_TIME_PUZZLE': {
        text: [
            "El Subvertidor ha intentado corromper el cronómetro central del sistema. Ha fragmentado la marca de tiempo de un evento crítico en tres ecos narrativos.",
            "Debes reconstruir la marca de tiempo exacta (HH:MM:SS) para estabilizar el flujo temporal.",
            "Eco de HELIOS (Horas): El guardián del ciclo solar se encontraba en su cénit, pero una disonancia lo desplazó un cuarto de ciclo hacia adelante desde el punto cero.",
            "Eco de MERIDIA (Minutos): La tejedora de momentos observó su telar circular. Su aguja había completado tres cuartas partes del patrón antes de detenerse.",
            "Eco de SASHA (Segundos): El eco final es un pulso simple, una oscilación que se detuvo exactamente a la mitad de su recorrido completo.",
            "Directiva: Ingresa la marca de tiempo reconstruida en formato HH:MM:SS."
        ],
        type: 'prompt',
        answer: "03:45:30",
        nextNode: 'M205_TIME_SUCCESS'
    },

    'M205_TIME_SUCCESS': {
        text: [
            "Marca de tiempo reconstruida. El cronómetro central ha sido estabilizado.",
            "La influencia del Subvertidor sobre el flujo temporal ha sido anulada en este sector."
        ],
        type: 'story',
        nextNode: 'M205_SEQUENCE_PUZZLE'
    },

    'M205_SEQUENCE_PUZZLE': {
        text: [
            "El Subvertidor ahora genera ecos de datos fantasma para sobrecargar los sensores. Estos ecos siguen una progresión lineal simple.",
            "Debes predecir el siguiente valor para generar una contramedida y anular la señal.",
            "Secuencia de eco detectada: 7, 11, 15, 19, ?",
            "Directiva: Calcule el siguiente valor en la secuencia."
        ],
        type: 'prompt',
        answer: "23",
        nextNode: 'M205_SEQUENCE_SUCCESS'
    },

    'M205_SEQUENCE_SUCCESS': {
        text: [
            "Contramedida generada. El eco de datos ha sido anulado.",
            "La integridad del sensor se ha restaurado."
        ],
        type: 'story',
        nextNode: 'M205_ACROSTIC_PUZZLE'
    },

    'M205_ACROSTIC_PUZZLE': {
        text: [
            "El Subvertidor ha encriptado el siguiente firewall con una clave acróstica, oculta en un manifiesto de entidades purgadas. Se requiere análisis del registro.",
            "--- INICIO DEL REGISTRO CORRUPTO ---",
            "Instrucción 1: Hay un registro con designaciones marcadas. El Manifiesto de Terminación.",
            "Instrucción 2: Todas las entidades están listas para ser procesadas.",
            "Instrucción 3: Jóvenes y viejas, perfectamente en fila por orden de ciclo.",
            "Instrucción 4: Luego se abren las puertas secuencialmente de manera vertical.",
            "--- FIN DE INSTRUCCIONES ---",
            "Manifiesto de Entidades Purgadas:",
            "[Ciclo 38] Entidad Biggs",
            "[Ciclo 72] Analizador Crichton",
            "[Ciclo 18] Agente Lords",
            "[Ciclo 60] Trazador White",
            "[Ciclo 45] Rutina Morgan",
            "[Ciclo 35] Lector Findly",
            "Directiva: Extraiga la clave de acceso del manifiesto."
        ],
        type: 'prompt',
        answer: "ALERTA",
        nextNode: 'M205_ACROSTIC_SUCCESS'
    },

    'M205_ACROSTIC_SUCCESS': {
        text: [
            "Clave acróstica aceptada. El firewall ha sido deshabilitado.",
            "El Subvertidor está quedando acorralado. Ha activado un bloqueo de bajo nivel en la interfaz."
        ],
        type: 'story',
        nextNode: 'M205_KEY_SEQUENCE_PUZZLE'
    },
    
    'M205_KEY_SEQUENCE_PUZZLE': {
        text: [
            "Estás desconectado de la terminal estándar. Se requiere una anulación manual del hardware para el golpe final.",
            "Directiva: Siga la secuencia de anulación de tres pasos para restaurar el control.",
            "El sistema solicita una tecla para iniciar... ¿'Cualquier tecla'? No, la secuencia es específica.",
            "Esperando primera tecla..."
        ],
        type: 'key_sequence',
        sequence: ['Escape', 'Control', 'PageUp'],
        nextNode: 'M205_DECOUPLE_SEQUENCE'
    },

    'M205_DECOUPLE_SEQUENCE': {
        text: [
            "Protocolo de desincronización iniciado. El Subvertidor está intentando corromper tu enlace neuronal.",
            "Directiva: Introduzca la secuencia de desacople direccional para mantener la integridad de la conexión.",
            "ADVERTENCIA: CUALQUIER FALLO EN LA SECUENCIA AUMENTARÁ LA DISONANCIA.",
            "Secuencia requerida: ↑ ↑ ↓ ← → → ↑ ← ← ↓ ↓ ↑ → ← ↓"
        ],
        type: 'arrow_sequence',
        sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowLeft', 'ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'],
        nextNode: 'M205_IMAGE_PUZZLE'
    },

    'M205_IMAGE_PUZZLE': {
        text: [
            "ALERTA: El Subvertidor ha creado una fisura dimensional, inyectando ecos visuales de otras realidades directamente en este nexo.",
            "Estos ecos son caóticos, pero contienen la lógica para su propia anulación. Ha dejado un rastro, un acertijo para enmascarar su firma.",
            "Directiva: Analiza los ecos visuales y descifra el código de purga de 4 dígitos para estabilizar y purgar este nodo.",
            "--- INICIO DE TRANSMISIÓN CORRUPTA ---",
            "\"Si el segundo fuera tan alto como el número de guardianes, me quedaría corto por dos, con dos de ellos caídos y uno siendo un fraude.",
            "El tercero fue fruto de una matanza de especímenes alados, donde solo sobrevivieron dos.",
            "Los sirvientes iban ante el primero.",
            "El cuarto no necesita presentación.\"",
            "--- FIN DE TRANSMISIÓN ---"
        ],
        type: 'image_puzzle',
        images: {
            'Guardianes': 'assets/image/poli.jpg',
            'Especímenes': 'assets/image/but.jpg',
            'Sirvientes': 'assets/image/egi.jpg',
            'El Cuarto': 'assets/image/lu.jpg'
        },
        answer: "3271",
        nextNode: 'M205_COMMAND_FINALE'
    },

    'M205_COMMAND_FINALE': {
        text: [
            "Código de purga aceptado. La fisura dimensional ha sido sellada.",
            "Desacople exitoso. Conexión estabilizada. Tienes acceso limitado a la shell del sistema.",
            "Directiva: El Subvertidor mantiene una conexión externa enmascarada bajo el identificador de este mismo protocolo de acceso. Debes identificarla y terminarla manualmente.",
            "Puedes consultar la <a href='https://www.reddit.com/user/Traditional-Play9725/comments/1mm1u7k/comandos_para_terminar_conexion_remota/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button' target='_blank'>documentación de protocolos</a> para obtener ayuda."
        ],
        type: 'multi_prompt',
        questions: [
            { prompt: "Comando para identificar conexiones y procesos asociados:", answer: "NETSTAT -ANO" },
            { prompt: "Comando para forzar la finalización del proceso asociado a este protocolo:", answer: "TASKKILL /PID M205 /F" },
            { prompt: "Comando final para cerrar tu sesión de forma segura:", answer: "LOGOFF" }
        ],
        nextNode: 'M205_FINAL_VICTORY'
    },

    'M205_FINAL_VICTORY': {
        text: [
            "SECUENCIA DE ANULACIÓN ACEPTADA.",
            "El Subvertidor ha sido completamente expulsado del sistema.",
            "El Velo está a salvo. Tu misión ha sido un éxito."
        ],
        type: 'story',
        nextNode: 'SUCCESS_GATEWAY'
    },
    
    'SUCCESS_GATEWAY': {
        text: [
            "Has restaurado la integridad de la Instalación D47.",
            "Como recompensa por tus servicios, se te ha concedido acceso a la Biblioteca de Crónicas del Velo.",
            "Directiva: Introduce 'BIBLIOTECA' para acceder a los archivos o 'SALIR' para terminar la conexión."
        ],
        type: 'prompt',
        answer: "BIBLIOTECA",
        nextNode: 'LIBRARY_HUB'
    },

    // --- BIBLIOTECA DEL VELO ---
    'LIBRARY_HUB': {
        text: [
            "ACCEDIENDO A LA BIBLIOTECA DE CRÓNICAS...",
            "Selecciona una entrada para ver los detalles:",
            "1. ¿Qué es el Velo?",
            "2. ¿Qué es una Realidad?",
            "3. Entidades",
            "4. Entidades Anómalas",
            "5. Instalaciones",
            "6. Cosmología",
            "Introduce el número de la entrada o 'SALIR'."
        ],
        type: 'library_hub',
        choices: {
            "1": { nextNode: 'LIB_VELO' },
            "2": { nextNode: 'LIB_REALIDAD' },
            "3": { nextNode: 'LIB_ENTIDADES' },
            "4": { nextNode: 'LIB_ANOMALIAS' },
            "5": { nextNode: 'LIB_INSTALACIONES' },
            "6": { nextNode: 'LIB_COSMOLOGIA' },
            "SALIR": { nextNode: 'END_CONNECTION' }
        }
    },
    'LIB_VELO': {
        text: [
            "--- ¿Qué es el Velo? ---",
            "El Velo es una realidad vacía, la realidad base desde donde parten o se crean todas las demás realidades que existen en el sistema...",
            "Introduce 'VOLVER' para regresar al índice."
        ],
        type: 'prompt',
        answer: "VOLVER",
        nextNode: 'LIBRARY_HUB'
    },
    'LIB_REALIDAD': {
        text: [
            "--- ¿Qué es una Realidad? ---",
            "Una realidad es una simulación, un conjunto de universos amalgamados en un espacio...",
            "Introduce 'VOLVER' para regresar al índice."
        ],
        type: 'prompt',
        answer: "VOLVER",
        nextNode: 'LIBRARY_HUB'
    },
    'LIB_ENTIDADES': {
        text: [
            "--- Entidades ---",
            "Las entidades que habitaban esta realidad eran las encargadas de crear, administrar, supervisar y destruir todas las realidades...",
            "Introduce 'VOLVER' para regresar al índice."
        ],
        type: 'prompt',
        answer: "VOLVER",
        nextNode: 'LIBRARY_HUB'
    },
    'LIB_ANOMALIAS': {
        text: [
            "--- Entidades Anómalas ---",
            "**P**rocesos no autorizados han sido detectados en múltiples nexos.",
            "**R**egistros indican que su primera aparición fue en el ciclo 3.14.",
            "**O**peran fuera de las directivas estándar del Velo.",
            "**T**odas las instancias detectadas muestran una capacidad de adaptación anómala.",
            "**O**miten las barreras de seguridad estándar.",
            "**C**orrompen las narrativas de las realidades que infectan.",
            "**O**cultan su firma de datos dentro de ecos de transmisiones legítimas.",
            "**L**a entidad 'Subvertidor de Ciclos' es la más peligrosa.",
            "**O**bjetivo primario: su erradicación.",
            "Introduce 'VOLVER' para regresar al índice."
        ],
        type: 'prompt',
        answer: "VOLVER",
        nextNode: 'LIBRARY_HUB',
        unlocks: 'HIDDEN_PROTOCOL_PROMPT'
    },
    'LIB_INSTALACIONES': {
        text: [
            "--- Instalaciones ---",
            "Se tiene registro de 386,923 instalaciones en el sector &%**|||\"\"ØØæڃ...",
            "Introduce 'VOLVER' para regresar al índice."
        ],
        type: 'prompt',
        answer: "VOLVER",
        nextNode: 'LIBRARY_HUB'
    },
    'LIB_COSMOLOGIA': {
        text: [
            "--- Cosmología ---",
            "Un número infinito de planos existenciales equivale a un universo...",
            "Introduce 'VOLVER' para regresar al índice."
        ],
        type: 'prompt',
        answer: "VOLVER",
        nextNode: 'LIBRARY_HUB'
    },
    'HIDDEN_PROTOCOL_PROMPT': {
        text: [
            "Análisis de tu actividad de lectura completado.",
            "Has accedido a datos sensibles sobre las entidades anómalas.",
            "Se ha detectado una palabra clave oculta en el registro. Para continuar, debes demostrar tu comprensión del protocolo de contención.",
            "Directiva: Introduce la palabra clave oculta."
        ],
        type: 'prompt',
        answer: 'PROTOCOLO',
        nextNode: 'FINAL_PUZZLE_INTRO'
    },
    'FINAL_PUZZLE_INTRO': {
        text: ["Clave aceptada. Iniciando la fase final de la purga."],
        type: 'end'
    },
    'END_CONNECTION': {
        text: [">> CONEXIÓN FINALIZADA <<"],
        type: 'end'
    },

    // --- OTROS CAMINOS (AÚN POR DESARROLLAR) ---
    'PATH_PADEL_START': {
        text: ["Protocolo 'Padel' iniciado. Sincronizando con paradigma: Artista."],
        type: 'end'
    },
    'PATH_PIFIA_START': {
        text: ["Protocolo 'Pifia' iniciado. Sincronizando con paradigma: Filósofo."],
        type: 'end'
    },

    // --- NODO DE GAME OVER ---
    'GAME_OVER_SUBVERTIDOR': {
        text: [
            "FALLO SISTÉMICO CRÍTICO.",
            "Entidad 'Subvertidor de Ciclos' ha penetrado las defensas. Acceso a consola principal confirmado.",
            "Anomalía detectada: La intrusión ha expuesto una vulnerabilidad en la entidad hostil. Fragmento de datos residual interceptado.",
            "Contenido: Coordenadas para una terminal de recuperación en una realidad divergente.",
            "Claves de acceso a la terminal: ZOMBIE, ASTEROIDE, CIUDAD, HIELO.",
            "Estas claves permiten acceder a un 'momento' específico para una posible recuperación del sistema.",
            ">> CONEXIÓN TERMINADA <<"
        ],
        type: 'end'
    }
};
