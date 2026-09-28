import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL, IS_DEMO_MODE } from '../api'
import { readDemoProducts, writeDemoProducts } from '../demoStore'

const UsageEntry = () => {
    const [form, setForm] = useState({
        product_id: 'GBX003',
        product_age_months: '18',
        operating_hours: '3120',
        operating_cycles: '4200',
        average_load: '75',
        average_temperature: '68',
        lubrication_interval: '250',
        last_service_hours: '2800',
        number_of_services: '4',
        oil_condition: 'Good',
        bearing_condition: 'Normal',
        vibration_level: '4',
        health_score: '72',
        remaining_useful_life: '220',
        service_required: 'Yes',
        next_service_days: '14',
    })
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const handleAutoFill = () => {
        setForm({
            product_id: 'GBX003',
            product_age_months: '18',
            operating_hours: '3120',
            operating_cycles: '4200',
            average_load: '75',
            average_temperature: '68',
            lubrication_interval: '250',
            last_service_hours: '2800',
            number_of_services: '4',
            oil_condition: 'Good',
            bearing_condition: 'Normal',
            vibration_level: '4',
            health_score: '72',
            remaining_useful_life: '220',
            service_required: 'Yes',
            next_service_days: '14',
        })
    }

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (IS_DEMO_MODE) {
            const { products } = readDemoProducts()
            const productIndex = products.findIndex((product) => product.product_id === form.product_id)
            if (productIndex < 0) {
                setMessage('Product ID not found. Register the product first.')
                return
            }
            const numericFields = [
                'product_age_months', 'operating_hours', 'operating_cycles', 'average_load',
                'average_temperature', 'lubrication_interval', 'last_service_hours',
                'number_of_services', 'vibration_level', 'health_score',
                'remaining_useful_life', 'next_service_days',
            ]
            const updatedProducts = products.slice()
            updatedProducts[productIndex] = {
                ...updatedProducts[productIndex],
                ...Object.fromEntries(numericFields.map((field) => [field, Number(form[field])])),
                oil_condition: form.oil_condition,
                bearing_condition: form.bearing_condition,
                service_required: form.service_required,
            }
            writeDemoProducts(updatedProducts)
            navigate('/')
            return
        }
        const token = localStorage.getItem('ai_plm_token')
        try {
            const response = await fetch(`${API_BASE_URL}/api/usage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            })
            const data = await response.json()
            setMessage(data.message || 'Usage record saved')
        } catch {
            setMessage('Unable to connect to backend')
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
            <div className="mx-auto max-w-6xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/20">
                <div className="mb-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Usage Data Entry</p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">Record Gearbox Usage</h1>
                    {IS_DEMO_MODE && <p className="mt-2 text-sm text-slate-400">Demo records are saved in this browser only.</p>}
                    <Link to="/" className="mt-3 inline-block text-cyan-300 hover:text-cyan-200">Back to dashboard</Link>
                </div>
                {message && <div className="mb-6 rounded-3xl bg-cyan-500/10 p-4 text-cyan-200">{message}</div>}
                <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
                    {[
                        { name: 'product_id', label: 'Product ID' },
                        { name: 'product_age_months', label: 'Product Age (Months)', type: 'number' },
                        { name: 'operating_hours', label: 'Operating Hours', type: 'number' },
                        { name: 'operating_cycles', label: 'Operating Cycles', type: 'number' },
                        { name: 'average_load', label: 'Average Load %', type: 'number' },
                        { name: 'average_temperature', label: 'Average Temperature', type: 'number' },
                        { name: 'lubrication_interval', label: 'Lubrication Interval', type: 'number' },
                        { name: 'last_service_hours', label: 'Last Service Hours', type: 'number' },
                        { name: 'number_of_services', label: 'Service Count', type: 'number' },
                        { name: 'vibration_level', label: 'Vibration Level', type: 'number' },
                        { name: 'health_score', label: 'Health Score', type: 'number' },
                        { name: 'remaining_useful_life', label: 'Remaining Useful Life', type: 'number' },
                        { name: 'next_service_days', label: 'Next Service Days', type: 'number' },
                    ].map((field) => (
                        <label className="block" key={field.name}>
                            <span className="text-slate-300">{field.label}</span>
                            <input
                                type={field.type || 'text'}
                                name={field.name}
                                value={form[field.name]}
                                onChange={handleChange}
                                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-cyan-500 focus:ring-cyan-500/30"
                            />
                        </label>
                    ))}
                    <label className="block">
                        <span className="text-slate-300">Oil Condition</span>
                        <select name="oil_condition" value={form.oil_condition} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-cyan-500 focus:ring-cyan-500/30">
                            <option>Excellent</option>
                            <option>Good</option>
                            <option>Normal</option>
                            <option>Average</option>
                            <option>Poor</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-slate-300">Bearing Condition</span>
                        <select name="bearing_condition" value={form.bearing_condition} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-cyan-500 focus:ring-cyan-500/30">
                            <option>Excellent</option>
                            <option>Good</option>
                            <option>Normal</option>
                            <option>Average</option>
                            <option>Poor</option>
                            <option>Worn</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-slate-300">Service Required</span>
                        <select name="service_required" value={form.service_required} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-cyan-500 focus:ring-cyan-500/30">
                            <option>No</option>
                            <option>Yes</option>
                        </select>
                    </label>

                    <button type="submit" className="lg:col-span-2 rounded-3xl bg-cyan-500 px-6 py-3 text-white transition hover:bg-cyan-400">Save Usage</button>
                    <button type="button" onClick={handleAutoFill} className="lg:col-span-2 rounded-3xl border border-cyan-500 bg-slate-950 px-6 py-3 text-cyan-300 transition hover:bg-slate-900">Auto Fill Example</button>
                </form>
            </div>
        </div>
    )
}

export default UsageEntry
