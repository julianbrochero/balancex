# 🚀 GUÍA RÁPIDA DE INICIO

## Paso 1: Configurar Supabase

### 1.1 Crear proyecto en Supabase
1. Ve a https://supabase.com y crea una cuenta
2. Haz clic en "New Project"
3. Completa los datos:
   - **Name**: BalanceX (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura
   - **Region**: Selecciona la más cercana a ti
4. Espera a que el proyecto se cree (~2 minutos)

### 1.2 Ejecutar el schema de base de datos
1. En tu proyecto de Supabase, ve al menú lateral
2. Haz clic en **SQL Editor**
3. Haz clic en "New query"
4. Abre el archivo `supabase-schema.sql` de este proyecto
5. Copia TODO el contenido
6. Pégalo en el editor de Supabase
7. Haz clic en **Run** (o presiona Ctrl+Enter)
8. Verifica que aparezca "Success. No rows returned"

### 1.3 Obtener las credenciales
1. Ve a **Settings** (⚙️) en el menú lateral
2. Haz clic en **API**
3. Copia estos dos valores:
   - **Project URL** (ejemplo: https://abcdefgh.supabase.co)
   - **anon public** key (una clave muy larga)

### 1.4 Configurar OAuth (Google)
1. En Supabase, ve a **Authentication** > **Providers**
2. Busca **Google** y haz clic en él
3. Habilita el toggle "Enable Sign in with Google"
4. Copia la **Callback URL** (la necesitarás en Google Cloud)

**Configurar en Google Cloud:**
1. Ve a https://console.cloud.google.com
2. Crea un proyecto nuevo o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth 2.0 Client ID**
5. Selecciona **Web application**
6. En **Authorized redirect URIs**, pega la Callback URL de Supabase
7. Haz clic en **Create**
8. Copia el **Client ID** y **Client Secret**
9. Vuelve a Supabase y pega estas credenciales
10. Haz clic en **Save**

## Paso 2: Configurar OpenAI (Whisper)

### 2.1 Crear cuenta en OpenAI
1. Ve a https://platform.openai.com
2. Crea una cuenta o inicia sesión
3. Verifica tu email y número de teléfono

### 2.2 Obtener API Key
1. Haz clic en tu perfil (arriba a la derecha)
2. Selecciona **View API keys**
3. Haz clic en **Create new secret key**
4. Dale un nombre (ejemplo: "BalanceX")
5. Copia la clave (empieza con "sk-")
6. ⚠️ **IMPORTANTE**: Guárdala en un lugar seguro, no podrás verla de nuevo

### 2.3 Agregar créditos (si es necesario)
1. Ve a **Billing** en el menú
2. Agrega un método de pago
3. Carga créditos (con $5 USD tienes para ~800 minutos de audio)

## Paso 3: Configurar el proyecto

### 3.1 Crear archivo .env.local
1. En la raíz del proyecto, crea un archivo llamado `.env.local`
2. Copia el contenido de `.env.example`
3. Reemplaza los valores con tus credenciales reales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_OPENAI_API_KEY=sk-tu_openai_api_key_aqui
```

### 3.2 Instalar dependencias
```bash
npm install
```

### 3.3 Ejecutar el proyecto
```bash
npm run dev
```

## Paso 4: Probar la aplicación

### 4.1 Abrir en el navegador
1. Abre http://localhost:5173
2. Deberías ver la interfaz de BalanceX

### 4.2 Iniciar sesión
1. Haz clic en el menú hamburguesa (☰)
2. Haz clic en "Google"
3. Inicia sesión con tu cuenta de Google
4. Autoriza la aplicación

### 4.3 Probar el control por voz
1. Haz clic en el botón del micrófono (🎤)
2. Permite el acceso al micrófono cuando el navegador lo solicite
3. Di un comando, por ejemplo: "Gasté 5000 pesos en comida"
4. Haz clic de nuevo en el micrófono para detener la grabación
5. Espera a que se procese (verás mensajes de estado)
6. ¡La transacción debería aparecer en la lista!

### 4.4 Agregar transacción manual
1. Haz clic en "+ Agregar"
2. Selecciona Ingreso o Egreso
3. Ingresa el monto
4. Opcionalmente, agrega una descripción
5. Selecciona una categoría
6. Haz clic en "Guardar"

## 🎉 ¡Listo!

Tu aplicación está funcionando. Ahora puedes:
- ✅ Registrar ingresos y gastos por voz
- ✅ Ver tu balance en tiempo real
- ✅ Filtrar por períodos (hoy, mes, año)
- ✅ Tus datos se guardan automáticamente en Supabase

## 🐛 Solución de problemas

### El micrófono no funciona
- Verifica que hayas dado permisos al navegador
- Usa HTTPS o localhost (HTTP no permite micrófono)
- Prueba en Chrome o Edge (mejor compatibilidad)

### Error de Whisper
- Verifica que tu API Key de OpenAI sea correcta
- Verifica que tengas créditos en tu cuenta de OpenAI
- Revisa la consola del navegador (F12) para más detalles

### No se guardan las transacciones
- Verifica que hayas iniciado sesión
- Verifica que las credenciales de Supabase sean correctas
- Verifica que hayas ejecutado el schema SQL en Supabase

### Error de autenticación
- Verifica que hayas configurado OAuth en Supabase
- Verifica que la Callback URL esté correcta en Google Cloud
- Intenta cerrar sesión y volver a iniciar

## 📚 Más ayuda

- Lee el README.md completo
- Revisa la documentación de Supabase: https://supabase.com/docs
- Revisa la documentación de OpenAI: https://platform.openai.com/docs
