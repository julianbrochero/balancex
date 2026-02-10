import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook personalizado para manejar transacciones (ingresos/egresos) con Supabase
 */
export function useTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Obtener usuario actual
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('🔍 Sesión obtenida:', session);
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('🔄 Cambio de estado de autenticación:', session?.user?.email);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Cargar transacciones del usuario
    useEffect(() => {
        if (user) {
            console.log('👤 Usuario disponible, cargando transacciones:', user.email);
            loadTransactions();
        } else {
            console.log('👤 No hay usuario, limpiando transacciones');
            setTransactions([]);
            setLoading(false);
        }
    }, [user]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📋 Cargando transacciones para user_id:', user?.id);

            const { data, error: fetchError } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            console.log('✅ Transacciones cargadas:', data?.length || 0);
            setTransactions(data || []);
        } catch (err) {
            console.error('❌ Error cargando transacciones:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (type, amount, description, category = 'otro') => {
        if (!user) {
            console.error('❌ Usuario no autenticado al intentar guardar');
            alert('Debes iniciar sesión para guardar transacciones');
            return null;
        }

        try {
            console.log('➕ Guardando transacción:', { type, amount, description, category });

            const newTransaction = {
                user_id: user.id,
                type,
                amount,
                description,
                category,
                created_at: new Date().toISOString()
            };

            const { data, error: insertError } = await supabase
                .from('transactions')
                .insert([newTransaction])
                .select()
                .single();

            if (insertError) throw insertError;

            // Actualizar estado local
            setTransactions([data, ...transactions]);

            console.log('✅ Transacción guardada:', data);
            return data;

        } catch (err) {
            console.error('❌ Error guardando transacción:', err);
            setError(err.message);
            alert('Error al guardar la transacción. Intenta nuevamente.');
            return null;
        }
    };

    const deleteTransaction = async (id) => {
        if (!user) {
            console.error('❌ Usuario no autenticado al intentar eliminar');
            return;
        }

        try {
            console.log('🗑️ Eliminando transacción:', id);

            const { error: deleteError } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (deleteError) throw deleteError;

            // Actualizar estado local
            setTransactions(transactions.filter(t => t.id !== id));

            console.log('✅ Transacción eliminada');

        } catch (err) {
            console.error('❌ Error eliminando transacción:', err);
            setError(err.message);
        }
    };

    return {
        transactions,
        loading,
        error,
        user,
        addTransaction,
        deleteTransaction,
        refreshTransactions: loadTransactions
    };
}