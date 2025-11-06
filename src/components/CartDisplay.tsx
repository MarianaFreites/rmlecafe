import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";


const ALIAS_TRANSFERENCIA = 'rm.lecafe.vcp'; 

const CartDisplay: React.FC = () => {
  const { items, total, removeItem, clearCart, addItem } = useCart(); 
  const [isOpen, setIsOpen] = useState(false);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false); 
  const [copySuccess, setCopySuccess] = useState(''); 
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleFinishPurchase = () => {
    setIsOpen(false); 
    setShowPaymentModal(true); 
  };
  
  const handleCopyAlias = () => {
    navigator.clipboard.writeText(ALIAS_TRANSFERENCIA).then(() => {
      setCopySuccess('¡Alias copiado!');
      setTimeout(() => setCopySuccess(''), 3000); 
    }, (err) => {
      setCopySuccess('Error al copiar el alias. Intenta copiarlo manualmente.');
      console.error('Error al copiar: ', err);
    });
  };


  const handlePaymentCompleted = async () => {
  try {
    // Guardar venta en Firebase
    await addDoc(collection(db, "ventas"), {
      productos: items.map((p) => ({
        nombre: p.name,
        cantidad: p.quantity,
        precio: p.price,
      })),
      total: items.reduce((sum, p) => sum + p.price * p.quantity, 0),
      fecha: new Date().toLocaleDateString("es-AR"),
    });

    alert("✅ Venta registrada correctamente.");

    // Vaciar carrito con el hook
    clearCart();

    setShowPaymentModal(false);
    setCopySuccess("");
    alert("¡Gracias por tu compra 💕!");
  } catch (error) {
    console.error("Error al guardar venta:", error);
  }
};


  
  const baseButtonStyle = {
    border: 'none',
    padding: '5px 10px',
    cursor: 'pointer',
    borderRadius: '4px',
    marginLeft: '5px',
    fontWeight: 'bold',
  };

  const controlButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#8a7b65ff', 
    color: 'white', 
    width: '25px', 
    height: '25px', 
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bolder',
    marginLeft: '5px'
  };
  
  const primaryButtonStyle = {
      ...baseButtonStyle,
      width: '100%',
      marginTop: '15px',
      backgroundColor: '#b39e92ff', 
      color: '#816c57ff', 
      fontSize: '1.1em',
  };
  
  const secondaryButtonStyle = {
      ...baseButtonStyle,
      width: '100%',
      marginTop: '10px',
      backgroundColor: '#886d46ff',
      color: 'white',
      fontSize: '0.9em',
      padding: '8px 10px'
  };
  
  const transferButtonStyle = {
      ...baseButtonStyle,
      width: '100%',
      padding: '12px 10px',
      backgroundColor: '#b69d6fff', 
      color: 'white',
      fontSize: '1.2em',
      marginTop: '15px'
  };
  
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100 }}>
        <div>
          <span className="absolute -top-1 -left-1 bg-[#ff2ba3] text-white sm:text-base text-xs font-bold rounded-full w-4 sm:w-7 h-4 sm:h-7 flex items-center justify-center">
             <b>({totalItems})</b>
          </span>
        </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          backgroundColor: 'transparent', 
          color: 'white', 
          border: 'none', 
          borderRadius: '50%', 
          width: '50px', 
          height: '50px', 
          fontSize: '1.9em', 
          cursor: 'pointer',
        }}>
        🛒
      </button>
      
      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '60px', 
          right: '0', 
          width: '300px', 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#555' }}>El carrito está vacío.</p>
          ) : (
            <>
              <h3 style={{ borderBottom: '2px solid #a87662ff', paddingBottom: '10px', margin: '0 0 15px' }}>Tu Pedido</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map((item) => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dotted #eee', padding: '8px 0' }}>
                    <span style={{ flexGrow: 1 }}>{item.name}</span>
                    
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '10px', fontWeight: 'bold' }}>x {item.quantity}</span>

                        <button 
                            onClick={() => addItem(item)}
                            style={{ ...controlButtonStyle, backgroundColor: '#866647ff', color: '#ffffffff', marginRight: '5px' }} 
                            title="Agregar 1 unidad">
                            <b>+</b>
                        </button>
                        
                        <button 
                            onClick={() => removeItem(item.id.toString())}
                            style={controlButtonStyle} 
                            title="Remover 1 unidad">
                            <b>-</b>
                        </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              <hr style={{ margin: '15px 0' }}/>
              <p style={{ fontWeight: 'bold', fontSize: '1.2em', textAlign: 'right' }}>
                  Total: ${total.toFixed(2)}
              </p>

              <button
                  onClick={handleFinishPurchase}
                  style={primaryButtonStyle}
                  disabled={items.length === 0}>
                  Pagar
              </button>
              
              <button
                  onClick={clearCart} 
                  style={secondaryButtonStyle}>
                  Vaciar Carrito
              </button>
            </>
          )}
        </div>
      )}
      
      {showPaymentModal && (
          <div 
              style={{ 
                  position: 'fixed', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  backgroundColor: 'white', 
                  padding: '30px', 
                  borderRadius: '10px', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4)', 
                  zIndex: 101, 
                  maxWidth: '350px',
                  width: '90%'
              }}>

              <b><u></u><h4 style={{ color: '#000000ff', textAlign: 'center' }}>Pagar</h4></b>
              
              <button 
                  onClick={handleCopyAlias}
                  style={transferButtonStyle}>
                  Copiar alias
              </button>
              
              {copySuccess && (
                  <p style={{ color: 'green', fontSize: '0.9em', marginTop: '10px', textAlign: 'center' }}>
                      {copySuccess}
                  </p>
              )}

              <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                  <p style={{ margin: '0', fontSize: '0.9em', color: '#555' }}>Alias:</p>
                  <p style={{ margin: '5px 0 0', fontWeight: 'bold', fontSize: '1.1em', userSelect: 'all' }}>
                      {ALIAS_TRANSFERENCIA}
                  </p>
              </div>
              
              <button
                  onClick={handlePaymentCompleted}
                  style={{ ...secondaryButtonStyle, backgroundColor: '#775e38ff', color: '#9c8265ff', marginTop: '20px' }}>
                  Transferencia realizada
              </button>
              
              <button
                  onClick={() => setShowPaymentModal(false)}
                  style={{ ...baseButtonStyle, backgroundColor: '#ddd', color: '#333', marginTop: '10px', width: '100%' }}>
                  Volver
              </button>
              
          </div>
      )}
    </div>
  );
};

export default CartDisplay;