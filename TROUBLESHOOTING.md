# 🔧 TROUBLESHOOTING - Solución de Problemas

## 🎤 Problemas con el Micrófono

### Error: "No se pudo acceder al micrófono"

**Causas posibles:**
1. No diste permisos al navegador
2. Otro programa está usando el micrófono
3. El navegador no soporta MediaRecorder API

**Soluciones:**
1. Verifica los permisos del navegador:
   - Chrome: Haz clic en el candado 🔒 junto a la URL
   - Asegúrate de que "Micrófono" esté en "Permitir"
2. Cierra otras aplicaciones que usen el micrófono (Zoom, Discord, etc.)
3. Usa un navegador moderno (Chrome, Edge, Firefox)
4. Verifica que estés en HTTPS o localhost

### El micrófono graba pero no transcribe

**Causas posibles:**
1. API Key de OpenAI incorrecta
2. Sin créditos en OpenAI
3. Problema de red

**Soluciones:**
1. Verifica tu API Key en `.env.local`
2. Ve a https://platform.openai.com/account/billing
3. Verifica que tengas créditos disponibles
4. Revisa la consola del navegador (F12) para ver errores

## 🗄️ Problemas con Supabase

### Error: "Failed to fetch"

**Causas posibles:**
1. URL de Supabase incorrecta
2. Anon Key incorrecta
3. Proyecto de Supabase pausado

**Soluciones:**
1. Verifica las credenciales en `.env.local`
2. Ve a tu proyecto en Supabase y verifica que esté activo
3. Reinicia el servidor de desarrollo (`npm run dev`)

### Las transacciones no se guardan

**Causas posibles:**
1. No ejecutaste el schema SQL
2. RLS (Row Level Security) mal configurado
3. No has iniciado sesión

**Soluciones:**
1. Ejecuta `supabase-schema.sql` en SQL Editor de Supabase
2. Verifica que las políticas RLS estén creadas:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'transactions';
   ```
3. Inicia sesión con Google o Apple

### Error: "relation 'transactions' does not exist"

**Causa:**
No se ejecutó el schema SQL

**Solución:**
1. Ve a Supabase > SQL Editor
2. Ejecuta el archivo `supabase-schema.sql` completo
3. Verifica que la tabla se creó:
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'transactions';
   ```

## 🔐 Problemas de Autenticación

### "Sign in with Google" no funciona

**Causas posibles:**
1. OAuth no configurado en Supabase
2. Callback URL incorrecta en Google Cloud
3. Credenciales incorrectas

**Soluciones:**
1. Ve a Supabase > Authentication > Providers > Google
2. Verifica que esté habilitado
3. Copia la Callback URL de Supabase
4. Ve a Google Cloud Console > Credentials
5. Edita tu OAuth 2.0 Client ID
6. Verifica que la Callback URL esté en "Authorized redirect URIs"
7. Guarda los cambios

### "Sign in with Apple" no funciona

**Causas posibles:**
1. Apple Sign In no configurado
2. Service ID incorrecto
3. Certificados incorrectos

**Soluciones:**
1. Ve a https://developer.apple.com
2. Verifica tu Service ID
3. Verifica que el dominio esté verificado
4. En Supabase, verifica las credenciales de Apple

### Usuario no se mantiene logueado

**Causa:**
Problema con las cookies o localStorage

**Soluciones:**
1. Verifica que las cookies estén habilitadas
2. No uses modo incógnito
3. Limpia el localStorage:
   ```javascript
   localStorage.clear()
   ```
4. Recarga la página

## 🧠 Problemas con Whisper AI

### Error: "Invalid API Key"

**Causa:**
API Key incorrecta o expirada

**Solución:**
1. Ve a https://platform.openai.com/api-keys
2. Verifica que tu clave esté activa
3. Crea una nueva clave si es necesario
4. Actualiza `.env.local`
5. Reinicia el servidor

### Error: "Insufficient quota"

**Causa:**
Sin créditos en OpenAI

**Solución:**
1. Ve a https://platform.openai.com/account/billing
2. Agrega un método de pago
3. Carga créditos ($5 USD es suficiente para empezar)

### La transcripción está en inglés

**Causa:**
Whisper detectó el idioma incorrecto

**Solución:**
El código ya especifica `language: 'es'`, pero puedes:
1. Hablar más claro
2. Reducir el ruido de fondo
3. Verificar que el micrófono funcione bien

