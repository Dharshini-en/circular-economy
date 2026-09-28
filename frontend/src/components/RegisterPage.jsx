import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE_URL } from '../api'

const RegisterPage = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setMessage('')
        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            })
            const data = await response.json()
            if (response.ok) {
                navigate('/login')
            } else {
                setMessage(data.message || 'Registration failed')
            }
        } catch (error) {
            setMessage('Unable to connect to backend')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
            <div className="max-w-lg w-full rounded-3xl border border-slate-700 bg-slate-950/95 p-10 shadow-2xl shadow-slate-950/20">
                <div className="mb-8 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Predictive Service Scheduling</p>
                    <h1 className="mt-4 text-4xl font-semibold text-white">Register account</h1>
                    <p className="mt-2 text-slate-400">Create your industrial gearbox monitoring workspace.</p>
                </div>
                {message && <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-red-200">{message}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="block">
                        <span className="text-slate-300">Username</span>
                        <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:ring-cyan-500/30" />
                    </label>
                    <label className="block">
                        <span className="text-slate-300">Email</span>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:ring-cyan-500/30" />
                    </label>
                    <label className="block">
                        <span className="text-slate-300">Password</span>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:ring-cyan-500/30" />
                    </label>
                    <button type="submit" className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Register</button>
                </form>
                <p className="mt-5 text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="text-cyan-300 hover:text-cyan-200">Sign in</Link></p>
            </div>
        </div>
    )
}

export default RegisterPage
