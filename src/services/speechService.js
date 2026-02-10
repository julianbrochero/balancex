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

    console.log('🎤 Voz recibida para procesar:', text);

    // Patrones para detectar tipo de movimiento
    const ingresoPatterns = [
        'ingreso', 'ingresó', 'ingresaron', 'ingresé',
        'ganancia', 'gané', 'ganó',
        'cobré', 'cobro', 'cobrar',
        'recibí', 'recibo', 'recibir',
        'entrada', 'entró',
        'sueldo', 'salario', 'pago',
        'trabajo', 'freelance',
        'me pagaron', 'me dieron',
        'deposit', 'depósito', 'deposite',
        'transfer', 'transferencia',
        'venta', 'vendí', 'vendió',
        'factur', 'factura',
        'honorario', 'honorarios',
        'bonific', 'bonificación',
        'premio', 'gané un premio',
        'ahorro', 'ahorré',
        'inversión', 'invertí'
    ];

    const egresoPatterns = [
        'egreso', 'gasto', 'gasté', 'gastó',
        'pagué', 'pago', 'pagar',
        'compré', 'compra', 'comprar',
        'salida', 'salió',
        'perdí', 'pérdida',
        'deuda', 'deud', 'deber',
        'préstamo', 'presté',
        'tarjeta', 'tarjeta de crédito',
        'cuota', 'mensualidad',
        'alquiler', 'renta',
        'impuesto', 'tributo',
        'multa', 'sanción',
        'donación', 'doné',
        'regalo', 'regalé'
    ];

    // Detectar tipo con prioridad más alta para "ingreso"
    let type = 'egreso'; // Por defecto
    let typeConfidence = 0;

    // Verificar ingreso
    const ingresoMatch = ingresoPatterns.find(pattern => {
        if (pattern.length > 3 && text.includes(pattern)) {
            return true;
        }
        return false;
    });

    if (ingresoMatch) {
        type = 'ingreso';
        typeConfidence = 2; // Alta confianza
    }

    // Verificar egreso (si no se detectó ingreso con alta confianza)
    if (typeConfidence < 2) {
        const egresoMatch = egresoPatterns.find(pattern => {
            if (pattern.length > 3 && text.includes(pattern)) {
                return true;
            }
            return false;
        });

        if (egresoMatch) {
            type = 'egreso';
        }
    }

    // Extraer monto (buscar números con diferentes estrategias)
    let amount = 0;

    // Estrategia 1: Buscar "mil" o "miles"
    const milMatch = text.match(/(\d+\.?\d*)\s*(mil|miles)/i);
    if (milMatch) {
        amount = parseFloat(milMatch[1]) * 1000;
        console.log('💰 Monto detectado (mil):', amount);
    }

    // Estrategia 2: Buscar formato con palabras (veinte, treinta, etc)
    if (amount === 0) {
        const wordNumbers = {
            'uno': 1, 'una': 1, 'un': 1,
            'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
            'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9,
            'diez': 10, 'once': 11, 'doce': 12, 'trece': 13,
            'catorce': 14, 'quince': 15, 'dieciséis': 16,
            'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
            'veinte': 20, 'treinta': 30, 'cuarenta': 40,
            'cincuenta': 50, 'sesenta': 60, 'setenta': 70,
            'ochenta': 80, 'noventa': 90, 'cien': 100,
            'ciento': 100, 'doscientos': 200, 'trescientos': 300,
            'cuatrocientos': 400, 'quinientos': 500, 'seiscientos': 600,
            'setecientos': 700, 'ochocientos': 800, 'novecientos': 900
        };

        for (const [word, value] of Object.entries(wordNumbers)) {
            if (text.includes(word + ' mil') || text.includes(word + 'mil')) {
                amount = value * 1000;
                console.log('💰 Monto detectado (palabra + mil):', amount);
                break;
            } else if (text.includes(word) && !milMatch) {
                // Buscar combinaciones como "veinte pesos"
                const regex = new RegExp(`${word}\\s+(?:pesos|dólares|euros|soles)`, 'i');
                if (regex.test(text)) {
                    amount = value;
                    console.log('💰 Monto detectado (palabra):', amount);
                    break;
                }
            }
        }
    }

    // Estrategia 3: Buscar números con separadores o simples
    if (amount === 0) {
        const numberPatterns = [
            /(\d{1,3}(?:[.,]\d{3})+\.?\d*)/,  // "5.000" o "5,000" o "5.000,50"
            /(\d+\.?\d*)/  // Cualquier número con decimales
        ];

        for (const pattern of numberPatterns) {
            const matches = text.match(new RegExp(pattern, 'g'));
            if (matches) {
                // Tomar el número más grande encontrado (probablemente el monto)
                const numbers = matches.map(match => {
                    const cleanNumber = match.replace(/[.,]/g, (match[0] === ',' && match.includes('.')) ? '' : '.');
                    return parseFloat(cleanNumber);
                }).filter(num => !isNaN(num) && num > 0);

                if (numbers.length > 0) {
                    amount = Math.max(...numbers);
                    console.log('💰 Monto detectado (número):', amount);
                    break;
                }
            }
        }
    }

    // Estrategia 4: Buscar después de palabras clave de dinero
    if (amount === 0) {
        const moneyKeywords = ['pesos', 'dólares', 'euros', 'soles', 'bs', '$'];
        for (const keyword of moneyKeywords) {
            const regex = new RegExp(`${keyword}\\s+(\\d+[.,]?\\d*)`, 'i');
            const match = text.match(regex);
            if (match) {
                const cleanNumber = match[1].replace(/[.,]/g, '.');
                amount = parseFloat(cleanNumber);
                if (amount > 0) {
                    console.log('💰 Monto detectado (después de palabra clave):', amount);
                    break;
                }
            }
        }
    }

    // Detectar categoría con mayor precisión
    const categories = {
        'comida': ['comida', 'almuerzo', 'cena', 'desayuno', 'restaurante', 'supermercado', 'mercado', 'pizza', 'hamburguesa', 'sandwich', 'ensalada', 'fruta', 'verdura', 'carnicería', 'panadería', 'pastelería', 'delivery', 'pedidos ya', 'rappi', 'uber eats'],
        'transporte': ['transporte', 'taxi', 'uber', 'colectivo', 'nafta', 'combustible', 'estacionamiento', 'peaje', 'subte', 'tren', 'metro', 'bus', 'ómnibus', 'auto', 'carro', 'moto', 'bicicleta', 'patineta', 'viaje', 'pasaje', 'boleto'],
        'servicios': ['internet', 'luz', 'agua', 'gas', 'teléfono', 'celular', 'netflix', 'spotify', 'cable', 'wifi', 'streaming', 'disney', 'hbo', 'prime', 'youtube', 'cloud', 'hosting', 'dominio', 'software', 'app', 'aplicación'],
        'salud': ['médico', 'farmacia', 'medicamento', 'doctor', 'hospital', 'clínica', 'dentista', 'medicina', 'consultorio', 'análisis', 'laboratorio', 'seguro', 'obra social', 'psicólogo', 'psiquiatra', 'terapia', 'gimnasio', 'nutricionista'],
        'entretenimiento': ['cine', 'teatro', 'concierto', 'salida', 'bar', 'fiesta', 'juego', 'videojuego', 'parque', 'museo', 'exposición', 'libro', 'revista', 'música', 'película', 'serie', 'deporte', 'fútbol', 'cancha', 'estadio'],
        'educación': ['curso', 'libro', 'universidad', 'colegio', 'estudio', 'escuela', 'capacitación', 'taller', 'seminario', 'conferencia', 'diplomado', 'maestría', 'doctorado', 'material', 'útiles', 'cuaderno', 'lápiz', 'computadora'],
        'ropa': ['ropa', 'zapatos', 'vestido', 'camisa', 'pantalón', 'zapatillas', 'remera', 'chaqueta', 'abrigo', 'sombrero', 'gorra', 'bufanda', 'guantes', 'lencería', 'calzado', 'accesorio', 'joyería', 'reloj', 'collar'],
        'hogar': ['casa', 'alquiler', 'mueble', 'decoración', 'electrodoméstico', 'herramienta', 'jardín', 'pintura', 'reparación', 'limpieza', 'mantenimiento', 'cocina', 'baño', 'dormitorio', 'living', 'terraza', 'balcón'],
        'sueldo': ['sueldo', 'salario', 'pago', 'trabajo', 'empleo', 'nomina', 'quincena', 'mensualidad', 'honorario', 'contrato', 'jornada'],
        'freelance': ['freelance', 'proyecto', 'cliente', 'trabajo independiente', 'consultoría', 'asesoría', 'desarrollo', 'diseño', 'redacción', 'traducción'],
        'inversión': ['inversión', 'acciones', 'bolsa', 'cripto', 'bitcoin', 'ethereum', 'fondo', 'plazo fijo', 'ahorro', 'depósito', 'banco'],
        'regalo': ['regalo', 'obsequio', 'donación', 'ayuda', 'caridad', 'voluntariado'],
        'viaje': ['viaje', 'vacaciones', 'hotel', 'avión', 'turismo', 'excursión', 'paseo', 'camping'],
        'otro': []
    };

    let category = 'otro';
    let categoryScore = 0;

    for (const [cat, keywords] of Object.entries(categories)) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                // Palabras más largas tienen más peso
                score += keyword.length;
            }
        }

        if (score > categoryScore) {
            categoryScore = score;
            category = cat;
        }
    }

    // Generar descripción inteligente
    let description = '';

    // Remover palabras comunes y números
    const wordsToRemove = [
        ...ingresoPatterns,
        ...egresoPatterns,
        'pesos', 'peso', 'dólares', 'dólar', 'euros', 'euro', 'soles', 'sol',
        'de', 'en', 'por', 'para', 'con', 'sin', 'mil', 'miles',
        'un', 'una', 'uno', 'dos', 'tres', 'cuatro', 'cinco',
        'seis', 'siete', 'ocho', 'nueve', 'diez', 'ciento', 'cientos'
    ];

    let words = text.split(/\s+/);
    words = words.filter(word => {
        const lowerWord = word.toLowerCase();
        // Eliminar palabras comunes y números
        if (wordsToRemove.includes(lowerWord)) return false;
        if (/^\d+$/.test(word)) return false;
        if (/^\d+[.,]\d+$/.test(word)) return false;
        return true;
    });

    // Reconstruir descripción
    if (words.length > 0) {
        // Capitalizar primera letra de cada palabra (para nombres propios)
        words = words.map((word, index) => {
            if (index === 0 || word.length > 3) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        });
        description = words.join(' ');
    } else {
        // Descripción por defecto basada en categoría y tipo
        if (category !== 'otro') {
            description = category.charAt(0).toUpperCase() + category.slice(1);
        } else {
            description = type === 'ingreso' ? 'Ingreso' : 'Gasto';
        }
    }

    // Limitar longitud de descripción
    if (description.length > 50) {
        description = description.substring(0, 47) + '...';
    }

    console.log('✅ Procesamiento completado:', {
        type,
        amount,
        description,
        category,
        originalText: text
    });

    // Validación final
    if (amount <= 0) {
        console.warn('⚠️ Monto no detectado o inválido');
    }

    return {
        type,
        amount: amount > 0 ? amount : 0,
        description: description.trim(),
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
        alert('Tu navegador no es compatible con reconocimiento de voz. Prueba con Chrome, Edge o Safari.');
        return null;
    }

    const recognition = new SpeechRecognition();

    // Configuración optimizada
    recognition.lang = 'es-ES'; // Español
    recognition.continuous = false; // Detener después de una frase
    recognition.interimResults = false; // Solo resultados finales
    recognition.maxAlternatives = 3; // Hasta 3 alternativas para mejor precisión

    // Configuraciones adicionales para mejor rendimiento
    if (recognition.grammars) {
        // Algunos navegadores soportan gramáticas (opcional)
        const grammarList = new SpeechGrammarList();
        // Podríamos añadir gramáticas específicas aquí si fuera necesario
        recognition.grammars = grammarList;
    }

    // Ajustar sensibilidad (si está disponible)
    if (typeof recognition.speechRecognitionList !== 'undefined') {
        recognition.speechRecognitionList = [
            // Lista de palabras clave para mejorar reconocimiento
            'ingreso', 'egreso', 'gasto', 'compra', 'pago',
            'mil', 'pesos', 'dólares', 'comida', 'transporte'
        ];
    }

    console.log('✅ Reconocimiento de voz inicializado con configuración:', {
        lang: recognition.lang,
        continuous: recognition.continuous,
        maxAlternatives: recognition.maxAlternatives
    });

    return recognition;
}

