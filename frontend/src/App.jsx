import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import Dashboard from './components/Dashboard'
import ProductRegistration from './components/ProductRegistration'
import ProductDetails from './components/ProductDetails'
import UsageEntry from './components/UsageEntry'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/register-product" element={<ProductRegistration />} />
                <Route path="/products/:productId" element={<ProductDetails />} />
                <Route path="/usage-entry" element={<UsageEntry />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
