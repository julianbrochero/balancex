import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Solo para desarrollo, en producción usar un backend
});

/**
 * Transcribe audio usando Whisper AI de OpenAI
 * @param {Blob} audioBlob - Audio grabado en formato Blob
 * @returns {Promise<string>} - Texto transcrito
 */
export async function transcribeAudio(audioBlob) {
    try {
        // Convertir Blob a File (Whisper requiere un File)
        const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

        console.log('🎤 Enviando audio a Whisper AI...');

        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'es', // Español
            response_format: 'text'
        });

        console.log('✅ Transcripción recibida:', transcription);
        return transcription;

    } catch (error) {
        console.error('❌ Error en transcripción:', error);
        throw new Error('Error al transcribir el audio: ' + error.message);
    }
}

/**
 * Procesa el texto transcrito para extraer información del movimiento
 * @param {string} transcript - Texto transcrito
 * @returns {Object} - {type, amount, description, category}
 */
export function processTranscript(transcript) {
    const text = transcript.toLowerCase().trim();

    // Patrones para detectar tipo de movimiento
    const ingresoPatterns = [
        'ingreso', 'ingresó', 'ingresaron', 'ingresé',
        'ganancia', 'gané', 'ganó',
        'cobré', 'cobro', 'cobrar',
        'recibí', 'recibo', 'recibir',
        'entrada', 'entró',
        'sueldo', 'salario', 'pago',
        'trabajo', 'freelance'
    ];

    const egresoPatterns = [
        'egreso', 'gasto', 'gasté', 'gastó',
        'pagué', 'pago', 'pagar',
        'compré', 'compra', 'comprar',
        'salida', 'salió',
        'perdí', 'pérdida'
    ];

    // Detectar tipo
    let type = 'egreso'; // Por defecto
    if (ingresoPatterns.some(pattern => text.includes(pattern))) {
        type = 'ingreso';
    } else if (egresoPatterns.some(pattern => text.includes(pattern))) {
        type = 'egreso';
    }

    // Extraer monto (buscar números)
    // Soporta formatos: 5000, 5.000, 5,000, 12000, 200000, etc.
    const numberPatterns = [
        /(\d+\.?\d*)\s*mil/i,  // "12 mil" -> 12000
        /(\d{1,3}(?:[.,]\d{3})+)/,  // "5.000" o "5,000"
        /(\d+)/  // Cualquier número
    ];

    let amount = 0;

    // Primero buscar "mil"
    const milMatch = text.match(/(\d+\.?\d*)\s*mil/i);
    if (milMatch) {
        amount = parseFloat(milMatch[1]) * 1000;
    } else {
        // Buscar números con separadores o simples
        for (const pattern of numberPatterns) {
            const match = text.match(pattern);
            if (match) {
                // Limpiar separadores de miles
                const cleanNumber = match[1].replace(/[.,]/g, '');
                amount = parseFloat(cleanNumber);
                if (amount > 0) break;
            }
        }
    }

    // Detectar categoría
    const categories = {
        'comida': ['comida', 'almuerzo', 'cena', 'desayuno', 'restaurante', 'supermercado', 'mercado'],
        'transporte': ['transporte', 'taxi', 'uber', 'colectivo', 'nafta', 'combustible', 'estacionamiento'],
        'servicios': ['internet', 'luz', 'agua', 'gas', 'teléfono', 'celular', 'netflix', 'spotify'],
        'salud': ['médico', 'farmacia', 'medicamento', 'doctor', 'hospital', 'clínica'],
        'entretenimiento': ['cine', 'teatro', 'concierto', 'salida', 'bar', 'fiesta'],
        'educación': ['curso', 'libro', 'universidad', 'colegio', 'estudio'],
        'ropa': ['ropa', 'zapatos', 'vestido', 'camisa', 'pantalón'],
        'hogar': ['casa', 'alquiler', 'mueble', 'decoración'],
        'sueldo': ['sueldo', 'salario', 'pago', 'trabajo'],
        'freelance': ['freelance', 'proyecto', 'cliente'],
        'otro': []
    };

    let category = 'otro';
    for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            category = cat;
            break;
        }
    }

    // Generar descripción limpia
    let description = transcript;

    // Remover palabras de acción comunes
    const wordsToRemove = [
        ...ingresoPatterns,
        ...egresoPatterns,
        'pesos', 'peso', 'de', 'en', 'por', 'mil'
    ];

    let cleanDesc = text;
    wordsToRemove.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        cleanDesc = cleanDesc.replace(regex, '');
    });

    // Remover números
    cleanDesc = cleanDesc.replace(/\d+/g, '').trim();

    // Capitalizar primera letra
    if (cleanDesc.length > 0) {
        description = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
    } else {
        description = type === 'ingreso' ? 'Ingreso' : 'Gasto';
    }

    return {
        type,
        amount,
        description: description.trim() || (type === 'ingreso' ? 'Ingreso' : 'Gasto'),
        category
    };
}
