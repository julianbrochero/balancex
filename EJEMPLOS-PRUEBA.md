# 🧪 EJEMPLOS DE PRUEBA

## 🎤 Comandos de Voz para Probar

### Egresos (Gastos)

#### Comida
- "Gasté 5000 pesos en comida"
- "Compré en el supermercado por 12 mil pesos"
- "Pagué 3000 en el almuerzo"
- "Salí a cenar y gasté 8000"

#### Transporte
- "Pagué 2000 de uber"
- "Gasté 5000 en nafta"
- "Tomé un taxi por 1500"
- "Pagué 3000 de estacionamiento"

#### Servicios
- "Pagué 3000 de internet"
- "Gasté 2000 en luz"
- "Pagué 1500 de netflix"
- "Gasté 4000 en el celular"

#### Salud
- "Compré medicamentos por 2500"
- "Pagué 5000 al médico"
- "Gasté 3000 en la farmacia"

#### Entretenimiento
- "Fui al cine y gasté 2000"
- "Salí a un bar y pagué 6000"
- "Compré entradas por 8000"

#### Otros
- "Compré ropa por 15 mil pesos"
- "Pagué el alquiler de 50000"
- "Gasté 20000 en muebles"

### Ingresos

#### Sueldo
- "Me ingresaron 200000 de sueldo"
- "Cobré mi salario de 150000"
- "Me pagaron 180 mil pesos"

#### Freelance
- "Cobré 50000 por un proyecto"
- "Me ingresaron 30000 de freelance"
- "Recibí 25 mil por un trabajo"

#### Otros
- "Me devolvieron 5000 pesos"
- "Gané 10000 en una apuesta"
- "Recibí 15000 de regalo"

## 📝 Datos Manuales para Probar

### Transacciones de Ejemplo

#### Mes Actual
1. **Ingreso - Sueldo**
   - Tipo: Ingreso
   - Monto: 200000
   - Descripción: Sueldo de febrero
   - Categoría: Sueldo

2. **Egreso - Supermercado**
   - Tipo: Egreso
   - Monto: 15000
   - Descripción: Compras del mes
   - Categoría: Comida

3. **Egreso - Internet**
   - Tipo: Egreso
   - Monto: 3000
   - Descripción: Servicio de internet
   - Categoría: Servicios

4. **Ingreso - Freelance**
   - Tipo: Ingreso
   - Monto: 50000
   - Descripción: Proyecto web
   - Categoría: Freelance

5. **Egreso - Nafta**
   - Tipo: Egreso
   - Monto: 8000
   - Descripción: Carga de combustible
   - Categoría: Transporte

## 🧪 Casos de Prueba

### Caso 1: Usuario Nuevo
1. Abre la aplicación
2. Verifica que muestre "No has iniciado sesión"
3. Haz clic en el menú (☰)
4. Inicia sesión con Google
5. Verifica que muestre tu email
6. Verifica que muestre "No hay movimientos aún"

### Caso 2: Primera Transacción por Voz
1. Haz clic en el botón del micrófono (🎤)
2. Permite el acceso al micrófono
3. Di: "Gasté 5000 pesos en comida"
4. Haz clic de nuevo en el micrófono para detener
5. Espera a que se procese
6. Verifica que aparezca la transacción
7. Verifica que el balance sea -$5000.00

### Caso 3: Transacción Manual
1. Haz clic en "+ Agregar"
2. Selecciona "Ingreso"
3. Ingresa: 200000
4. Descripción: "Sueldo"
5. Categoría: "Sueldo"
6. Haz clic en "Guardar"
7. Verifica que aparezca en la lista
8. Verifica que el balance se actualice

### Caso 4: Filtros de Período
1. Agrega varias transacciones
2. Haz clic en "Hoy"
3. Verifica que solo muestre las de hoy
4. Haz clic en "Este mes"
5. Verifica que muestre todas del mes
6. Verifica que los totales cambien

### Caso 5: Eliminar Transacción
1. Pasa el mouse sobre una transacción
2. Haz clic en el ícono de basura (🗑️)
3. Verifica que se elimine
4. Verifica que el balance se actualice

### Caso 6: Cerrar Sesión
1. Haz clic en el menú (☰)
2. Haz clic en "Cerrar sesión"
3. Verifica que se cierre la sesión
4. Verifica que no se muestren transacciones

## 🔍 Pruebas de Validación

### Validación de Voz

#### ✅ Debería Funcionar
- "Gasté 5000 en comida" → Egreso $5000
- "Pagué 3 mil de internet" → Egreso $3000
- "Cobré 200000 de sueldo" → Ingreso $200000
- "Recibí 15 mil por un trabajo" → Ingreso $15000

#### ❌ No Debería Funcionar
- "Hola cómo estás" → Sin monto
- "Compré algo" → Sin monto
- "Gasté mucho" → Sin monto específico

