# 🚀 GUÍA DE DEPLOYMENT (PRODUCCIÓN)

## ⚠️ IMPORTANTE: Seguridad en Producción

**ANTES de desplegar a producción, DEBES hacer estos cambios:**

### 1. Mover Whisper a un Backend

❌ **NO USAR EN PRODUCCIÓN:**
```javascript
// src/services/whisperService.js
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // ⚠️ INSEGURO
});
```

✅ **USAR EN PRODUCCIÓN:**

Crea un backend (ejemplo con Node.js):

```javascript
// backend/api/transcribe.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Seguro en el servidor
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'es'
    });
    
    return res.status(200).json({ text: transcription });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

Luego actualiza el frontend:

```javascript
// src/services/whisperService.js
export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');
  
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  return data.text;
}
```

## 🌐 Opciones de Deployment

### Opción 1: Vercel (Recomendado)

**Ventajas:**
- ✅ Gratis para proyectos personales
- ✅ Deploy automático desde Git
- ✅ HTTPS incluido
- ✅ Soporta Serverless Functions (para backend)
- ✅ CDN global

**Pasos:**

1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Configurar variables de entorno**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
# NO agregues VITE_OPENAI_API_KEY aquí (va en el backend)
```

4. **Deploy**
```bash
vercel --prod
```

5. **Configurar dominio personalizado (opcional)**
```bash
vercel domains add tudominio.com
```

### Opción 2: Netlify

**Ventajas:**
- ✅ Gratis para proyectos personales
- ✅ Deploy automático desde Git
- ✅ HTTPS incluido
- ✅ Netlify Functions (para backend)

**Pasos:**

1. **Instalar Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login**
```bash
netlify login
```

3. **Inicializar**
```bash
netlify init
```

4. **Configurar variables de entorno**
```bash
netlify env:set VITE_SUPABASE_URL "tu_url"
netlify env:set VITE_SUPABASE_ANON_KEY "tu_key"
```

5. **Deploy**
```bash
netlify deploy --prod
```

### Opción 3: Railway

**Ventajas:**
- ✅ Soporta backend completo (Node.js, Python, etc.)
- ✅ Base de datos incluida
- ✅ HTTPS incluido

**Pasos:**

1. Ve a https://railway.app
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno
4. Deploy automático

### Opción 4: Render

**Ventajas:**
- ✅ Gratis para proyectos estáticos
- ✅ Soporta backend
- ✅ HTTPS incluido

**Pasos:**

1. Ve a https://render.com
2. Conecta tu repositorio
3. Selecciona "Static Site"
4. Configura:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Agrega variables de entorno
6. Deploy

## 📦 Preparar para Producción

### 1. Crear Backend para Whisper

**Estructura recomendada:**

```
balancex/
├── frontend/          # Tu código React actual
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Nuevo backend
│   ├── api/
│   │   └── transcribe.js
│   ├── package.json
│   └── vercel.json
└── README.md
```

**Backend con Vercel Functions:**

```javascript
// backend/api/transcribe.js
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable();
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form' });
    }

    try {
      const audioFile = files.audio[0];
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFile.filepath),
        model: 'whisper-1',
        language: 'es'
      });

      // Limpiar archivo temporal
      fs.unlinkSync(audioFile.filepath);

      return res.status(200).json({ text: transcription.text });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
}
```

**Configuración de Vercel:**

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

### 2. Actualizar Frontend

```javascript
// src/services/whisperService.js
export async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Error en la transcripción');
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error transcribiendo:', error);
    throw error;
  }
}

// Eliminar la configuración de OpenAI del frontend
```

### 3. Configurar Variables de Entorno

**En Vercel/Netlify:**

```
# Frontend (públicas)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key

# Backend (privadas)
OPENAI_API_KEY=sk-tu_openai_key
```

### 4. Actualizar Supabase

**Configurar URLs permitidas:**

1. Ve a Supabase > Authentication > URL Configuration
2. Agrega tu dominio de producción:
   - `https://tuapp.vercel.app`
   - `https://tudominio.com`

**Configurar OAuth:**

1. Ve a Google Cloud Console
2. Agrega tu dominio de producción a "Authorized redirect URIs"
3. Haz lo mismo en Apple Developer

### 5. Build de Producción

```bash
# Limpiar
rm -rf dist

# Build
npm run build

# Preview local
npm run preview
```

### 6. Optimizaciones

**Comprimir imágenes:**
```bash
npm install -D vite-plugin-imagemin
```

**Lazy loading:**
```javascript
// App.jsx
const ExpenseTracker = lazy(() => import('./components/ExpenseTracker'));
```

**Code splitting:**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  }
}
```

## 🔒 Checklist de Seguridad

Antes de desplegar:

- [ ] Moviste Whisper a un backend
- [ ] Las API keys están en variables de entorno del servidor
- [ ] Configuraste CORS correctamente
- [ ] Habilitaste HTTPS
- [ ] Configuraste CSP (Content Security Policy)
- [ ] Actualizaste las URLs de OAuth
- [ ] Probaste en modo producción localmente
- [ ] Configuraste rate limiting
- [ ] Agregaste logging de errores
- [ ] Configuraste monitoreo

## 📊 Monitoreo

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```javascript
// src/main.jsx
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
);
```

### Sentry (Errores)

```bash
npm install @sentry/react
```

```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "tu_sentry_dsn",
  environment: import.meta.env.MODE,
});
```

## 🚀 CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📝 Checklist Final

Antes de lanzar a producción:

### Código
- [ ] Moviste Whisper a backend
- [ ] Eliminaste console.logs innecesarios
- [ ] Optimizaste imágenes
- [ ] Implementaste lazy loading
- [ ] Configuraste code splitting

### Configuración
- [ ] Variables de entorno configuradas
- [ ] OAuth configurado con URLs de producción
- [ ] CORS configurado
- [ ] HTTPS habilitado

### Testing
- [ ] Probaste en diferentes navegadores
- [ ] Probaste en móvil
- [ ] Probaste OAuth
- [ ] Probaste el flujo completo

### Seguridad
- [ ] API keys en el servidor
- [ ] RLS habilitado en Supabase
- [ ] CSP configurado
- [ ] Rate limiting implementado

### Monitoreo
- [ ] Analytics configurado
- [ ] Error tracking configurado
- [ ] Logs configurados

## 🎉 ¡Listo para Producción!

Una vez completados todos los pasos, tu aplicación estará lista para usuarios reales.

## 📞 Soporte Post-Deployment

Después del deployment:

1. **Monitorea errores** en Sentry
2. **Revisa analytics** en Vercel/Netlify
3. **Verifica logs** de Supabase
4. **Monitorea costos** de OpenAI
5. **Actualiza dependencias** regularmente

---

**¡Buena suerte con tu deployment! 🚀**
