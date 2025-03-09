import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, BundleProduct, Variant } from '../types';

interface ProductState {
  products: Product[];
  bundleProducts: BundleProduct[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: ProductState = {
  products: [],
  bundleProducts: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 0,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ search = '', page = 0, limit = 10 }: { search?: string; page?: number; limit?: number }) => {
    const response = await fetch(
      `https://stageapi.monkcommerce.app/task/products/search?search=${search}&page=${page}&limit=${limit}`,
      {
        headers: {
          'x-api-key': '72njgfa948d9aS7gs5',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return await response.json();
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addBundleProduct: (state, action: PayloadAction<BundleProduct>) => {
      state.bundleProducts.push(action.payload);
    },
    removeBundleProduct: (state, action: PayloadAction<string>) => {
      state.bundleProducts = state.bundleProducts.filter(
        (product) => product.id !== action.payload
      );
    },
    updateBundleProductDiscount: (
      state,
      action: PayloadAction<{
        id: string;
        discount: { 
          type: 'flat' | 'percentage'; 
          value: number;
          variantId?: number;
        };
      }>
    ) => {
      const { id, discount } = action.payload;
      const productIndex = state.bundleProducts.findIndex(
        (product) => product.id === id
      );
      if (productIndex !== -1) {
        state.bundleProducts[productIndex].discount = discount;
      }
    },
    reorderBundleProducts: (state, action: PayloadAction<BundleProduct[]>) => {
      state.bundleProducts = action.payload;
    },
    updateBundleProductVariants: (
      state,
      action: PayloadAction<{
        id: string;
        variants: Variant[];
      }>
    ) => {
      const { id, variants } = action.payload;
      const productIndex = state.bundleProducts.findIndex(
        (product) => product.id === id
      );
      if (productIndex !== -1) {
        state.bundleProducts[productIndex].selectedVariants = variants;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.currentPage += 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export const {
  addBundleProduct,
  removeBundleProduct,
  updateBundleProductDiscount,
  reorderBundleProducts,
  updateBundleProductVariants,
} = productSlice.actions;

export default productSlice.reducer;