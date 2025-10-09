import React, { useState } from 'react';
import { FiPhone, FiCopy, FiCheck } from 'react-icons/fi';

function ContactosSection() {
  const [copiedNumber, setCopiedNumber] = useState(null);

  const contactos = [
    {
      categoria: 'Emergencias',
      numero: '0810-220-6060',
      descripcion: 'Disponible 24/7',
      color: 'red',
      esEmergencia: true
    },
    {
      categoria: 'Administración',
      numero: '7079-4848',
      descripcion: 'Consultas administrativas',
      color: 'blue',
      esEmergencia: false
    },
    {
      categoria: 'WhatsApp',
      numero: '11-3522-2025',
      descripcion: 'Atención al afiliado',
      color: 'green',
      esEmergencia: false,
      esWhatsApp: true
    }
  ];

  const copiarNumero = async (numero) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(numero);
        setCopiedNumber(numero);
        setTimeout(() => setCopiedNumber(null), 2000);
      } else {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = numero;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedNumber(numero);
        setTimeout(() => setCopiedNumber(null), 2000);
      }
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const llamarNumero = (numero) => {
    window.open(`tel:${numero}`, '_self');
  };

  const abrirWhatsApp = (numero) => {
    const numeroLimpio = numero.replace(/[\s-]/g, '');
    window.open(`https://wa.me/54${numeroLimpio}`, '_blank');
  };

  const getColorClasses = (color) => {
    const colors = {
      red: {
        bg: 'bg-white dark:bg-[#23272b]',
        border: 'border-red-200 dark:border-red-800',
        title: 'text-red-600 dark:text-red-400',
        number: 'text-gray-900 dark:text-gray-100',
        desc: 'text-gray-600 dark:text-gray-300',
        button: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
      },
      blue: {
        bg: 'bg-white dark:bg-[#23272b]',
        border: 'border-blue-200 dark:border-blue-800',
        title: 'text-blue-600 dark:text-blue-400',
        number: 'text-gray-900 dark:text-gray-100',
        desc: 'text-gray-600 dark:text-gray-300',
        button: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
      },
      green: {
        bg: 'bg-white dark:bg-[#23272b]',
        border: 'border-green-200 dark:border-green-800',
        title: 'text-green-600 dark:text-green-400',
        number: 'text-gray-900 dark:text-gray-100',
        desc: 'text-gray-600 dark:text-gray-300',
        button: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
        📞 Números Importantes
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contactos.map((contacto, index) => {
          const colors = getColorClasses(contacto.color);
          const isCopied = copiedNumber === contacto.numero;
          
          return (
            <div 
              key={index}
              className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
            >
              <div className="text-center mb-4">
                <h2 className={`text-xl font-bold ${colors.title} mb-2`}>
                  {contacto.esEmergencia ? '🚨' : contacto.esWhatsApp ? '💬' : '🏢'} {contacto.categoria}
                </h2>
                <p className={`text-2xl font-bold ${colors.number} mb-2`}>
                  {contacto.numero}
                </p>
                <p className={`text-sm ${colors.desc}`}>
                  {contacto.descripcion}
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => llamarNumero(contacto.numero)}
                  className={`w-full ${colors.button} text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md`}
                >
                  <FiPhone className="text-lg" />
                  Llamar
                </button>
                
                <button
                  onClick={() => copiarNumero(contacto.numero)}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md border border-gray-200 dark:border-gray-600"
                >
                  {isCopied ? (
                    <>
                      <FiCheck className="text-lg text-green-600 dark:text-green-400" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <FiCopy className="text-lg" />
                      Copiar
                    </>
                  )}
                </button>
                
                {contacto.esWhatsApp && (
                  <button
                    onClick={() => abrirWhatsApp(contacto.numero)}
                    className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                  >
                    💬 WhatsApp
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Información adicional */}
      <div className="mt-8 bg-white dark:bg-[#23272b] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="text-xl text-gray-500 dark:text-gray-400">ℹ️</div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">
              Información Importante
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>• <strong>Emergencias:</strong> Disponible las 24 horas</li>
              <li>• <strong>Administración:</strong> Horario de oficina</li>
              <li>• <strong>WhatsApp:</strong> Respuesta rápida para socios</li>
              <li>• Los números están optimizados para móviles</li>
              <li>• <strong>Copiar:</strong> Guarda el número en el portapapeles</li>
              <li>• <strong>Llamar:</strong> Abre la aplicación de teléfono</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactosSection;