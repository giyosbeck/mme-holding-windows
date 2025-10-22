import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'uz', // Default: Uzbek
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'warehouse-language',
    }
  )
);

export default useLanguageStore;
