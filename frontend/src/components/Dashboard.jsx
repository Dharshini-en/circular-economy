import { useEffect, useState } from 'react'
import { FaChartLine, FaCogs, FaExclamationTriangle, FaRegFileAlt, FaWarehouse } from 'react-icons/fa'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, ArcElement } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL, IS_DEMO_MODE } from '../api'
import { readDemoProducts, summarizeDemoProducts } from '../demoStore'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, ArcElement)

const colorClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-300',
    emerald: 'bg-emerald-500/10 text-emerald-300',
    yellow: 'bg-yellow-500/10 text-yellow-300',
    red: 'bg-red-500/10 text-red-300',
    blue: 'bg-blue-500/10 text-blue-300',
    sky: 'bg-sky-500/10 text-sky-300',
}

const KPI_CARD = ({ title, value, color, icon }) => {
    const badgeStyle = colorClasses[color] || colorClasses.cyan
    return (
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
            <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl ${badgeStyle} flex items-center justify-center`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{title}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                </div>
            </div>
        </div>
    )
}

const DEMO_DASHBOARD = {
    total_products: 5,
    healthy_products: 3,
    products_requiring_service: 2,
    critical_products: 1,
    average_health_score: 86.4,
    average_remaining_useful_life: 312,
    recent_products: [
        { product_id: 'GBX001', health_score: 96, remaining_useful_life: 430, service_required: 'No' },
        { product_id: 'GBX002', health_score: 88, remaining_useful_life: 320, service_required: 'No' },
        { product_id: 'GBX003', health_score: 72, remaining_useful_life: 220, service_required: 'Yes' },
        { product_id: 'GBX004', health_score: 58, remaining_useful_life: 90, service_required: 'Yes' },
        { product_id: 'GBX005', health_score: 91, remaining_useful_life: 360, service_required: 'No' },
    ],
}

const DEMO_ALERTS = [
    { id: 1, alert_type: 'High Vibration', message: 'Gearbox GBX004 vibration exceeded threshold.' },
    { id: 2, alert_type: 'Overdue Service', message: 'GBX003 is due for preventive maintenance.' },
    { id: 3, alert_type: 'Temperature Spike', message: 'GBX002 temperature rose above safe limits.' },
]

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(null)
    const [alerts, setAlerts] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const isDemo = IS_DEMO_MODE && !localStorage.getItem('ai_plm_token')

    useEffect(() => {
        const token = localStorage.getItem('ai_plm_token')
        if (IS_DEMO_MODE && !token) {
            const demoData = readDemoProducts()
            setDashboard(demoData.customized ? summarizeDemoProducts(demoData.products) : DEMO_DASHBOARD)
            setAlerts(DEMO_ALERTS)
            setProducts(demoData.products)
            setRecommendations([
                'Replace lubricant on components with high operating hours',
                'Inspect bearings after the next scheduled shutdown',
                'Reduce load to extend remaining useful life',
            ])
            setLoading(false)
            return
        }
        if (!token) {
            navigate('/login')
            return
        }

        const fetchData = async () => {
            setLoading(true)
            try {
                const [dashboardRes, alertsRes, productsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/api/alerts`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` } }),
                ])
                const dashboardData = dashboardRes.ok ? await dashboardRes.json() : DEMO_DASHBOARD
                const alertsData = alertsRes.ok ? await alertsRes.json() : DEMO_ALERTS
                const productsData = productsRes.ok ? await productsRes.json() : readDemoProducts().products
                setDashboard(dashboardData)
                setAlerts(Array.isArray(alertsData) ? alertsData : DEMO_ALERTS)
                setProducts(Array.isArray(productsData) ? productsData.slice(0, 6) : readDemoProducts().products.slice(0, 6))
            } catch (error) {
                setDashboard(DEMO_DASHBOARD)
                setAlerts(DEMO_ALERTS)
                setProducts(readDemoProducts().products.slice(0, 6))
            } finally {
                setRecommendations([
                    'Replace Lubricant on components with high operating hours',
                    'Inspect bearings after the next scheduled shutdown',
                    'Reduce load to extend remaining useful life',
                ])
                setLoading(false)
            }
        }
        fetchData()
    }, [navigate])

    if (loading || !dashboard) {
        return <div className="min-h-screen bg-slate-950 p-8">Loading dashboard...</div>
    }

    const trendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            { label: 'Health Trend', data: [85, 88, 84, 83, 81, 79, 82], borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.25)' },
        ],
    }
    const lifeData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            { label: 'Remaining Life', data: [480, 450, 430, 395, 360, 330, 300], borderColor: '#60a5fa', backgroundColor: 'rgba(96, 165, 250, 0.25)' },
        ],
    }
    const monthlyMaintenance = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            { label: 'Maintenance Predicted', data: [4, 6, 5, 7, 8, 6, 9], backgroundColor: '#38bdf8' },
        ],
    }
    const productComparison = {
        labels: ['GBX001', 'GBX002', 'GBX003', 'GBX004', 'GBX005'],
        datasets: [
            { label: 'Health Score', data: [85, 96, 55, 98, 72], backgroundColor: ['#22c55e', '#0ea5e9', '#f97316', '#14b8a6', '#facc15'] },
        ],
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] p-6">
                <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
                    <div className="mb-8">
                        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Windchill AI Dashboard</p>
                        <h2 className="mt-4 text-3xl font-semibold">Gearbox Service Monitor</h2>
                        {isDemo && <p className="mt-2 text-sm text-cyan-300">Public demo - sample data</p>}
                    </div>
                    <nav className="space-y-4 text-slate-300">
                        <button className="flex w-full items-center gap-3 rounded-3xl bg-slate-950/50 px-4 py-3 text-left text-white">Dashboard</button>
                    <button onClick={() => navigate('/register-product')} className="flex w-full items-center gap-3 rounded-3xl px-4 py-3 hover:bg-slate-950/50">Register Product</button>
                    <button onClick={() => navigate('/usage-entry')} className="flex w-full items-center gap-3 rounded-3xl px-4 py-3 hover:bg-slate-950/50">Usage Entry</button>
                    </nav>
                </aside>

                <main className="space-y-6">
                    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        <KPI_CARD title="Total Products" value={dashboard.total_products} color="cyan" icon={<FaWarehouse />} />
                        <KPI_CARD title="Healthy Products" value={dashboard.healthy_products} color="emerald" icon={<FaChartLine />} />
                        <KPI_CARD title="Products Requiring Service" value={dashboard.products_requiring_service} color="yellow" icon={<FaExclamationTriangle />} />
                        <KPI_CARD title="Critical Products" value={dashboard.critical_products} color="red" icon={<FaCogs />} />
                        <KPI_CARD title="Avg Health Score" value={`${dashboard.average_health_score.toFixed(1)}%`} color="blue" icon={<FaRegFileAlt />} />
                        <KPI_CARD title="Avg Remaining Life" value={`${dashboard.average_remaining_useful_life.toFixed(0)} hrs`} color="sky" icon={<FaChartLine />} />
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Health Trend</p>
                                    <h3 className="mt-2 text-2xl font-semibold text-white">Product Health Trend</h3>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Line data={trendData} />
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
                                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Remaining Life</p>
                                <h3 className="mt-3 text-2xl font-semibold text-white">Remaining Useful Life Trend</h3>
                                <div className="mt-6">
                                    <Line data={lifeData} />
                                </div>
                            </div>
                            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
                                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Monthly</p>
                                <h3 className="mt-3 text-2xl font-semibold text-white">Maintenance Prediction</h3>
                                <div className="mt-6">
                                    <Bar data={monthlyMaintenance} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Product Comparison</p>
                                    <h3 className="mt-2 text-2xl font-semibold text-white">Health Score Comparison</h3>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Bar data={productComparison} />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
                            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">AI Recommendations</p>
                            <h3 className="mt-3 text-2xl font-semibold text-white">Recommended Actions</h3>
                            <ul className="mt-6 space-y-3">
                                {recommendations.map((item) => (
                                    <li key={item} className="rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100">{item}</li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
                            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Products Due</p>
                            <h3 className="mt-2 text-2xl font-semibold text-white">Products Due for Service</h3>
                            <div className="mt-6 space-y-4">
                                {products.map((product) => (
                                    <button key={product.product_id} onClick={() => navigate(`/products/${product.product_id}`)} className="grid w-full grid-cols-[2fr_1fr] gap-3 rounded-3xl bg-slate-950/70 p-4 text-left hover:bg-slate-800">
                                        <div>
                                            <p className="font-semibold text-white">{product.product_id}</p>
                                            <p className="text-slate-400">Health {product.health_score}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-400">Service</p>
                                            <p className="text-lg font-semibold text-cyan-300">{product.service_required}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
                            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Recent Alerts</p>
                            <h3 className="mt-2 text-2xl font-semibold text-white">Alert Timeline</h3>
                            <div className="mt-6 space-y-4">
                                {alerts.slice(0, 5).map((alert) => (
                                    <div key={alert.id} className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4">
                                        <p className="font-semibold text-white">{alert.alert_type}</p>
                                        <p className="text-sm text-slate-400">{alert.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}


export default Dashboard
