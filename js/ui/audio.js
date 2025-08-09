// js/ui/audio.js
import { getElements } from './dom.js';

let audioContext;
let analyser;
let source;
let dataArray;
let animationFrameId;

const { clueAudioElement, spectrogram, playPauseButton } = getElements();
const canvasCtx = spectrogram.getContext('2d');

let isInitialized = false;
let isPlaying = false;

// Dibuja el espectograma en el canvas
function draw() {
    animationFrameId = requestAnimationFrame(draw);

    // Obtener los datos de frecuencia del analizador
    analyser.getByteTimeDomainData(dataArray);

    // Limpiar el canvas
    canvasCtx.fillStyle = '#000';
    canvasCtx.fillRect(0, 0, spectrogram.width, spectrogram.height);

    // Dibujar la línea del espectograma
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 255, 65)';
    canvasCtx.beginPath();

    const sliceWidth = spectrogram.width * 1.0 / analyser.frequencyBinCount;
    let x = 0;

    for (let i = 0; i < analyser.frequencyBinCount; i++) {
        const v = dataArray[i] / 128.0; // Normalizar el valor
        const y = v * spectrogram.height / 2;

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(spectrogram.width, spectrogram.height / 2);
    canvasCtx.stroke();
}

// Inicializa el reproductor de audio
function initAudio() {
    if (isInitialized) return;

    // Crear el contexto de audio (se debe hacer después de una interacción del usuario)
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    
    // Conectar el elemento de audio HTML al analizador
    source = audioContext.createMediaElementSource(clueAudioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    isInitialized = true;
    console.log("AudioContext inicializado.");
}

// Controla la reproducción y la pausa
function togglePlay() {
    // El AudioContext debe iniciarse con un gesto del usuario (como un clic)
    if (!isInitialized) {
        initAudio();
    }
    
    // Si el AudioContext estaba suspendido, lo reanudamos
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (isPlaying) {
        clueAudioElement.pause();
        playPauseButton.textContent = 'REANUDAR ANÁLISIS';
        cancelAnimationFrame(animationFrameId); // Detener la animación
    } else {
        clueAudioElement.play();
        playPauseButton.textContent = 'PAUSAR ANÁLISIS';
        draw(); // Iniciar la animación
    }

    isPlaying = !isPlaying;
}

// Se ejecuta cuando el audio termina de reproducirse
clueAudioElement.onended = () => {
    isPlaying = false;
    playPauseButton.textContent = 'REPETIR ANÁLISIS';
    cancelAnimationFrame(animationFrameId);
};

// Exportamos la función que el motor del juego usará
export function setupAudioPlayer() {
    playPauseButton.addEventListener('click', togglePlay);
}
