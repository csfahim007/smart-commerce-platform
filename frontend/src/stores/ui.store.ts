import { create } from 'zustand'

interface UIState {
  mobileMenuOpen: boolean
  cartDrawerOpen: boolean

  setMobileMenuOpen: (open: boolean) => void
  setCartDrawerOpen: (open: boolean) => void

  toggleMobileMenu: () => void
  toggleCartDrawer: () => void
}

export const useUIStore = create<UIState>((set) => ({
  mobileMenuOpen: false,
  cartDrawerOpen: false,

  setMobileMenuOpen: (open) =>
    set({ mobileMenuOpen: open }),

  setCartDrawerOpen: (open) =>
    set({ cartDrawerOpen: open }),

  toggleMobileMenu: () =>
    set((state) => ({
      mobileMenuOpen: !state.mobileMenuOpen,
    })),

  toggleCartDrawer: () =>
    set((state) => ({
      cartDrawerOpen: !state.cartDrawerOpen,
    })),
}))