import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE_URL } from '../api'

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const login = async (loginEmail, loginPassword) => {
        setMessage('')
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            })
            const data = await response.json()
            if (response.ok) {
                localStorage.setItem('ai_plm_token', data.access_token)
                navigate('/')
            } else {
                setMessage(data.message || 'Login failed')
            }
        } catch (error) {
            setMessage('Unable to connect to backend')
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        await login(email, password)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
            <div className="max-w-lg w-full rounded-3xl border border-slate-700 bg-slate-950/95 p-10 shadow-2xl shadow-slate-950/20">
                <div className="mb-8 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Predictive Service Scheduling</p>
                    <h1 className="mt-4 text-4xl font-semibold text-white">Sign in to Windchill AI</h1>
                    <p className="mt-2 text-slate-400">Industrial gearbox maintenance intelligence.</p>
                </div>
                {message && <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-red-200">{message}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="block">
                        <span className="text-slate-300">Email</span>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:ring-cyan-500/30" />
                    </label>
                    <label className="block">
                        <span className="text-slate-300">Password</span>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:ring-cyan-500/30" />
                    </label>
                    <button type="submit" className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Login</button>
                </form>
                <p className="mt-5 text-center text-sm text-slate-400">New user? <Link to="/register" className="text-cyan-300 hover:text-cyan-200">Create account</Link></p>
            </div>
        </div>
    )
}

export default LoginPage
