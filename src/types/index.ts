export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    inStock: boolean;
    imagen?: string; // ✅ puede ser opcional
}
//Esto para crear new producto
export type NewProductData = {
  name: string;
  category: string;
  price: number;
  imagen: string; // antes era File | null
};


export interface CartItem extends Product {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
}