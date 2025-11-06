import React, { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Product, CartItem, CartState } from '../types';

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  total: 0,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let updatedItems: CartItem[] = state.items;

  switch (action.type) {
    case 'ADD_ITEM': {
      const product = action.payload;
      const productId = product.id.toString();
      const existingItem = state.items.find(item => item.id === productId);
      
      if (existingItem) {
        updatedItems = state.items.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedItems = [...state.items, { 
          ...product, 
          id: productId,
          quantity: 1 
        }];
      }
      break;
    }

    case 'REMOVE_ITEM': {
      const productId = action.payload;
      const existingItem = state.items.find(item => item.id === productId);

      if (!existingItem) {
        return state; 
      } 
      else if (existingItem.quantity > 1) {
        updatedItems = state.items.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } 
      else { 
        updatedItems = state.items.filter(item => item.id !== productId);
      }
      break;
    }

    case 'CLEAR_CART': {
      return initialState;
    }

    default:
      return state;
  }
  
  const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items: updatedItems, total: newTotal };
};

interface CartContextType extends CartState {
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };
  
  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};