import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  _id: string
  name: string
  price: number
  image: string
  slug: string
  quantity: number
  flavor?: string
  stock: number;
}

interface CartState {
  items: CartItem[]
}

const initialState: CartState = {
  items: []
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<
        Omit<CartItem, 'quantity'> & { quantity?: number; flavor?: string }
      >
    ) => {
      const existingItem = state.items.find(
        item =>
          item._id === action.payload._id &&
          item.flavor === action.payload.flavor
      )

      const amountToAdd = action.payload.quantity || 1

      if (existingItem) {
        existingItem.quantity += amountToAdd
        existingItem.stock = action.payload.stock
      } else {
        state.items.push({ ...action.payload, quantity: amountToAdd })
      }
    },
    decreaseQuantity: (
      state,
      action: PayloadAction<{ _id: string; flavor?: string }>
    ) => {
      const existingItem = state.items.find(
        item =>
          item._id === action.payload._id &&
          item.flavor === action.payload.flavor
      )
      if (existingItem) {
        if (existingItem.quantity === 1) {
          state.items = state.items.filter(
            item =>
              !(
                item._id === action.payload._id &&
                item.flavor === action.payload.flavor
              )
          )
        } else {
          existingItem.quantity -= 1
        }
      }
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ _id: string; flavor?: string }>
    ) => {
      state.items = state.items.filter(
        item =>
          !(
            item._id === action.payload._id &&
            item.flavor === action.payload.flavor
          )
      )
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload
    },
    clearCart: state => {
      state.items = []
    }
  }
})

export const { addToCart, decreaseQuantity, removeFromCart, setCart, clearCart } =
  cartSlice.actions
export default cartSlice.reducer
