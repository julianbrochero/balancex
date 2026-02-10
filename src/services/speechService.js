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

    // Normalizar texto para facilitar búsqueda
    // Reemplazar "un millón" por "1 millón", "un mil" por "1 mil"
    let cleanText = text
        .replace(/\b(un|una)\s+(mill[oó]n|mil)/gi, '1 $2')
        .replace(/\b(medio)\s+(mill[oó]n)/gi, '0.5 $2');

    // Mapeo de palabras a números
    const wordNumbers = {
        'cero': 0, 'un': 1, 'uno': 1, 'una': 1,
        'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
        'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9,
        'diez': 10, 'once': 11, 'doce': 12, 'trece': 13,
        'catorce': 14, 'quince': 15, 'dieciséis': 16,
        'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
        'veinte': 20, 'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29,
        'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90,
        'cien': 100, 'ciento': 100, 'doscientos': 200, 'trescientos': 300, 'cuatrocientos': 400, 'quinientos': 500, 'seiscientos': 600, 'setecientos': 700, 'ochocientos': 800, 'novecientos': 900
    };

    // Estrategia 1: Detección de patrones "Número + Multiplicador" (ej: "10 mil", "diez mil", "1.5 millones")
    const multipliers = {
        'mil': 1000,
        'miles': 1000,
        'millón': 1000000,
        'millon': 1000000,
        'millones': 1000000,
        'palo': 1000000, // Jerga común
        'palos': 1000000,
        'luca': 1000,    // Jerga común
        'lucas': 1000
    };

    // Buscar "X mil/millones" donde X puede ser dígitos o palabras
    // Regex para encontrar el número base antes del multiplicador
    Object.entries(multipliers).forEach(([multWord, multVal]) => {
        if (amount > 0) return; // Si ya encontramos, saltar

        // A. Base numérica: "10 mil", "10.5 millones"
        const regexDigit = new RegExp(`(\\d+[.,]?\\d*)\\s*${multWord}`, 'i');
        const matchDigit = cleanText.match(regexDigit);

        if (matchDigit) {
            let numStr = matchDigit[1];
            // Normalizar separadores: "1.5" -> 1.5, "1,5" -> 1.5
            numStr = numStr.replace(',', '.');
            amount = parseFloat(numStr) * multVal;
            console.log(`💰 Monto detectado (dígito + ${multWord}):`, amount);
            return;
        }

        // B. Base en palabras: "diez mil", "veinte millones"
        // Buscar palabras numéricas seguidas del multiplicador
        for (const [word, val] of Object.entries(wordNumbers)) {
            if (cleanText.includes(`${word} ${multWord}`) || cleanText.includes(`${word}${multWord}`)) {
                amount = val * multVal;
                console.log(`💰 Monto detectado (palabra "${word}" + ${multWord}):`, amount);
                return;
            }
        }
    });

    // Estrategia 2: Si no hubo multiplicador, buscar número "suelto" (digits)
    // Manejar cuidadosamente "10.000" vs "10.00" según locale español
    if (amount === 0) {
        // Regex para capturar números con posibles separadores
        // Captura: 10000 | 10.000 | 10,000 | 10.000,50 | 10000.50
        const numberPattern = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)/g;
        const matches = cleanText.match(numberPattern);

        if (matches) {
            // Filtrar y procesar candidatos
            const candidates = matches.map(m => {
                // Limpiar el string para parsing
                let clean = m.trim();

                // Caso especial: "10.000" (sin coma decimal) -> 10000
                // Caso especial: "10,000" (con coma, posible mil) -> 10000 (si asumimos 3 decimales es raro para precios)

                // Heurística para Español (España/Latam):
                // . = miles
                // , = decimales
                // PERO a veces la API devuelve formato inglés (10,000.00)

                // Contar puntos y comas
                const dots = (clean.match(/\./g) || []).length;
                const commas = (clean.match(/,/g) || []).length;

                let val = 0;

                if (dots > 0 && commas > 0) {
                    // Formato mixto: asumir el último separador es el decimal
                    // "1.234,50" -> Español
                    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
                        val = parseFloat(clean.replace(/\./g, '').replace(',', '.'));
                    } else {
                        // "1,234.50" -> Inglés
                        val = parseFloat(clean.replace(/,/g, ''));
                    }
                } else if (dots > 0) {
                    // Solo puntos: "10.000" o "10.5"
                    // Si tiene bloques de 3 dígitos (10.000), es miles
                    if (/^\d{1,3}(\.\d{3})+$/.test(clean)) {
                        val = parseFloat(clean.replace(/\./g, ''));
                    } else if (dots === 1 && /\.\d{1,2}$/.test(clean)) {
                        // "10.50" -> Decimal (formato web/inglés)
                        val = parseFloat(clean);
                    } else {
                        // Ante la duda, si es un solo punto y 3 digitos (1.000), preferimos miles
                        // "10.000" -> 10000
                        val = parseFloat(clean.replace(/\./g, ''));
                    }
                } else if (commas > 0) {
                    // Solo comas: "10,5" o "10,000"
                    // En español coma es decimal, pero "10,000" podría ser 10k?
                    // Asumiremos coma = decimal estándar
                    val = parseFloat(clean.replace(',', '.'));
                } else {
                    // Solo dígitos
                    val = parseFloat(clean);
                }

                return val;
            }).filter(n => !isNaN(n) && n > 0);

            if (candidates.length > 0) {
                // Tomar el valor más alto encontrado (para evitar "1" de "1 dia" vs "1000" de monto)
                // O mejor, tomar el que esté más cerca de patrones de dinero (pendiente)
                // Por ahora el máximo suele ser correcto
                amount = Math.max(...candidates);
                console.log('💰 Monto detectado (número directo):', amount);
            }
        }
    }

    // Estrategia 3: Parser avanzado de números hablados compuestos
    // Ejemplo: "dos mil setecientos cuarenta y dos" -> 2742
    if (amount === 0) {
        // Mapa extendido de palabras numéricas
        const extendedWordNumbers = {
            'cero': 0, 'un': 1, 'uno': 1, 'una': 1,
            'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
            'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9,
            'diez': 10, 'once': 11, 'doce': 12, 'trece': 13,
            'catorce': 14, 'quince': 15, 'dieciséis': 16,
            'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
            'veinte': 20, 'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29,
            'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90,
            'cien': 100, 'ciento': 100, 'doscientos': 200, 'trescientos': 300, 'cuatrocientos': 400, 'quinientos': 500, 'seiscientos': 600, 'setecientos': 700, 'ochocientos': 800, 'novecientos': 900,
            'mil': 1000, 'miles': 1000,
            'millón': 1000000, 'millones': 1000000
        };

        const tokens = cleanText.split(/\s+/);
        let currentNumber = 0;
        let finalAmount = 0;
        let currentBlock = 0; // Para acumular dentro de bloques de mil/millón

        // Iterar tokens para reconstruir número hablado
        // Lógica simple de acumulación
        let isParsingNumber = false;

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i].replace(/[.,]/g, ''); // Limpiar token
            let val = extendedWordNumbers[token];

            // Manejo de "y" (e.g., cuarenta y dos)
            if (token === 'y' && isParsingNumber) continue;

            // Manejo de dígitos sueltos mezclados (e.g., "2 mil")
            if (val === undefined && /^\d+$/.test(token)) {
                val = parseInt(token, 10);
            }

            if (val !== undefined) {
                isParsingNumber = true;
                if (val === 1000) {
                    // Multiplicador MIL
                    // Si no hay nada acumulado (ej: "mil pesos"), asumimos 1000
                    let multiplier = (currentBlock === 0) ? 1 : currentBlock;
                    finalAmount += multiplier * 1000;
                    currentBlock = 0;
                } else if (val === 1000000) {
                    // Multiplicador MILLÓN
                    let multiplier = (currentBlock === 0) ? 1 : currentBlock;
                    finalAmount += multiplier * 1000000;
                    currentBlock = 0;
                } else if (val > currentBlock && currentBlock !== 0 && val >= 100) {
                    // Caso raro multiplicativo menor? (cien mil vs doscientos)
                    // Normalmente se suma: doscientos (200) + uno (1)
                    currentBlock += val;
                } else {
                    // Suma normal: treinta (30) + dos (2) -> 32
                    currentBlock += val;
                }
            } else if (isParsingNumber) {
                // Fin de la secuencia numérica
                // Comprobamos si la siguiente palabra es moneda o contexto de transacción
                const nextContext = tokens.slice(i, i + 3).join(' ');
                // Si encontramos una palabra que no es número, asumimos que terminó el número
                // Sumamos lo que quede en el bloque
                finalAmount += currentBlock;

                if (finalAmount > amount) {
                    amount = finalAmount;
                }

                // Reiniciar para buscar otros números si los hubiera
                currentBlock = 0;
                finalAmount = 0;
                isParsingNumber = false;
            }
        }

        // Al final del loop, si quedó algo pendiente
        if (isParsingNumber) {
            finalAmount += currentBlock;
            if (finalAmount > amount) {
                amount = finalAmount;
            }
        }

        if (amount > 0) {
            console.log('💰 Monto detectado (parser compuesto):', amount);
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