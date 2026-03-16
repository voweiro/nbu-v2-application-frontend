'use client'

import { Provider } from 'react-redux'
import { store } from '../lib/store'
import { injectStore } from '../lib/api'

// Inject store into api constant to break circular dependency
injectStore(store)

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <Provider store={store}>{children}</Provider>
}
