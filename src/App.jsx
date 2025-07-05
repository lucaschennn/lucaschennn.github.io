import { useState, useEffect } from 'react'
import Header from './components/header.jsx'
import Portfolio from './components/portfolio.jsx'

import './App.css'

function App() {
  return (
    <div className="page-container">
      <Header/>
      <Portfolio/>
    </div>
  )
}

export default App
