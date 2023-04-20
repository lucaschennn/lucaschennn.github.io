import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './routes/home.jsx';
import Pricing from './routes/pricing.jsx';
import Contact from './routes/contact.jsx';
import ErrorPage from './routes/errorpage.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="contact" element={<Contact/>}/>
        <Route path="pricing" element={<Pricing/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
