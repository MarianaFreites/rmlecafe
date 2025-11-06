import React, { useEffect, useState } from 'react';
import ProductCard from './components/ProductCard';
import CartDisplay from './components/CartDisplay';
import { useProducts } from './hooks/useProducts';
import './index.css';


const App: React.FC = () => {
  const { products, loading, error } = useProducts();
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      console.log('✅ PWA puede instalarse!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // También verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ Ya está instalada como PWA');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
        console.log('Usuario aceptó instalar la PWA');
      }
    }
  };

  return (
    <div>
      <header style={{ 
        backgroundImage: "url('/Opcion_de_portada2.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white', 
        padding: '1rem', 
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Overlay negro semi-transparente */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // 0.5 = 50% oscuro
          zIndex: 0 
        }}></div>

        <img src="/LOGO_RM_Transparente.png" alt="Logo RM Le'Cafe"
         style={{ width: '60px', height: '60px', objectFit: 'contain', position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',  zIndex: 2 }}
        />
        <h1 style={{ margin: '0 0 10px 0', fontFamily:"Playfair Display, serif", fontWeight: 700, fontStyle: 'italic', fontSize: '2.5rem', color: '#ffffff', position: 'relative', zIndex: 2 }}>RM Le'Cafe</h1>
      </header>
      
      <CartDisplay />
      
      <main className="product-grid" style={{ paddingBottom: '80px' }}>
        {loading && <p>Productos...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        
        {products
          .filter(product => product.inStock)
          .map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        }

      </main>

       {!loading && (
  <footer 
    style={{ 
      backgroundColor: '#88745aff', 
      color: 'white',
      padding: '1rem 0', 
      textAlign: 'center', 
      width: '100%',
      boxSizing: 'border-box',
    }}
  >
    <b>
      <p style={{ margin: 0, lineHeight: '1.5' }}>
        &copy; 2025 - Proyecto escolar - Freites & Regaldo
      </p>
    </b>
  </footer>
)}

    </div>
  );
};

export default App;