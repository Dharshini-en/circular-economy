const STORAGE_KEY = 'ai_plm_demo_products'
const FILE_DATABASE = 'ai_plm_demo_files'
const FILE_STORE = 'files'

function openDemoFileDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(FILE_DATABASE, 1)
        request.onupgradeneeded = () => request.result.createObjectStore(FILE_STORE, { keyPath: 'key' })
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

export const DEFAULT_DEMO_PRODUCTS = [
    { product_id: 'GBX001', health_score: 96, remaining_useful_life: 430, service_required: 'No' },
    { product_id: 'GBX002', health_score: 88, remaining_useful_life: 320, service_required: 'No' },
    { product_id: 'GBX003', health_score: 72, remaining_useful_life: 220, service_required: 'Yes' },
    { product_id: 'GBX004', health_score: 58, remaining_useful_life: 90, service_required: 'Yes' },
    { product_id: 'GBX005', health_score: 91, remaining_useful_life: 360, service_required: 'No' },
]

export function readDemoProducts() {
    try {
        const savedProducts = localStorage.getItem(STORAGE_KEY)
        if (savedProducts) {
            const products = JSON.parse(savedProducts)
            if (Array.isArray(products)) return { products, customized: true }
        }
    } catch {
        localStorage.removeItem(STORAGE_KEY)
    }
    return { products: DEFAULT_DEMO_PRODUCTS, customized: false }
}

export function writeDemoProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export async function saveDemoFile(key, file) {
    const database = await openDemoFileDatabase()
    await new Promise((resolve, reject) => {
        const transaction = database.transaction(FILE_STORE, 'readwrite')
        transaction.objectStore(FILE_STORE).put({ key, file })
        transaction.oncomplete = resolve
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
    })
    database.close()
}

export async function downloadDemoFile(key, fileName) {
    const database = await openDemoFileDatabase()
    const storedFile = await new Promise((resolve, reject) => {
        const request = database.transaction(FILE_STORE, 'readonly').objectStore(FILE_STORE).get(key)
        request.onsuccess = () => resolve(request.result?.file)
        request.onerror = () => reject(request.error)
    })
    database.close()
    if (!storedFile) return false

    const url = URL.createObjectURL(storedFile)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
    return true
}

export function summarizeDemoProducts(products) {
    const total = products.length || 1
    return {
        total_products: products.length,
        healthy_products: products.filter((product) => Number(product.health_score) > 80).length,
        products_requiring_service: products.filter((product) => product.service_required === 'Yes').length,
        critical_products: products.filter((product) => Number(product.health_score) <= 60).length,
        average_health_score: products.reduce((sum, product) => sum + Number(product.health_score || 0), 0) / total,
        average_remaining_useful_life: products.reduce((sum, product) => sum + Number(product.remaining_useful_life || 0), 0) / total,
        recent_products: products.slice(-5).reverse(),
    }
}
