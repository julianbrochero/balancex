import React, { useState, useEffect } from 'react';
import { Mic, Plus, TrendingUp, TrendingDown, Wallet, Menu, X, LogOut, User, Calendar, Trash2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useTransactions } from './hooks/useTransactions'; // Backend real
import { initSpeechRecognition, processTranscript } from './services/speechService'; // IA de voz

export default function ExpenseTracker() {
  // Conectamos con el Backend (Supabase)
  const { transactions, loading, user, addTransaction: addTransactionToBackend, deleteTransaction } = useTransactions();

  // Estados de tu interfaz original
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualType, setManualType] = useState('egreso');
  const [manualAmount, setManualAmount] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('mes'); // 'dia', 'mes', 'mes-pasado', 'año'
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'resumen'

  // Inicializar reconocimiento de voz (Versión Potenciada)
  useEffect(() => {
    const recognitionInstance = initSpeechRecognition();

    if (recognitionInstance) {
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processVoiceInput(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Procesamiento de voz inteligente (Mejorado con nuestro servicio)
  const processVoiceInput = (transcript) => {
    console.log("Procesando voz:", transcript);
    // Usamos el servicio inteligente que detecta "5 mil", categorías, etc.
    const { type, amount, description, category } = processTranscript(transcript);

    if (amount > 0) {
      addTransaction(type, amount, description, category);
    } else {
      alert("No entendí el monto. Intenta decir: 'Gasté 5000 en comida'");
    }
  };

  // Función para agregar transacción (Conectada a Supabase)
  const addTransaction = async (type, amount, description, category = 'otro') => {
    if (!user) {
      alert("Debes iniciar sesión para guardar datos.");
      return;
    }
    await addTransactionToBackend(type, amount, description, category);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualAmount && parseFloat(manualAmount) > 0) {
      addTransaction(
        manualType,
        parseFloat(manualAmount),
        manualDescription || (manualType === 'ingreso' ? 'Ingreso' : 'Gasto')
      );
      setManualAmount('');
      setManualDescription('');
      setShowManualInput(false);
    }
  };

  const startListening = () => {
    if (recognition) {
      // Verificación de seguridad antes de escuchar
      if (!user) {
        alert("Inicia sesión para usar la voz.");
        return;
      }
      setIsListening(true);
      recognition.start();
    } else {
      alert("Tu navegador no soporta voz.");
    }
  };

  // Lógica de Auth Real
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const signInWithApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
  };

  // Filtros (Tu lógica original adaptada a fechas reales)
  const filterTransactionsByPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return transactions.filter(t => {
      // Importante: Supabase devuelve 'created_at', convertimos a Date
      const transactionDate = new Date(t.created_at);

      switch (selectedPeriod) {
        case 'dia':
          return transactionDate >= today;
        case 'mes':
          return transactionDate >= startOfMonth;
        case 'mes-pasado':
          return transactionDate >= startOfLastMonth && transactionDate <= endOfLastMonth;
        case 'año':
          return transactionDate >= startOfYear;
        default:
          return true;
      }
    });
  };

  const filteredTransactions = filterTransactionsByPeriod();

  const calculateBalance = () => {
    return filteredTransactions.reduce((acc, transaction) => {
      return transaction.type === 'ingreso'
        ? acc + transaction.amount
        : acc - transaction.amount;
    }, 0);
  };

  const calculateTotal = (type) => {
    return filteredTransactions
      .filter(t => t.type === type)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getPeriodLabel = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'dia':
        return 'Hoy';
      case 'mes':
        return now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      case 'mes-pasado':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return lastMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      case 'año':
        return now.getFullYear().toString();
      default:
        return 'Total';
    }
  };

  // Formateo de fecha para mostrar en la lista
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const balance = calculateBalance();
  const totalIngresos = calculateTotal('ingreso');
  const totalEgresos = calculateTotal('egreso');

  // Si está cargando datos iniciales
  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Cargando transacciones...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '"Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '24px',
      paddingBottom: '100px'
    }}>
      {/* Header with Hamburger Menu */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '20px',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '300',
          color: '#000000',
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          {currentPage === 'home' ? 'Balance' : 'Resumen'}
        </h1>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.6'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          {showMenu ? (
            <X size={24} color="#000000" strokeWidth={1.5} />
          ) : (
            <Menu size={24} color="#000000" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Slide-in Menu */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: showMenu ? 0 : '-100%',
        width: '100%',
        maxWidth: '320px',
        height: '100vh',
        background: '#ffffff',
        boxShadow: showMenu ? '-2px 0 8px rgba(0,0,0,0.1)' : 'none',
        transition: 'right 0.3s ease',
        zIndex: 1000,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Menu Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          paddingTop: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '400',
            color: '#000000',
            margin: 0,
            letterSpacing: '-0.2px'
          }}>
            Menú
          </h2>
          <button
            onClick={() => setShowMenu(false)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} color="#000000" strokeWidth={1.5} />
          </button>
        </div>

        {/* Menu Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Navigation */}
          <div style={{
            paddingBottom: '24px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <button
              onClick={() => {
                setCurrentPage('resumen');
                setShowMenu(false);
              }}
              style={{
                width: '100%',
                padding: '14px 0',
                background: 'transparent',
                border: 'none',
                color: '#000000',
                fontSize: '15px',
                fontWeight: '400',
                cursor: 'pointer',
                textAlign: 'left',
                letterSpacing: '-0.1px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.6'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              <Calendar size={20} strokeWidth={1.5} />
              Resumen por período
            </button>
          </div>

          {/* User Section */}
          <div style={{
            paddingBottom: '24px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={24} color="#5f6368" strokeWidth={1.5} />
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#5f6368',
                  marginBottom: '2px',
                  fontWeight: '400'
                }}>
                  {user ? user.email : 'No has iniciado sesión'}
                </div>
              </div>
            </div>
          </div>

          {/* Sign In Options */}
          {!user && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                fontSize: '13px',
                color: '#5f6368',
                marginBottom: '8px',
                fontWeight: '400',
                letterSpacing: '0.2px'
              }}>
                Iniciar sesión con
              </div>

              {/* Google Sign In */}
              <button
                onClick={signInWithGoogle}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: '#ffffff',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#000000',
                  letterSpacing: '0.1px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#d0d0d0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                </svg>
                Google
              </button>

              {/* Apple Sign In */}
              <button
                onClick={signInWithApple}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: '#000000',
                  border: '1px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#ffffff',
                  letterSpacing: '0.1px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M13.5 9.25C13.495 8.3 13.78 7.375 14.315 6.595C14.85 5.815 15.61 5.22 16.49 4.885C16.005 4.17 15.355 3.59 14.595 3.195C13.835 2.8 12.99 2.6 12.135 2.615C10.675 2.465 9.255 3.495 8.515 3.495C7.76 3.495 6.605 2.63 5.365 2.655C4.375 2.68 3.415 3.005 2.605 3.59C1.795 4.175 1.17 4.995 0.805 5.945C-1.145 10.095 0.325 16.035 2.195 19.295C3.13 20.895 4.22 22.655 5.46 22.61C6.67 22.56 7.125 21.82 8.595 21.82C10.05 21.82 10.475 22.61 11.74 22.58C13.04 22.56 14.005 20.985 14.91 19.375C15.56 18.31 16.045 17.15 16.35 15.935C15.295 15.495 14.395 14.735 13.77 13.755C13.145 12.775 12.825 11.625 13.85 10.48C13.85 10.07 13.675 9.66 13.5 9.25Z" fill="white" />
                  <path d="M11.31 1.165C12.125 0.195 12.51 -0.095 12.51 -1.22C12.51 -1.38 12.495 -1.54 12.465 -1.695C11.385 -1.65 10.11 -0.985 9.24 -0.01C8.47 0.84 7.96 1.925 8.045 3.075C9.215 3.165 10.41 2.45 11.31 1.165Z" fill="white" />
                </svg>
                Apple
              </button>
            </div>
          )}
        </div>

        {/* Menu Footer */}
        {user && (
          <div style={{
            paddingTop: '24px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <button
              onClick={signOut}
              style={{
                width: '100%',
                padding: '14px',
                background: 'transparent',
                border: 'none',
                color: '#5f6368',
                fontSize: '13px',
                fontWeight: '400',
                cursor: 'pointer',
                textAlign: 'left',
                letterSpacing: '0.2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} strokeWidth={1.5} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {/* Overlay */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 999,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Main Content */}
      {currentPage === 'home' ? (
        <>
          {/* Balance Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '0px',
            padding: '0px',
            marginBottom: '48px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <Wallet size={24} color="#000000" strokeWidth={1.5} />
              <span style={{
                fontSize: '14px',
                color: '#5f6368',
                fontWeight: '400',
                letterSpacing: '0.2px'
              }}>
                Balance Total
              </span>
            </div>
            <div style={{
              fontSize: '64px',
              fontWeight: '300',
              color: '#000000',
              letterSpacing: '-2px',
              marginTop: '8px',
              lineHeight: '1'
            }}>
              ${balance.toFixed(2)}
            </div>

            {/* Ingresos y Egresos */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              marginTop: '32px'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <TrendingUp size={20} color="#34a853" strokeWidth={2} />
                  <span style={{
                    fontSize: '13px',
                    color: '#5f6368',
                    fontWeight: '400',
                    letterSpacing: '0.2px'
                  }}>
                    Ingresos
                  </span>
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '400',
                  color: '#000000',
                  letterSpacing: '-0.5px'
                }}>
                  ${totalIngresos.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <TrendingDown size={20} color="#ea4335" strokeWidth={2} />
                  <span style={{
                    fontSize: '13px',
                    color: '#5f6368',
                    fontWeight: '400',
                    letterSpacing: '0.2px'
                  }}>
                    Egresos
                  </span>
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '400',
                  color: '#000000',
                  letterSpacing: '-0.5px'
                }}>
                  ${totalEgresos.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '400',
                color: '#000000',
                margin: 0,
                letterSpacing: '-0.2px'
              }}>
                Movimientos
              </h2>
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#5f6368',
                  fontSize: '13px',
                  fontWeight: '400',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.6'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                <Plus size={18} strokeWidth={1.5} />
                <span>Agregar</span>
              </button>
            </div>

            {/* Manual Input Form */}
            {showManualInput && (
              <form onSubmit={handleManualSubmit} style={{
                background: 'transparent',
                padding: '0',
                marginBottom: '32px',
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <button
                    type="button"
                    onClick={() => setManualType('ingreso')}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'transparent',
                      color: manualType === 'ingreso' ? '#000000' : '#9aa0a6',
                      border: 'none',
                      borderBottom: manualType === 'ingreso' ? '2px solid #000000' : '2px solid transparent',
                      fontSize: '14px',
                      fontWeight: manualType === 'ingreso' ? '500' : '400',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      letterSpacing: '0.1px'
                    }}
                  >
                    Ingreso
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualType('egreso')}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'transparent',
                      color: manualType === 'egreso' ? '#000000' : '#9aa0a6',
                      border: 'none',
                      borderBottom: manualType === 'egreso' ? '2px solid #000000' : '2px solid transparent',
                      fontSize: '14px',
                      fontWeight: manualType === 'egreso' ? '500' : '400',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      letterSpacing: '0.1px'
                    }}
                  >
                    Egreso
                  </button>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    marginBottom: '16px',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '32px',
                    fontFamily: 'inherit',
                    fontWeight: '300',
                    outline: 'none',
                    background: 'transparent',
                    color: '#000000',
                    boxSizing: 'border-box',
                    letterSpacing: '-0.5px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Descripción (opcional)"
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    marginBottom: '20px',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    fontWeight: '400',
                    outline: 'none',
                    background: 'transparent',
                    color: '#000000',
                    boxSizing: 'border-box',
                    letterSpacing: '-0.1px'
                  }}
                />
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualInput(false);
                      setManualAmount('');
                      setManualDescription('');
                    }}
                    style={{
                      padding: '12px 24px',
                      background: 'transparent',
                      color: '#5f6368',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '400',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      letterSpacing: '0.1px'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.6'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 32px',
                      background: '#000000',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      letterSpacing: '0.2px'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {!user ? (
              <div style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
                Inicia sesión para ver tus movimientos
              </div>
            ) : transactions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 24px',
                color: '#5f6368',
                fontSize: '14px'
              }}>
                <p style={{ margin: 0, fontWeight: '400' }}>No hay movimientos aún</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#9aa0a6' }}>
                  Presiona el micrófono o agrega manualmente
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    style={{
                      background: '#ffffff',
                      borderBottom: '1px solid #f0f0f0',
                      padding: '20px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {transaction.type === 'ingreso' ? (
                        <TrendingUp size={18} color="#34a853" strokeWidth={2} />
                      ) : (
                        <TrendingDown size={18} color="#ea4335" strokeWidth={2} />
                      )}
                      <div>
                        <div style={{
                          fontSize: '15px',
                          color: '#000000',
                          marginBottom: '4px',
                          fontWeight: '400',
                          letterSpacing: '-0.1px'
                        }}>
                          {transaction.description}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#9aa0a6',
                          letterSpacing: '0.2px'
                        }}>
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>
                    </div>
                    {/* Boton de eliminar (agregado pequeño detalle de UX) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000000',
                        letterSpacing: '-0.3px'
                      }}>
                        {transaction.type === 'ingreso' ? '+' : '−'}${transaction.amount.toFixed(2)}
                      </div>
                      <button onClick={() => deleteTransaction(transaction.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        <Trash2 size={16} color="#ccc" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Resumen Page */}
          <div style={{
            paddingBottom: '24px',
            marginBottom: '32px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '4px'
            }}>
              {[
                { value: 'dia', label: 'Hoy' },
                { value: 'mes', label: 'Este mes' },
                { value: 'mes-pasado', label: 'Mes pasado' },
                { value: 'año', label: 'Este año' }
              ].map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  style={{
                    padding: '12px 24px',
                    background: selectedPeriod === period.value ? '#000000' : 'transparent',
                    color: selectedPeriod === period.value ? '#ffffff' : '#5f6368',
                    border: 'none',
                    borderBottom: selectedPeriod === period.value ? 'none' : '1px solid #e0e0e0',
                    fontSize: '14px',
                    fontWeight: selectedPeriod === period.value ? '500' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.1px',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPeriod !== period.value) {
                      e.currentTarget.style.color = '#000000';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPeriod !== period.value) {
                      e.currentTarget.style.color = '#5f6368';
                    }
                  }}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period Summary */}
          <div style={{
            marginBottom: '48px'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#5f6368',
              marginBottom: '16px',
              fontWeight: '400',
              letterSpacing: '0.2px'
            }}>
              {getPeriodLabel()}
            </div>

            <div style={{
              fontSize: '56px',
              fontWeight: '300',
              color: '#000000',
              letterSpacing: '-2px',
              marginBottom: '40px',
              lineHeight: '1'
            }}>
              ${balance.toFixed(2)}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px'
            }}>
              <div style={{
                paddingBottom: '24px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <TrendingUp size={24} color="#34a853" strokeWidth={2} />
                  <span style={{
                    fontSize: '14px',
                    color: '#5f6368',
                    fontWeight: '400',
                    letterSpacing: '0.2px'
                  }}>
                    Ingresos totales
                  </span>
                </div>
                <div style={{
                  fontSize: '40px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-1px'
                }}>
                  ${totalIngresos.toFixed(2)}
                </div>
              </div>

              <div style={{
                paddingBottom: '24px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <TrendingDown size={24} color="#ea4335" strokeWidth={2} />
                  <span style={{
                    fontSize: '14px',
                    color: '#5f6368',
                    fontWeight: '400',
                    letterSpacing: '0.2px'
                  }}>
                    Egresos totales
                  </span>
                </div>
                <div style={{
                  fontSize: '40px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-1px'
                }}>
                  ${totalEgresos.toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '13px',
                  color: '#5f6368',
                  marginBottom: '16px',
                  fontWeight: '400',
                  letterSpacing: '0.2px'
                }}>
                  Transacciones en este período: {filteredTransactions.length}
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => setCurrentPage('home')}
            style={{
              padding: '14px 28px',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              letterSpacing: '0.2px'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.85'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Volver al inicio
          </button>
        </>
      )}

      {/* Floating Voice Button */}
      <button
        onClick={startListening}
        disabled={isListening}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: isListening ? '#5f6368' : '#000000',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isListening ? 'scale(1.05)' : 'scale(1)',
          animation: isListening ? 'pulse 1.5s infinite' : 'none'
        }}
      >
        <Mic size={26} color="#ffffff" strokeWidth={1.5} />
      </button>

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 0 0 0 rgba(95, 99, 104, 0.4);
          }
          50% {
            box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 0 0 10px rgba(95, 99, 104, 0);
          }
        }
      `}</style>

      {/* Overlay de estado de voz */}
      {isListening && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#000000',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '24px',
          fontSize: '13px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontWeight: '400',
          letterSpacing: '0.1px'
        }}>
          Escuchando... Di "ingreso" o "egreso" + monto
        </div>
      )}
    </div>
  );
}