### La transcripción no detecta el monto

**Causas posibles:**
1. No dijiste un número
2. Formato de número no reconocido

**Soluciones:**
1. Di el número claramente: "cinco mil" o "5000"
2. Usa formatos soportados:
   - "5000 pesos"
   - "5 mil pesos"
   - "cinco mil"
3. Evita formatos complejos: "cinco mil quinientos con cincuenta"

## 🌐 Problemas de Red

### Error: "Network request failed"

**Causas posibles:**
1. Sin conexión a internet
2. Firewall bloqueando las peticiones
3. CORS issues

**Soluciones:**
1. Verifica tu conexión a internet
2. Desactiva temporalmente el firewall/antivirus
3. Verifica que no haya extensiones bloqueando peticiones

### Peticiones muy lentas

**Causas posibles:**
1. Conexión lenta
2. Audio muy largo
3. Servidor de OpenAI saturado

**Soluciones:**
1. Usa una conexión más rápida
2. Graba comandos cortos (5-10 segundos)
3. Intenta en otro momento

## 💻 Problemas de Desarrollo

### Error: "Cannot find module"

**Causa:**
Dependencias no instaladas

**Solución:**
```bash
npm install
```

### Error al compilar

**Causa:**
Sintaxis incorrecta o dependencias desactualizadas

**Soluciones:**
1. Verifica que no haya errores de sintaxis
2. Actualiza dependencias:
   ```bash
   npm update
   ```
3. Limpia caché:
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

### Variables de entorno no se cargan

**Causas posibles:**
1. Archivo `.env.local` mal ubicado
2. Nombre de variable incorrecto
3. Servidor no reiniciado

**Soluciones:**
1. Verifica que `.env.local` esté en la raíz del proyecto
2. Verifica que las variables empiecen con `VITE_`
3. Reinicia el servidor:
   ```bash
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

## 📱 Problemas en Móvil

### El micrófono no funciona en móvil

**Causas posibles:**
1. Navegador no soportado
2. Permisos no otorgados
3. No estás en HTTPS

**Soluciones:**
1. Usa Chrome o Safari en móvil
2. Otorga permisos cuando el navegador lo solicite
3. Despliega en HTTPS (no funciona en HTTP en móvil)

### La interfaz se ve mal en móvil

**Causa:**
Problema de responsive design

**Solución:**
El diseño debería ser responsive. Si no:
1. Reporta el problema con una captura de pantalla
2. Especifica el dispositivo y navegador

## 🔍 Debugging Avanzado

### Ver logs en la consola

1. Abre las DevTools (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes con emoji:
   - 🎤 = Grabación
   - 🧠 = Procesamiento
   - ✅ = Éxito
   - ❌ = Error

### Ver peticiones de red

1. Abre las DevTools (F12)
2. Ve a la pestaña "Network"
3. Filtra por "Fetch/XHR"
4. Busca peticiones a:
   - `supabase.co` (Supabase)
   - `openai.com` (Whisper)

### Ver datos en Supabase

1. Ve a tu proyecto en Supabase
2. Haz clic en "Table Editor"
3. Selecciona la tabla "transactions"
4. Verifica que las transacciones se estén guardando

### Limpiar datos de prueba

```sql
-- En Supabase SQL Editor
DELETE FROM transactions WHERE user_id = auth.uid();
```

## 📞 Obtener Ayuda

Si ninguna de estas soluciones funciona:

1. **Revisa los logs**: Abre la consola (F12) y copia los errores
2. **Verifica la configuración**: Revisa `.env.local` y Supabase
3. **Busca en la documentación**:
   - Supabase: https://supabase.com/docs
   - OpenAI: https://platform.openai.com/docs
4. **Reporta el problema**: Crea un issue en GitHub con:
   - Descripción del problema
   - Pasos para reproducirlo
   - Capturas de pantalla
   - Logs de la consola

## ✅ Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] Instalé las dependencias (`npm install`)
- [ ] Creé el archivo `.env.local` con las credenciales correctas
- [ ] Ejecuté el schema SQL en Supabase
- [ ] Configuré OAuth en Supabase y Google Cloud
- [ ] Tengo créditos en OpenAI
- [ ] Estoy usando un navegador moderno
- [ ] Di permisos al micrófono
- [ ] Inicié sesión en la aplicación
- [ ] Revisé la consola del navegador (F12)
- [ ] Reinicié el servidor de desarrollo