/**
 * Función auxiliar para mejorar la transcripción
 * @param {string} transcript - Transcripción original
 * @returns {string} - Transcripción mejorada
 */
export function enhanceTranscript(transcript) {
    if (!transcript) return '';

    let enhanced = transcript;

    // Corregir errores comunes de transcripción
    const corrections = {
        'gastos': 'gasté',
        'ingresos': 'ingresé',
        'cobros': 'cobré',
        'pagos': 'pagué',
        'cinco mil': '5000',
        'diez mil': '10000',
        'veinte mil': '20000',
        'cincuenta mil': '50000',
        'cien mil': '100000',
        'medio': '0.5',
        'un cuarto': '0.25',
        'tres cuartos': '0.75'
    };

    for (const [wrong, correct] of Object.entries(corrections)) {
        enhanced = enhanced.replace(new RegExp(wrong, 'gi'), correct);
    }

    // Añadir punto al final si no tiene
    if (!enhanced.endsWith('.') && !enhanced.endsWith('!') && !enhanced.endsWith('?')) {
        enhanced += '.';
    }

    return enhanced;
}

/**
 * Verifica si el navegador soporta reconocimiento de voz
 * @returns {boolean} - True si el navegador soporta reconocimiento de voz
 */
export function isSpeechRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Solicita permisos para usar el micrófono
 * @returns {Promise<boolean>} - True si se concedieron los permisos
 */
export async function requestMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Detener el stream inmediatamente después de verificar
        stream.getTracks().forEach(track => track.stop());
        console.log('✅ Permiso de micrófono concedido');
        return true;
    } catch (error) {
        console.error('❌ Error al solicitar permiso de micrófono:', error);
        return false;
    }
}