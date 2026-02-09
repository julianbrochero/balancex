-- ============================================
-- BALANCEX - SCHEMA DE BASE DE DATOS SUPABASE
-- ============================================

-- Habilitar Row Level Security (RLS)
-- Esto asegura que los usuarios solo puedan ver sus propias transacciones

-- 1. Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'otro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

-- 3. Habilitar Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de seguridad (RLS Policies)

-- Política: Los usuarios solo pueden ver sus propias transacciones
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias transacciones
CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias transacciones
CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias transacciones
CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.transactions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- CONFIGURACIÓN ADICIONAL
-- ============================================

-- 7. Crear vista para estadísticas del usuario (opcional)
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  user_id,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN type = 'ingreso' THEN amount ELSE 0 END) as total_ingresos,
  SUM(CASE WHEN type = 'egreso' THEN amount ELSE 0 END) as total_egresos,
  SUM(CASE WHEN type = 'ingreso' THEN amount ELSE -amount END) as balance
FROM public.transactions
GROUP BY user_id;

-- 8. Habilitar RLS en la vista
ALTER VIEW public.user_stats SET (security_invoker = true);

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================

-- Para ejecutar este script en Supabase:
-- 1. Ve a tu proyecto en https://supabase.com
-- 2. Navega a "SQL Editor" en el menú lateral
-- 3. Copia y pega este script completo
-- 4. Haz clic en "Run" para ejecutarlo
-- 5. Verifica que la tabla "transactions" se haya creado correctamente

-- Para configurar OAuth (Google y Apple):
-- 1. Ve a "Authentication" > "Providers" en Supabase
-- 2. Habilita "Google" y configura las credenciales de OAuth
-- 3. Habilita "Apple" y configura las credenciales de OAuth
-- 4. Copia la URL de redirección y configúrala en Google Cloud Console y Apple Developer

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Descomentar para insertar datos de prueba
-- NOTA: Reemplaza 'YOUR_USER_ID' con un ID de usuario real

/*
INSERT INTO public.transactions (user_id, type, amount, description, category) VALUES
  ('YOUR_USER_ID', 'ingreso', 200000, 'Sueldo de enero', 'sueldo'),
  ('YOUR_USER_ID', 'egreso', 5000, 'Supermercado', 'comida'),
  ('YOUR_USER_ID', 'egreso', 3000, 'Internet', 'servicios'),
  ('YOUR_USER_ID', 'ingreso', 15000, 'Freelance', 'freelance'),
  ('YOUR_USER_ID', 'egreso', 12000, 'Almuerzo', 'comida');
*/
