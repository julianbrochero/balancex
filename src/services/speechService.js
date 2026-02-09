/**
 * Servicio de reconocimiento de voz usando Web Speech API (GRATUITO)
 * No requiere API keys ni conexión a internet
 * Funciona directamente en el navegador
 */

/**
 * Procesa el texto transcrito para extraer información del movimiento
 * @param {string} transcript - Texto transcrito
 * @returns {Object} - {type, amount, description, category}
 */
export function processTranscript(transcript) {
    const text = transcript.toLowerCase().trim();

    console.log('🧠 Procesando:', text);

    // Patrones para detectar tipo de movimiento
    const ingresoPatterns = [
        'ingreso', 'ingresó', 'ingresaron', 'ingresé',
        'ganancia', 'gané', 'ganó',
        'cobré', 'cobro', 'cobrar',
        'recibí', 'recibo', 'recibir',
        'entrada', 'entró',
        'sueldo', 'salario', 'pago',
        'trabajo', 'freelance',
        'me pagaron', 'me dieron'
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
    let amount = 0;

    // Primero buscar "mil" o "miles"
    const milMatch = text.match(/(\d+\.?\d*)\s*(mil|miles)/i);
    if (milMatch) {
        amount = parseFloat(milMatch[1]) * 1000;
    } else {
        // Buscar números con separadores o simples
        const numberPatterns = [
            /(\d{1,3}(?:[.,]\d{3})+)/,  // "5.000" o "5,000"
            /(\d+)/  // Cualquier número
        ];

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
        'comida': ['comida', 'almuerzo', 'cena', 'desayuno', 'restaurante', 'supermercado', 'mercado', 'pizza', 'hamburguesa'],
        'transporte': ['transporte', 'taxi', 'uber', 'colectivo', 'nafta', 'combustible', 'estacionamiento', 'peaje', 'subte', 'tren'],
        'servicios': ['internet', 'luz', 'agua', 'gas', 'teléfono', 'celular', 'netflix', 'spotify', 'cable', 'wifi'],
        'salud': ['médico', 'farmacia', 'medicamento', 'doctor', 'hospital', 'clínica', 'dentista', 'medicina'],
        'entretenimiento': ['cine', 'teatro', 'concierto', 'salida', 'bar', 'fiesta', 'juego', 'videojuego'],
        'educación': ['curso', 'libro', 'universidad', 'colegio', 'estudio', 'escuela', 'capacitación'],
        'ropa': ['ropa', 'zapatos', 'vestido', 'camisa', 'pantalón', 'zapatillas', 'remera'],
        'hogar': ['casa', 'alquiler', 'mueble', 'decoración', 'electrodoméstico'],
        'sueldo': ['sueldo', 'salario', 'pago', 'trabajo'],
        'freelance': ['freelance', 'proyecto', 'cliente', 'trabajo independiente'],
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
        'pesos', 'peso', 'de', 'en', 'por', 'mil', 'miles'
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

    console.log('✅ Procesado:', { type, amount, description, category });

    return {
        type,
        amount,
        description: description.trim() || (type === 'ingreso' ? 'Ingreso' : 'Gasto'),
        category
    };
}

/**
 * Inicializa el reconocimiento de voz del navegador
 * @returns {SpeechRecognition|null} - Instancia de SpeechRecognition o null si no está soportado
 */
export function initSpeechRecognition() {
    // Verificar soporte del navegador
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error('❌ Tu navegador no soporta reconocimiento de voz');
        return null;
    }

    const recognition = new SpeechRecognition();

    // Configuración
    recognition.lang = 'es-ES'; // Español
    recognition.continuous = false; // Detener después de una frase
    recognition.interimResults = false; // Solo resultados finales
    recognition.maxAlternatives = 1; // Una sola alternativa

    console.log('✅ Reconocimiento de voz inicializado');

    return recognition;
}
