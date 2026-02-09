# 💰 BalanceX - Control de Ingresos y Gastos con IA

Sistema web en React para control de ingresos y gastos personales con **control por voz usando Inteligencia Artificial** (Whisper de OpenAI).

## ✨ Características

- 🎙️ **Control por voz con IA**: Usa Whisper de OpenAI para transcribir y procesar comandos de voz
- 💾 **Backend en Supabase**: Almacenamiento seguro en la nube con autenticación
- 🔐 **Autenticación OAuth**: Inicia sesión con Google o Apple
- 📊 **Filtros por período**: Visualiza tus movimientos por día, mes, mes pasado o año
- 🏷️ **Categorías automáticas**: El sistema detecta automáticamente la categoría del gasto/ingreso
- 📱 **Diseño responsive**: Funciona perfectamente en móvil y desktop
- 🎨 **UI minimalista**: Inspirado en Google Material Design

## 🎤 Ejemplos de comandos de voz

El sistema interpreta automáticamente comandos como:

- "Gasté 5000 pesos en comida"
- "Me ingresaron 200000 de sueldo"
- "Pagué 3000 de internet"
- "Ingresaron 15000 por un trabajo"
- "Compré ropa por 12 mil pesos"
- "Cobré 50000 de freelance"

## 🚀 Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y ejecuta el script `supabase-schema.sql`
4. Ve a **Settings** > **API** y copia:
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_ANON_KEY)

### 3. Configurar OpenAI (Whisper)

1. Crea una cuenta en [OpenAI](https://platform.openai.com)
2. Ve a **API Keys** y crea una nueva clave
3. Copia la clave API

### 4. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_OPENAI_API_KEY=sk-tu_openai_api_key_aqui
```

### 5. Configurar OAuth (Google y Apple)

#### Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Google+ API**
4. Ve a **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Configura las URLs de redirección:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`
6. Copia el **Client ID** y **Client Secret**
7. En Supabase, ve a **Authentication** > **Providers** > **Google**
8. Pega las credenciales y habilita el provider

#### Apple OAuth

1. Ve a [Apple Developer](https://developer.apple.com)
2. Crea un **Service ID** para Sign in with Apple
3. Configura las URLs de redirección:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`
4. En Supabase, ve a **Authentication** > **Providers** > **Apple**
5. Configura las credenciales y habilita el provider

### 6. Ejecutar el proyecto

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 📁 Estructura del proyecto

```
balancex/
├── src/
│   ├── hooks/
│   │   ├── useAudioRecorder.js    # Hook para grabar audio
│   │   └── useTransactions.js     # Hook para manejar transacciones
│   ├── lib/
│   │   └── supabase.js            # Cliente de Supabase
│   ├── services/
│   │   └── whisperService.js      # Servicio de Whisper AI
│   ├── App.jsx                    # Componente principal
│   ├── index.css                  # Estilos globales
│   └── main.jsx                   # Punto de entrada
├── supabase-schema.sql            # Schema de base de datos
├── .env.local                     # Variables de entorno (no commitear)
├── .gitignore
├── package.json
└── README.md
```

## 🗄️ Schema de base de datos

La tabla `transactions` tiene la siguiente estructura:

| Campo       | Tipo      | Descripción                          |
|-------------|-----------|--------------------------------------|
| id          | UUID      | ID único de la transacción           |
| user_id     | UUID      | ID del usuario (FK a auth.users)     |
| type        | TEXT      | Tipo: 'ingreso' o 'egreso'           |
| amount      | DECIMAL   | Monto de la transacción              |
| description | TEXT      | Descripción del movimiento           |
| category    | TEXT      | Categoría (comida, transporte, etc.) |
| created_at  | TIMESTAMP | Fecha de creación                    |
| updated_at  | TIMESTAMP | Fecha de última actualización        |

## 🔒 Seguridad

- **Row Level Security (RLS)**: Los usuarios solo pueden ver sus propias transacciones
- **Autenticación OAuth**: Inicio de sesión seguro con Google/Apple
- **API Keys**: Las claves se almacenan en variables de entorno
- **HTTPS**: Todas las comunicaciones están encriptadas

## 🎨 Categorías disponibles

El sistema detecta automáticamente las siguientes categorías:

- 🍔 Comida
- 🚗 Transporte
- 💡 Servicios
- 🏥 Salud
- 🎬 Entretenimiento
- 📚 Educación
- 👕 Ropa
- 🏠 Hogar
- 💼 Sueldo
- 💻 Freelance
- 📦 Otro

## 🛠️ Tecnologías utilizadas

- **React 18** - Framework frontend
- **Vite** - Build tool
- **Supabase** - Backend as a Service (BaaS)
- **OpenAI Whisper** - Transcripción de voz con IA
- **Lucide React** - Iconos
- **MediaRecorder API** - Grabación de audio

## 📝 Notas importantes

### Sobre el uso de Whisper en el navegador

⚠️ **IMPORTANTE**: La configuración actual usa `dangerouslyAllowBrowser: true` en el cliente de OpenAI. Esto es **solo para desarrollo**.

Para producción, debes:

1. Crear un backend (Node.js, Python, etc.)
2. Mover la lógica de Whisper al backend
3. Exponer un endpoint API que reciba el audio
4. Llamar a ese endpoint desde el frontend

Ejemplo de endpoint backend (Node.js):

```javascript
// backend/api/transcribe.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  const formData = await req.formData();
  const audioFile = formData.get('audio');
  
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'es'
  });
  
  return Response.json({ text: transcription });
}
```

### Costos de OpenAI

- Whisper API: $0.006 por minuto de audio
- Ejemplo: 100 comandos de voz de 5 segundos = ~$0.05

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🐛 Reportar problemas

Si encuentras algún bug o tienes una sugerencia, por favor abre un [issue](https://github.com/tu-usuario/balancex/issues).

## 📧 Contacto

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter)

Project Link: [https://github.com/tu-usuario/balancex](https://github.com/tu-usuario/balancex)

---

Hecho con ❤️ usando React, Supabase y OpenAI Whisper
