import { useState, useRef } from 'react';

/**
 * Hook personalizado para grabar audio usando MediaRecorder API
 */
export function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            // Solicitar permiso para usar el micrófono
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Crear MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            // Evento cuando hay datos disponibles
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            // Evento cuando se detiene la grabación
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);

                // Detener el stream
                stream.getTracks().forEach(track => track.stop());
            };

            // Iniciar grabación
            mediaRecorder.start();
            setIsRecording(true);

            console.log('🎤 Grabación iniciada');

        } catch (error) {
            console.error('❌ Error al iniciar grabación:', error);
            alert('No se pudo acceder al micrófono. Por favor, permite el acceso.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            console.log('⏹️ Grabación detenida');
        }
    };

    const resetRecording = () => {
        setAudioBlob(null);
        chunksRef.current = [];
    };

    return {
        isRecording,
        audioBlob,
        startRecording,
        stopRecording,
        resetRecording
    };
}
