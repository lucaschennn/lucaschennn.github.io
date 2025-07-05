import React from 'react'
import { useState, useEffect, useRef } from 'react'
import ImgCarousel from '../components/imgcarousel.jsx'
function Home() {


    const handleClick = (link) => {
      window.open(link, '_blank')
    }

    return (
      <div id="intro">
        <div id="social-btns">
          <button className="social-btn">
            <span style={{fontSize:'24px', color:'black'}} className="fa" onClick={() => {handleClick("https://www.instagram.com/lucaschenphoto/")}}>&#xf16d;</span>
          </button>
          <button className="social-btn">
            <span style={{fontSize:'24px', color:'black'}} className="fa" onClick={() => {handleClick("https://www.linkedin.com/in/lucas--chen/")}}>&#xf0e1;</span>
          </button>
          <button className="social-btn">
            <span style={{fontSize:'24px', color:'black'}} className="fa" onClick={() => {handleClick("https://github.com/lucaschennn")}}>&#xf092;</span>
          </button>
        </div>
        <div id="home-images">
          <ImgCarousel/>
        </div>
      </div>
    );
}

export default Home;