### Validación de Formulario

#### ✅ Debería Funcionar
- Monto: 5000, Descripción: vacía → OK
- Monto: 0.50, Descripción: "Propina" → OK
- Monto: 1000000, Descripción: "Inversión" → OK

#### ❌ No Debería Funcionar
- Monto: 0 → Error
- Monto: -100 → Error
- Monto: vacío → Error

## 📊 Escenarios de Uso Real

### Escenario 1: Día Típico
```
09:00 - "Pagué 1500 de desayuno"
12:00 - "Gasté 3000 en almuerzo"
14:00 - "Pagué 2000 de uber"
18:00 - "Compré en el supermercado por 8000"
20:00 - "Salí a cenar y gasté 6000"

Balance del día: -$20,500
```

### Escenario 2: Día de Cobro
```
10:00 - "Me ingresaron 200000 de sueldo"
11:00 - "Cobré 50000 de freelance"
15:00 - "Pagué 50000 de alquiler"
16:00 - "Pagué 3000 de internet"
17:00 - "Pagué 2000 de luz"

Balance del día: +$195,000
```

### Escenario 3: Fin de Semana
```
Sábado:
- "Fui al cine y gasté 2000"
- "Salí a comer y pagué 8000"
- "Tomé un uber por 1500"

Domingo:
- "Compré ropa por 15000"
- "Almorcé afuera por 4000"
- "Pagué 2000 de estacionamiento"

Balance del fin de semana: -$32,500
```

## 🎯 Objetivos de las Pruebas

### Funcionalidad
- [ ] El micrófono graba correctamente
- [ ] Whisper transcribe en español
- [ ] Se detecta el tipo (ingreso/egreso)
- [ ] Se detecta el monto correctamente
- [ ] Se detecta la categoría
- [ ] Las transacciones se guardan en Supabase
- [ ] El balance se calcula correctamente
- [ ] Los filtros funcionan
- [ ] Se puede eliminar transacciones
- [ ] OAuth funciona con Google
- [ ] OAuth funciona con Apple

### UI/UX
- [ ] La interfaz es responsive
- [ ] Las animaciones son suaves
- [ ] Los mensajes de estado son claros
- [ ] El feedback visual es inmediato
- [ ] El diseño es intuitivo
- [ ] Los colores son consistentes

### Rendimiento
- [ ] La transcripción es rápida (<5 segundos)
- [ ] La UI no se congela
- [ ] Las transacciones se guardan rápido
- [ ] Los filtros responden instantáneamente

### Seguridad
- [ ] Solo veo mis propias transacciones
- [ ] No puedo ver transacciones de otros usuarios
- [ ] Debo estar logueado para guardar
- [ ] Las API keys no están expuestas

## 📝 Reporte de Pruebas

Usa esta plantilla para reportar resultados:

```
## Prueba: [Nombre de la prueba]

**Fecha**: [Fecha]
**Navegador**: [Chrome/Firefox/Safari]
**Dispositivo**: [Desktop/Mobile]

### Pasos
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

### Resultado Esperado
[Qué debería pasar]

### Resultado Actual
[Qué pasó realmente]

### Estado
- [ ] ✅ Pasó
- [ ] ❌ Falló
- [ ] ⚠️ Parcial

### Notas
[Observaciones adicionales]

### Capturas
[Screenshots si es necesario]
```

## 🐛 Bugs Conocidos

### En Desarrollo
- La API Key de OpenAI está en el frontend (inseguro para producción)
- No hay límite de rate en las peticiones a Whisper
- No hay validación de longitud de audio

### Limitaciones
- Whisper puede tardar 3-5 segundos en transcribir
- Requiere conexión a internet
- Solo funciona en navegadores modernos

## ✅ Checklist de Pruebas

Antes de considerar el proyecto completo:

### Configuración
- [ ] Variables de entorno configuradas
- [ ] Supabase configurado
- [ ] OpenAI configurado
- [ ] OAuth configurado

### Funcionalidad Básica
- [ ] Inicio de sesión funciona
- [ ] Grabación de audio funciona
- [ ] Transcripción funciona
- [ ] Guardar transacción funciona
- [ ] Ver transacciones funciona
- [ ] Eliminar transacción funciona

### Funcionalidad Avanzada
- [ ] Detección de tipo funciona
- [ ] Detección de monto funciona
- [ ] Detección de categoría funciona
- [ ] Filtros de período funcionan
- [ ] Balance se calcula correctamente

### UI/UX
- [ ] Diseño responsive
- [ ] Animaciones suaves
- [ ] Feedback visual claro
- [ ] Mensajes de error útiles

### Seguridad
- [ ] RLS funciona en Supabase
- [ ] Solo veo mis transacciones
- [ ] OAuth es seguro

---

**¡Usa estos ejemplos para probar todas las funcionalidades del sistema!**
