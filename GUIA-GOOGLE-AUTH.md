# 🔐 Guía de Configuración: Google OAuth 2.0 con Supabase

Para que el botón de "Iniciar sesión con Google" funcione, necesitas configurar las credenciales de seguridad. Sigue estos pasos exactos:

## 1. Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto.
3. Ve a **APIs & Services** > **OAuth consent screen**.
   - Selecciona **External**.
   - Llena "App name" y correos.
   - Guarda los cambios.
4. Ve a **Credentials** > **Create Credentials** > **OAuth client ID**.
   - Tipo: **Web application**.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `https://tu-dominio-produccion.com` (cuando lo tengas)
   - **Authorized redirect URIs**:
     - Necesitas la URL de Supabase (ver paso 2).

## 2. Supabase Dashboard
1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard).
2. Ve a **Authentication** > **Providers** > **Google**.
3. Copia la **Callback URL (for OAuth)** (empieza con `https://...`).
4. **PEGA** esta URL en el campo **Authorized redirect URIs** de Google Cloud (paso 1).
5. En Google Cloud, dale a "Create" y copia:
   - **Client ID**
   - **Client Secret**

## 3. Conectar Todo
1. Vuelve a Supabase > Authentication > Providers > Google.
2. Pega el **Client ID** y **Client Secret**.
3. Activa el interruptor **Enable Sign in with Google**.
4. Dale a **Save**.

## 4. Probar
1. Reinicia tu app (`npm run dev`).
2. Haz clic en el botón de Google en el menú.
3. ¡Debería funcionar!

---
**Nota sobre Skip nonce check**: En las opciones avanzadas de Supabase Google Provider, si tienes problemas, puedes intentar activar "Skip nonce check", aunque generalmente no es necesario para el flujo estándar.
