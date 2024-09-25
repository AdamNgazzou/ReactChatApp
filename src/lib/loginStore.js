
import { create } from 'zustand';

export const useLoginorregisterStore = create((set) => ({
    Loginorregister: false, // The global boolean variable
    setLoginorregister: (value) => set({ Loginorregister: value }), // Setter to update the value
}));