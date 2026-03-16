import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import admissionReducer from './features/admission/admissionSlice'
import academicReducer from './features/academic/academicSlice'
import paymentReducer from './features/payment/paymentSlice'

import uiReducer from './features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admission: admissionReducer,
    academic: academicReducer,
    payment: paymentReducer,
    ui: uiReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
