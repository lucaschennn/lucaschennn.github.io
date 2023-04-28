import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './routes/home.jsx';
import Header from './components/header.jsx'
import Pricing from './routes/pricing.jsx';
import Portfolio from './routes/portfolio.jsx'
import Book from './routes/book.jsx'
import Contact from './routes/contact.jsx';
import ErrorPage from './routes/errorpage.jsx'
import './App.css'

function App() {
  const [page, setPage] = useState(<Home/>);
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
    if(selected === 0) {
      setPage(<Home/>)
    } else if (selected === 1) {
      setPage(<Portfolio/>)
    } else if (selected === 2) {
      setPage(<Pricing/>)
    } else if (selected === 3) {
      setPage(<Book/>)
    } else {
      console.log("What the fuck")
    }
/*
    switch(selected) {
      case 0:
        setPage(<Home/>)
      case 1:
        setPage(<Portfolio/>)
      case 2:
        setPage(<Pricing/>)
      case 3:
        setPage(<Book/>)
      default:
        console.log("what the fuck")
    }
    */
  }
  console.log("render!")
  return (
    <BrowserRouter>
      {/*<Header/>*/}

        <ul id="nav-carousel">
          <li className={active == 0 ? "active": ""} onClick={() => {handleNavClick(0)}}>Home</li>
          <li className={active == 1 ? "active": ""} onClick={() => {handleNavClick(1)}}>My Work</li>
          <li className={active == 2 ? "active": ""} onClick={() => {handleNavClick(2)}}>Pricing</li>
          <li className={active == 3 ? "active": ""} onClick={() => {handleNavClick(3)}}>Book Now</li>
        </ul>

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
