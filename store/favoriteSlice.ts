import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FavoriteItem {
  _id: string
  name: string
  price: number
  image: string
  slug: string
  stock?: number
}

interface FavoriteState {
  items: FavoriteItem[]
}

const initialState: FavoriteState = {
  items: []
}

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<FavoriteItem>) => {
      const existingIndex = state.items.findIndex(
        item => item._id === action.payload._id
      )
      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1)
      } else {
        state.items.push(action.payload)
      }
    },
    setFavorites: (state, action: PayloadAction<FavoriteItem[]>) => {
      state.items = action.payload
    }
  }
})

export const { toggleFavorite, setFavorites } = favoriteSlice.actions
export default favoriteSlice.reducer
