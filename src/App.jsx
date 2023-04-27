import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './routes/home.jsx';
import Header from './components/header.jsx'
import Pricing from './routes/pricing.jsx';
import Portfolio from './routes/portfolio.jsx'
import Contact from './routes/contact.jsx';
import ErrorPage from './routes/errorpage.jsx'
import './App.css'

function App() {
  const [page, setPage] = useState(<Home></Home>);
  const [offset, setOffset] = useState('50%');
  const [subpage, setSubpage] = useState('0'); // 0 is NA
  const [active, setActive] = useState(0);
  
  const handleNavClick = (selected) => {
    const pageOffset = selected - active;
    if(pageOffset == 0) {
      return;
    }

    setActive(selected) //update active state
    setOffset(offset + (pageOffset * 200)); // shift left by offset.
    switch(selected) {
      case 0:
        setPage(<Home></Home>)
      case 1:
        setPage(<Portfolio></Portfolio>)
      case 2:
        setPage(<Pricing></Pricing>)
      case 3:
        setPage(<Book></Book>)
    }
  }

  return (
    <BrowserRouter>
      <Header/>
        <nav>
          <ul id="nav-carousel">
            <li style={{rleft: offset}} className={active == 0 ? "active": ""} onClick={() => {handleNavClick(0)}}>Home</li>
            <li style={{rleft: offset}} className={active == 1 ? "active": ""} onClick={() => {handleNavClick(1)}}>My Work</li>
            <li style={{rleft: offset}} className={active == 2 ? "active": ""} onClick={() => {handleNavClick(2)}}>Pricing</li>
            <li style={{rleft: offset}} className={active == 3 ? "active": ""} onClick={() => {handleNavClick(3)}}>Book Now</li>
          </ul>
        </nav>
      <div id="show-page">
        {page}
      </div>

      {/*
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="contact" element={<Contact/>}/>
        <Route path="pricing" element={<Pricing/>}/>
      </Routes>
  */}
    </BrowserRouter>
  )
}

export default App
