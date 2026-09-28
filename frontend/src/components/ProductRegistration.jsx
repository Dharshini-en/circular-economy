import { useState } from 'react'
import { API_BASE_URL } from '../api'

const ProductRegistration = () => {
    const [form, setForm] = useState({
        product_id: 'GBX006',
        product_name: 'Industrial Gearbox',
        product_category: 'Gearbox',
        manufacturer: 'ABC Industries',
        manufacture_date: '2025-05-20',
        expected_life_hours: '3000',
        service_interval_hours: '500',
    })
    const [message, setMessage] = useState('')

    const handleAutoFill = () => {
        setForm({
            product_id: 'GBX006',
            product_name: 'Industrial Gearbox',
            product_category: 'Gearbox',
            manufacturer: 'ABC Industries',
            manufacture_date: '2025-05-20',
            expected_life_hours: '3000',
            service_interval_hours: '500',
        })
    }

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const token = localStorage.getItem('ai_plm_token')
        const formData = new FormData(event.target)
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })
        const data = await response.json()
        setMessage(data.message || 'Product registered successfully')
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
            <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/20">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Product Registration</p>
                        <h1 className="mt-3 text-3xl font-semibold text-white">Register New Gearbox</h1>
                    </div>
                </div>
                {message && <div className="mb-6 rounded-3xl bg-cyan-500/10 p-4 text-cyan-200">{message}</div>}
                <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
                    {[
                        { name: 'product_id', label: 'Product ID' },
                        { name: 'product_name', label: 'Product Name' },
                        { name: 'product_category', label: 'Product Category' },
                        { name: 'manufacturer', label: 'Manufacturer' },
                        { name: 'manufacture_date', label: 'Manufacturing Date', type: 'date' },
                        { name: 'expected_life_hours', label: 'Expected Product Life (Hours)', type: 'number' },
                        { name: 'service_interval_hours', label: 'Service Interval (Hours)', type: 'number' },
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
                    <label className="block lg:col-span-2">
                        <span className="text-slate-300">Upload CAD Model</span>
                        <input type="file" name="cad_file" className="mt-2 w-full text-slate-100" />
                    </label>
                    <label className="block lg:col-span-2">
                        <span className="text-slate-300">Upload BOM</span>
                        <input type="file" name="bom_file" className="mt-2 w-full text-slate-100" />
                    </label>
                    <button type="submit" className="rounded-3xl bg-cyan-500 px-6 py-3 text-white transition hover:bg-cyan-400">Save Product</button>
                    <button type="button" onClick={handleAutoFill} className="rounded-3xl border border-cyan-500 bg-slate-950 px-6 py-3 text-cyan-300 transition hover:bg-slate-900">Auto Fill Example</button>
                </form>
            </div>
        </div>
    )
}

export default ProductRegistration
