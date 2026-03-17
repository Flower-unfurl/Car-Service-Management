import { ClerkProvider } from '@clerk/clerk-react'
import './App.css'
import AppRoute from './routes/AppRoute'

function App() {
    return (
        <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
            <AppRoute />
        </ClerkProvider>
    )
}

export default App
