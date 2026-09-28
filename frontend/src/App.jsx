import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import Dashboard from './components/Dashboard'
import ProductRegistration from './components/ProductRegistration'
import ProductDetails from './components/ProductDetails'
import UsageEntry from './components/UsageEntry'
import { IS_DEMO_MODE } from './api'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={IS_DEMO_MODE ? <Navigate to="/" replace /> : <LoginPage />} />
                <Route path="/register" element={IS_DEMO_MODE ? <Navigate to="/" replace /> : <RegisterPage />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/register-product" element={IS_DEMO_MODE ? <Navigate to="/" replace /> : <ProductRegistration />} />
                <Route path="/products/:productId" element={IS_DEMO_MODE ? <Navigate to="/" replace /> : <ProductDetails />} />
                <Route path="/usage-entry" element={IS_DEMO_MODE ? <Navigate to="/" replace /> : <UsageEntry />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
