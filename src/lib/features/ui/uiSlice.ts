import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AlertState {
  isOpen: boolean
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  onClose?: () => void
}

const initialState: AlertState = {
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showAlert: (state, action: PayloadAction<Omit<AlertState, 'isOpen'>>) => {
      state.isOpen = true
      state.type = action.payload.type
      state.title = action.payload.title
      state.message = action.payload.message
      state.onClose = action.payload.onClose
    },
    hideAlert: (state) => {
      state.isOpen = false
    },
  },
})

export const { showAlert, hideAlert } = uiSlice.actions
export default uiSlice.reducer
