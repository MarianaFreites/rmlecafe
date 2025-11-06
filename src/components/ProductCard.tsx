import type { Product } from '../types';  // Agrega 'type'
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
  };

  return (
    <div style={{ 
      backgroundColor: '#ecdec3ff', 
      color: 'white', 
      padding: '15px', 
      borderRadius: '8px',
      border: product.inStock ? '2px solid #c2a073ff' : '2px solid #000000ff',
      opacity: product.inStock ? 1 : 0.7,
      position: 'relative'
    }}>
      {!product.inStock && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#666',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          SIN STOCK
        </div>
      )}
      <img 
       src={product.imagen || 'https://via.placeholder.com/150'} 
       alt={product.name} 
       style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px', display: 'block', 
    margin: '0 auto' }} 
      />

      <h3 style={{ 
        margin: '0 0 10px 0',
        color: '#000000ff', 
        fontSize: '25px',
        minHeight: '40px',
        textDecoration: !product.inStock ? 'line-through' : 'none'
      }}>
        {product.name}
      </h3>
      
      <p style={{ margin: '5px 0', fontSize: '10px', color: '#797979ff' }}>
        {product.category}
      </p>
      
      <p style={{ 
        margin: '10px 0', 
        fontSize: '18px', 
        fontWeight: 'bold',
        color: '#000000ff'
      }}>
        ${product.price.toFixed(2)}
      </p>
      
      <button 
        onClick={handleAddToCart}
        disabled={!product.inStock}
        style={{ 
          backgroundColor: product.inStock ? '#c0a2a2ff' : '#666', 
          color: product.inStock ? '#000000ff' : '#a38080ff',
          border: 'none', 
          padding: '10px 15px', 
          cursor: product.inStock ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.3s',
          width: '100%',
          fontWeight: 'bold',
          borderRadius: '4px'
        }}
        onMouseOver={(e) => {
          if (product.inStock) {
            e.currentTarget.style.backgroundColor = '#916565ff';
          }
        }}
        onMouseOut={(e) => {
          if (product.inStock) {
            e.currentTarget.style.backgroundColor = 'hsla(33, 22%, 69%, 1.00)';
          }
        }}
      >
        {product.inStock ? 'Agregar al Carrito' : 'Sin Stock'}
      </button>
    </div>
  );
};

export default ProductCard;