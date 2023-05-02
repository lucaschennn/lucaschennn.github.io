import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import App from './App'
import Home from './routes/home.jsx';
import Header from './components/header.jsx'
import Pricing from './routes/pricing.jsx';
import Portfolio from './routes/portfolio.jsx'
import Contact from './routes/contact.jsx';
import ErrorPage from './routes/errorpage.jsx'
import './index.css'


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App/>
    <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="portfolio" element={<Portfolio/>}/>
          <Route path="pricing" element={<Pricing/>}/>
          <Route path="contact" element={<Contact/>}/>
      </Routes>
  </BrowserRouter>

)
