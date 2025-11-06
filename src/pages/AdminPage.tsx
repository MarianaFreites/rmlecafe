import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { useNavigate } from "react-router-dom";
import type { Product } from '../types';
import VentasDelDia from "../components/VentasDelDia";

const AdminPage: React.FC = () => {
  const { user, login, loginWithGoogle, logout, loading: authLoading } = useAuth();
  const { products, loading: productsLoading, error, deleteProduct, updateProductStock, addProduct, updateProduct } = useProducts(); 
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'add'>('inventory');
  const [newProduct, setNewProduct] = useState<{ name: string; category: string; price: number; imagen: string; }>({
    name: '',
    category: 'TORTAS',
    price: 0,
    imagen: ''
  });

  // --- Estados para edición ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; category: string; price: number | string; imagen: string; }>({
    name: '',
    category: 'TORTAS',
    price: 0,
    imagen: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const ADMIN_EMAILS = ['marianafreitessantana@iresm.edu.ar','renataregaldo@iresm.edu.ar' ];

  if (authLoading) {
    return <p style={{ textAlign: 'center', padding: '50px' }}>Cargando...</p>;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      await login(email, password);
    } catch (e: any) {
      setLoginError('Error al iniciar sesión. Verifica el email y la contraseña.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e: any) {
      setLoginError('Error al iniciar sesión con Google.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estas seguro de eliminar este producto?')) {
      try {
        await deleteProduct(id);
      } catch (e) {
        alert('Error al eliminar el producto.');
      }
    }
  };
  
  const handleToggleStock = async (id: string, currentStock: boolean) => {
    try {
      await updateProductStock(id, !currentStock);
    } catch (e) {
      alert('Error al actualizar el stock.');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.imagen) {
      alert("Debes poner una URL válida de la imagen");
      return;
    }

    try {
      await addProduct(newProduct); // aquí se guarda el string en Firestore
      setNewProduct({ name: '', category: 'TORTAS', price: 0, imagen: '' }); // reset
      alert('Producto agregado exitosamente!');
    } catch (e) {
      alert('Error al agregar el producto.');
    }
  };

  // --- Edit handlers ---
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditValues({
      name: product.name,
      category: product.category || 'TORTAS',
      price: product.price ?? 0,
      imagen: product.imagen || ''
    });
    setEditError(null);
  };

  const handleCancelEdit = () => {
    // cierra el modal y limpia estados
    setEditingProduct(null);
    setEditValues({ name: '', category: 'TORTAS', price: 0, imagen: '' });
    setEditError(null);
    setEditLoading(false);
  };

  const basicUrlLooksValid = (s: string) => {
    // validación simple de URL (no infalible)
    return /^https?:\/\/.+\..+/.test(s);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Validaciones mínimas
    if (!editValues.name || String(editValues.name).trim().length === 0) {
      setEditError('El nombre no puede estar vacío.');
      return;
    }

    const priceNumber = Number(editValues.price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      setEditError('El precio debe ser un número mayor o igual a 0.');
      return;
    }

    if (editValues.imagen && !basicUrlLooksValid(editValues.imagen)) {
      setEditError('La URL de la imagen parece inválida. Usá una URL que empiece por http(s)://');
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      // Llamamos al hook que debe existir: updateProduct(id, data)
      await updateProduct(editingProduct.id as string, {
        name: String(editValues.name).trim(),
        category: String(editValues.category),
        price: priceNumber,
        imagen: editValues.imagen
      });
      
      // cerrar modal y limpiar
      setEditingProduct(null);
      setEditValues({ name: '', category: 'TORTAS', price: 0, imagen: '' });
      alert('Producto actualizado correctamente.');
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      setEditError('Error al guardar los cambios. Revisá la consola.');
    } finally {
      setEditLoading(false);
    }
  };

  // Verificar si el usuario está autorizado
  const isAuthorized = user && ADMIN_EMAILS.includes(user.email!);

  if (user && isAuthorized) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f8efed', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#d9b7ffff', borderBottom: '2px solid #fdc4ffff', paddingBottom: '10px', textAlign:"center" }}>
          Administracion
        </h1>
        <p style={{fontWeight: 'bold' }}><b>Bienvenido:</b> {user.email}</p>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={() => setActiveTab('inventory')} style={{ padding: '10px 15px', backgroundColor: activeTab === 'inventory' ? '#eca9e9ff' : '#9b7c63ff', color: activeTab === 'inventory' ? 'white' : '#e1bef1ff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Lista de productos
          </button>
          <button onClick={() => setActiveTab('add')} style={{ padding: '10px 15px', backgroundColor: activeTab === 'add' ? '#a78778ff' : '#e194f8ff', color: activeTab === 'add' ? 'white' : '#ad9884ff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Agregar Producto
          </button>
          <button onClick={() => navigate("/ventas")} style={{ padding: "10px 15px", backgroundColor: "#a87df3",color: "white",border: "none",borderRadius: "4px",cursor: "pointer",fontWeight: "bold",}}>
            Ver Ventas
          </button>

          <button onClick={logout} style={{ padding: '10px 15px', backgroundColor: '#da6969ff', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto' }}>
            Cerrar Sesión
          </button>
        </div>

        {activeTab === 'inventory' && (
          <>
            <h3> Lista de productos </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ backgroundColor: '#c98bf1ff', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Categoría</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Imagen</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Precio</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Stock</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Acciones</th>
                </tr>
              </thead>
              {productsLoading && <p>Cargando lista...</p>}
              {error && <p style={{ color: 'red' }}>Error: {error}</p>}
              
              <tbody>
                {products.length === 0 && !productsLoading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '15px', color: '#555' }}>No hay productos</td></tr>
                ) : (
                  products.map((product: Product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{product.name}</td>
                      <td style={{ padding: '10px' }}>{product.category}</td>
                      <td style={{ padding: '10px' }}>{product.imagen ? ( <img src={product.imagen} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} /> ) : ('Sin imagen')} </td>
                      <td style={{ padding: '10px' }}>${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: product.inStock ? 'green' : '#cd88cfff' }}>
                        {product.inStock ? 'En Stock' : 'Sin Stock'}
                      </td>
                      <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleToggleStock(product.id as string, product.inStock)}
                          style={{ padding: '8px 12px', backgroundColor: product.inStock ? '#1cf009ff' : '#bd9867ff', color: product.inStock ? '#a58e79ffff' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', minWidth: '150px' }}>
                          {product.inStock ? 'Marcar Sin Stock' : 'Reponer Stock'}
                        </button>
                        
                        <button onClick={() => handleEditClick(product)} style={{ padding: '8px 12px', backgroundColor: '#f5b642', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Editar
                        </button>

                        <button 
                          onClick={() => handleDelete(product.id as string)}
                          style={{ padding: '8px 12px', backgroundColor: '#f87878ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}

        {activeTab === 'add' && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '550px' }}>
            <h3 style={{ color: '#e2c0f1ff', marginBottom: '20px' }}>Nuevo Producto</h3>
            <form onSubmit={handleAddProduct}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nombre:</label>
                <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tipo:</label>
                <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="TORTAS">Tortas</option>
                  <option value="CAFES">Cafes</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Imagen:</label>
                <input type="text" placeholder="URL de la imagen" value={newProduct.imagen || ''} onChange={(e) => setNewProduct({ ...newProduct, imagen: e.target.value })} required />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Precio:</label>
                <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})} required min="0" step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>

              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#865722ff', color: '#9e9c9cff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1em' }}>
                Agregar Producto
              </button>
            </form>
          </div>
        )}

        {/* --- Modal / Panel de edición --- */}
        {editingProduct && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '95%', maxWidth: '480px' }}>
              <h3 style={{ marginTop: 0 }}>Editar Producto</h3>
              <form onSubmit={handleSaveEdit}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Nombre</label>
                  <input type="text" value={editValues.name} onChange={(e) => setEditValues({...editValues, name: e.target.value})} required style={{ width: '100%', padding: '8px' }} />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Categoría</label>
                  <select value={editValues.category} onChange={(e) => setEditValues({...editValues, category: e.target.value})} style={{ width: '100%', padding: '8px' }}>
                    <option value="TORTAS">Tortas</option>
                    <option value="CAFES">Cafes</option>
                  </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Imagen (URL)</label>
                  <input type="text" value={editValues.imagen} onChange={(e) => setEditValues({...editValues, imagen: e.target.value})} placeholder="https://..." style={{ width: '100%', padding: '8px' }} />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Precio</label>
                  <input type="number" value={String(editValues.price)} onChange={(e) => setEditValues({...editValues, price: e.target.value})} min="0" step="0.01" style={{ width: '100%', padding: '8px' }} />
                </div>

                {editError && <p style={{ color: 'red' }}>{editError}</p>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" disabled={editLoading} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#5cb85c', color: 'white' }}>
                    {editLoading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button type="button" onClick={handleCancelEdit} disabled={editLoading} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#d9534f', color: 'white' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  if (user && !isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8efed', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2 style={{ color: '#000000ff', marginBottom: '20px' }}>Error</h2>
          <p style={{ marginBottom: '20px' }}>No tienes acceso al panel de administración.</p>
          <button onClick={logout} style={{ padding: '10px 20px', backgroundColor: '#9e8e76ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8efed', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '90%', maxWidth: '400px' }}>
        <h2 style={{ color: '#cca595ff', textAlign: 'center', marginBottom: '30px' }}>Acceso Administrativo</h2>
        
        <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '12px', backgroundColor: '#f1c2e3ff', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>
          Iniciar Sesión con Google
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px', color: '#858585ff' }}>o</div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Contraseña:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>

          {loginError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{loginError}</p>}

          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#8a692cff', color: '#b9ae9fff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1em' }}>
            Iniciar Sesión
          </button>
        </form>
      </div>


    </div>
  );
};

export default AdminPage;
