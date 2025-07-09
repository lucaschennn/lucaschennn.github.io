import { useState, useEffect } from 'react'
import Header from './components/header.jsx'
import Portfolio from './components/portfolio.jsx'
import Published from './components/published.jsx'
import Gallery from './components/gallery.jsx'
import Footer from './components/footer.jsx'

import './App.css'

function App() {
  return (
    <div className="page-container">
      <Header/>
      <Portfolio/>
      <Published/>
      <Gallery/>
      <Footer/>
    </div>
  )
}

export default App
