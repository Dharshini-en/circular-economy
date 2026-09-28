export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false'