import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE_URL, IS_DEMO_MODE } from '../api'
import { readDemoProducts } from '../demoStore'

const ProductDetails = () => {
    const { productId } = useParams()
    const [details, setDetails] = useState(null)

    useEffect(() => {
        if (IS_DEMO_MODE) {
            const { products } = readDemoProducts()
            const product = products.find((item) => item.product_id === productId)
            if (product) {
                setDetails({
                    product: {
                        product_name: 'Industrial Gearbox',
                        product_category: 'Gearbox',
                        manufacturer: 'ABC Industries',
                        manufacture_date: 'Not specified',
                        expected_life_hours: 3000,
                        service_interval_hours: 500,
                        ...product,
                    },
                    usage: product.operating_hours ? product : null,
                    maintenance: product.maintenance || [],
                })
            }
            return
        }
        const token = localStorage.getItem('ai_plm_token')
        if (!token) return

        fetch(`${API_BASE_URL}/api/products/${productId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => res.json())
            .then(setDetails)
    }, [productId])

    if (!details) {
        return (
            <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
                <p>Product not found.</p>
                <Link to="/" className="mt-4 inline-block text-cyan-300">Back to dashboard</Link>
            </div>
            )
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
            <div className="mx-auto max-w-6xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/20">
                <Link to="/" className="mb-6 inline-block text-cyan-300 hover:text-cyan-200">Back to dashboard</Link>
                <div className="grid gap-6 lg:grid-cols-[1.8fr_1.2fr]">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Product Details</p>
                        <h1 className="mt-3 text-3xl font-semibold text-white">{details.product.product_name} ({details.product.product_id})</h1>
                        <p className="mt-2 text-slate-400">Category: {details.product.product_category} • Manufacturer: {details.product.manufacturer}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">CAD & BOM</p>
                        <div className="mt-4 space-y-3">
                            <div className="rounded-3xl bg-slate-900 p-4 text-slate-100">CAD File: {details.product.cad_file || 'Not uploaded'}</div>
                            <div className="rounded-3xl bg-slate-900 p-4 text-slate-100">BOM File: {details.product.bom_file || 'Not uploaded'}</div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="text-xl font-semibold text-white">Specifications</h2>
                        <dl className="mt-5 space-y-4 text-slate-300">
                            <div>
                                <dt className="font-medium text-slate-400">Manufacture Date</dt>
                                <dd className="mt-1">{details.product.manufacture_date}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-400">Expected Life</dt>
                                <dd className="mt-1">{details.product.expected_life_hours} hrs</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-400">Service Interval</dt>
                                <dd className="mt-1">{details.product.service_interval_hours} hrs</dd>
                            </div>
                        </dl>
                    </div>
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
                        <h2 className="text-xl font-semibold text-white">Bill of Materials</h2>
                        <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-slate-100">
                            <p>Specification sheet and BOM viewer is available for uploaded files.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="text-xl font-semibold text-white">Maintenance History</h2>
                        <div className="mt-5 space-y-4">
                            {details.maintenance.map((item) => (
                                <div key={item.id} className="rounded-3xl bg-slate-950/80 p-4">
                                    <p className="font-semibold text-white">{item.service_type}</p>
                                    <p className="text-slate-400 text-sm">{item.maintenance_date} • {item.status}</p>
                                    <p className="mt-2 text-slate-300">{item.notes}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="text-xl font-semibold text-white">Recent Usage</h2>
                        <div className="mt-5 space-y-4 text-slate-300">
                            {details.usage ? (
                                <div className="grid gap-4">
                                    <p>Hours: {details.usage.operating_hours}</p>
                                    <p>Cycles: {details.usage.operating_cycles}</p>
                                    <p>Load: {details.usage.average_load}%</p>
                                    <p>Temp: {details.usage.average_temperature} °C</p>
                                    <p>Oil: {details.usage.oil_condition}</p>
                                    <p>Bearing: {details.usage.bearing_condition}</p>
                                </div>
                            ) : (
                                <p>No usage records available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
