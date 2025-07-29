import { useState, useEffect, useRef } from 'react'
import {Cloudinary} from "@cloudinary/url-gen";
import Header from './components/header.jsx'
import Portfolio from './components/portfolio.jsx'
import Published from './components/published.jsx'
import Gallery from './components/gallery.jsx'
import Footer from './components/footer.jsx'
import About from './components/about.jsx'
import Divider from './components/divider.jsx'

import './App.css'

function App() {

  const pageRefs = [useRef(null), useRef(null), useRef(null)];
  const [aboutActive, setAboutActive] = useState(false);

  const cld = new Cloudinary ({
    cloud: {
      cloudName: 'dch9wtpmk'
    }
  })

  return (
    <div className="page-container">
      <Header pagerefs={pageRefs} setAboutActive={setAboutActive}/>
      <About active={aboutActive} setAboutActive={setAboutActive} cloud={cld}/>
      <Portfolio pageref={pageRefs[0]} cloud={cld}/>
      <Divider text={"Published"}/>
      <Published pageref={pageRefs[1]} cloud={cld}/>
      <Divider text={"Galleries"}/>
      <Gallery pageref={pageRefs[2]} cloud={cld}/>
      <Footer/>
    </div>
  )
}

export default App
