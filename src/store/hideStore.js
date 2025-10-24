import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useHideStore = create(
  persist(
    (set, get) => ({
      hiddenCategories: [],
      hiddenProducts: [],

      // Category methods
      hideCategory: (categoryId) => {
        set((state) => ({
          hiddenCategories: [...new Set([...state.hiddenCategories, categoryId])]
        }));
      },

      unhideCategory: (categoryId) => {
        set((state) => ({
          hiddenCategories: state.hiddenCategories.filter((id) => id !== categoryId)
        }));
      },

      isCategoryHidden: (categoryId) => {
        return get().hiddenCategories.includes(categoryId);
      },

      // Product methods
      hideProduct: (productId) => {
        set((state) => ({
          hiddenProducts: [...new Set([...state.hiddenProducts, productId])]
        }));
      },

      unhideProduct: (productId) => {
        set((state) => ({
          hiddenProducts: state.hiddenProducts.filter((id) => id !== productId)
        }));
      },

      isProductHidden: (productId) => {
        return get().hiddenProducts.includes(productId);
      },

      // Check if product should be hidden (either directly or via category)
      shouldHideProduct: (productId, categoryId) => {
        const state = get();
        return state.hiddenProducts.includes(productId) || state.hiddenCategories.includes(categoryId);
      },

      // Clear all hidden items
      clearAllHidden: () => {
        set({ hiddenCategories: [], hiddenProducts: [] });
      }
    }),
    {
      name: 'warehouse-hide-storage'
    }
  )
);

export default useHideStore;
