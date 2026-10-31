import { useState, useEffect, useRef } from 'react'
import {Cloudinary} from "@cloudinary/url-gen";
import Header from './components/header.jsx'
import Portfolio from './components/portfolio.jsx'
import Published from './components/published.jsx'
import Gallery from './components/gallery.jsx'
import Footer from './components/footer.jsx'
import About from './components/about.jsx'
import Divider from './components/divider.jsx'
import GradBanner from './components/gradbanner.jsx'

import './App.css'

function App({registry}) {

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
      <GradBanner/>
      <About active={aboutActive} setAboutActive={setAboutActive} cloud={cld}/>
      <Portfolio pageref={pageRefs[0]} cloud={cld} data={registry.portfolio}/>
      <Divider text={"Published"}/>
      <Published pageref={pageRefs[1]} cloud={cld} data={registry.published}/>
      <Divider text={"Galleries"}/>
      <Gallery pageref={pageRefs[2]} cloud={cld} data={registry.galleries}/>
      <Footer/>
    </div>
  )
}

export default App
