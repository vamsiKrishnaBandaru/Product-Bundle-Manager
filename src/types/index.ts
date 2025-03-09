import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../store/productSlice';

export interface Product {
  id: number;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  variants: Variant[];
}

export interface Variant {
  id: number;
  title: string;
  price: number;
}

export interface BundleProduct {
  id: string;
  product: Product;
  selectedVariants: Variant[];
  discount: {
    type: 'flat' | 'percentage';
    value: number;
  };
}
  
  export interface Image {
    id: number;
    product_id: number;
    src: string;
  }

  
  interface Discount {
    type: 'flat' | 'percentage';
    value: number;
    variantId?: number;
  }

export interface FetchProductsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
}

export const store = configureStore({
  reducer: {
    products: productReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;