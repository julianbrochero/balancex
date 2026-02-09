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
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Cargar transacciones del usuario
    useEffect(() => {
        if (user) {
            loadTransactions();
        } else {
            setTransactions([]);
            setLoading(false);
        }
    }, [user]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setTransactions(data || []);
        } catch (err) {
            console.error('Error cargando transacciones:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (type, amount, description, category = 'otro') => {
        if (!user) {
            alert('Debes iniciar sesión para guardar transacciones');
            return null;
        }

        try {
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
            console.error('Error guardando transacción:', err);
            setError(err.message);
            return null;
        }
    };

    const deleteTransaction = async (id) => {
        if (!user) return;

        try {
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
            console.error('Error eliminando transacción:', err);
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
