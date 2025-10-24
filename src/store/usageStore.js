import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUsageStore = create(
  persist(
    (set, get) => ({
      categoryUsage: {},
      productUsage: {},

      // Category usage methods
      incrementCategoryUsage: (categoryId) => {
        set((state) => ({
          categoryUsage: {
            ...state.categoryUsage,
            [categoryId]: (state.categoryUsage[categoryId] || 0) + 1
          }
        }));
      },

      getCategoryUsage: (categoryId) => {
        return get().categoryUsage[categoryId] || 0;
      },

      // Product usage methods
      incrementProductUsage: (productId) => {
        set((state) => ({
          productUsage: {
            ...state.productUsage,
            [productId]: (state.productUsage[productId] || 0) + 1
          }
        }));
      },

      getProductUsage: (productId) => {
        return get().productUsage[productId] || 0;
      },

      // Clear all usage data
      clearAllUsage: () => {
        set({ categoryUsage: {}, productUsage: {} });
      }
    }),
    {
      name: 'warehouse-usage-storage'
    }
  )
);

export default useUsageStore;
