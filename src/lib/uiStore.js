import { create } from 'zustand';

export const useUiStore = create((set) => ({
    chatorchatlist: false, // The global boolean variable
    setChatorchatlist: (value) => set({ chatorchatlist: value }), // Setter to update the value
}));