import { createRoot } from 'react-dom/client'
import App from './App'

import portfolio from './assets/portfolio.json'
import published from './assets/published.json'
import galleries from './assets/galleries.json'

import './index.css'


createRoot(document.getElementById('root')).render(
    <App registry={{portfolio, published, galleries}}/>
)
