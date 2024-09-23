import { create } from 'zustand';

export const useDetailUiStore = create((set) => ({
    ShowDetail: false, // The global boolean variable
    setShowDetail: (value) => set({ ShowDetail: value }), // Setter to update the value
}));