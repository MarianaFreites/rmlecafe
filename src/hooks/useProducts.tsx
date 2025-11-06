import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore'; 
import type { Product, NewProductData } from '../types';

interface ProductHook {
  products: Product[];
  loading: boolean;
  error: string | null;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStock: (id: string, inStock: boolean) => Promise<void>;
  addProduct: (productData: NewProductData) => Promise<void>;
}

export const useProducts = (): ProductHook => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateProduct = async (id: string, updatedData: Partial<Product>) => {
  const productRef = doc(db, "products", id);
  await updateDoc(productRef, updatedData);
};

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const fetchedProducts: Product[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            category: data.category || '',
            price: data.price || 0,
            inStock: data.inStock !== undefined ? data.inStock : true,
            imagen: data.imagen || '',  // <- así traes la URL de la imagen
          };
        });
        setProducts(fetchedProducts);
        setLoading(false);
        setError(null);
      }, 
      (err) => {
        console.error("Error al cargar productos:", err);
        setError("No se pudieron cargar los productos");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addProduct = async (productData: NewProductData) => {
    try {
      await addDoc(collection(db, 'products'), {
        ...productData,
        inStock: true,
      });
    } catch (e: any) {
      console.error("Error al agregar producto:", e);
      throw e;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (e: any) {
      console.error("Error al eliminar producto:", e);
      throw e;
    }
  };

  const updateProductStock = async (productId: string, newStockStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        inStock: newStockStatus,
      });
    } catch (e: any) {
      console.error("Error al actualizar stock:", e);
      throw e;
    }
  };

  return { products, loading, error, deleteProduct, updateProductStock, addProduct, updateProduct, };
};
