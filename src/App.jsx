import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import './App.css'

function App() {
  //const [page, setPage] = useState(<Home/>);
  const [offset, setOffset] = useState('50%');
  const [active, setActive] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if(location.pathname === '/') {
      setActive(0);
    } else if(location.pathname === '/portfolio') {
      setActive(1);
    } else if(location.pathname === '/pricing') {
      setActive(2);
    } else {
      setActive(3);
    }
  }, [])
  
  const handleNavClick = (selected) => {
    const pageOffset = selected - active;
    if(pageOffset == 0) {
      return;
    }

    setActive(selected) //update active state
    setOffset(offset + (pageOffset * 200)); // shift left by offset.
    if(selected === 0) {
      //setPage(<Home/>)
      navigate('/')
    } else if (selected === 1) {
      //setPage(<Portfolio/>)
      navigate('/portfolio')
    } else if (selected === 3) {
      //setPage(<Contact/>)
      navigate('/contact')
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
  return (
    <>
      {/*<Header/>*/}
        <ul className={`nav-carousel ${location.pathname === '/' ? 'alt' :  ''}`}>
          <li className={active == 0 ? "active": ""} onClick={() => {handleNavClick(0)}}>Home</li>
          <li className={active == 1 ? "active": ""} onClick={() => {handleNavClick(1)}}>My Work</li>
          <li className={active == 3 ? "active": ""} onClick={() => {handleNavClick(3)}}>Contact</li>
        </ul>
      <div id="show-page">

        {/*page*/}
      </div>

      {/*
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="contact" element={<Contact/>}/>
        <Route path="pricing" element={<Pricing/>}/>
      </Routes>
  */}
    </>
  )
}

export default App
