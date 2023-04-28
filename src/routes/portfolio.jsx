import React from 'react'
import { useState, useEffect, useRef } from 'react'
import ScrollDown from '../components/scrolldown.jsx'
import PortfolioViewer from '../components/portfolioviewer.jsx'

function Portfolio() {

    const [tab, setTab] = useState(1);
    const [top, setTop] = useState(false);
    const [series, setSeries] = useState('daily');
    const [picIdx, setPicIdx] = useState(-1);
    const [active, setActive] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const landscapes = [
        { id: 0, src: "../images/portfolio/landscapes/0.jpg",},
        { id: 1, src: "../images/portfolio/landscapes/1.jpg",},
        { id: 2, src: "../images/portfolio/landscapes/2.jpg",},
        { id: 3, src: "../images/portfolio/landscapes/3.jpg",},
        { id: 4, src: "../images/portfolio/landscapes/4.jpg",},
        { id: 5, src: "../images/portfolio/landscapes/5.jpg",},
        { id: 6, src: "../images/portfolio/landscapes/6.jpg",},
        { id: 7, src: "../images/portfolio/landscapes/7.jpg",},
        { id: 8, src: "../images/portfolio/landscapes/8.jpg",},
    ]

    const daily = [
        { id: 0, src: "../images/portfolio/daily/0.jpg",},
        { id: 1, src: "../images/portfolio/daily/1.jpg",},
        { id: 2, src: "../images/portfolio/daily/2.jpg",},
        { id: 3, src: "../images/portfolio/daily/3.jpg",},
        { id: 4, src: "../images/portfolio/daily/4.jpg",},
        { id: 5, src: "../images/portfolio/daily/5.jpg",},
        { id: 6, src: "../images/portfolio/daily/6.jpg",},
        { id: 7, src: "../images/portfolio/daily/7.jpg",},
        { id: 8, src: "../images/portfolio/daily/8.jpg",},
    ]

    const portraits = [
        { id: 0, src: "../images/portfolio/portraits/0.jpg",},
        { id: 1, src: "../images/portfolio/portraits/1.jpg",},
        { id: 2, src: "../images/portfolio/portraits/2.jpg",},
        { id: 3, src: "../images/portfolio/portraits/3.jpg",},
        { id: 4, src: "../images/portfolio/portraits/4.jpg",},
        { id: 5, src: "../images/portfolio/portraits/5.jpg",},
        { id: 6, src: "../images/portfolio/portraits/6.jpg",},
        { id: 7, src: "../images/portfolio/portraits/7.jpg",},
        { id: 8, src: "../images/portfolio/portraits/8.jpg",},
    ]

    const contentRef = useRef(null);

    useEffect(() => {

        window.onscroll = function() {

            if(window.pageYOffset === 0) {
              setTop(true)
            } else {
                setTop(false);
            }
          };
    })

    const handleNavClick = (tab) => {
        if (tab === 0) {
            setSeries("landscapes")
        } else if(tab === 1) {
            setSeries("daily")
        } else if (tab === 2) {
            setSeries("portraits")
        }
        setTab(tab);
    }

    const handleImgClick = (idx) => {
        console.log(":3")
        setPicIdx(idx);
        setActive(true);
    }

    const handleModalChange = () => {
        setActive((prev) => !prev);
    }

    const handleLoad = () => {
        setLoaded(true);
    }

    return (
        <>
            <div>
                <ul id="portfolio-nav">
                    <li className={tab == 0 ? "active": "none"} onClick={() => {handleNavClick(0)}}>Landscapes & Nature</li>
                    <li className={tab == 1 ? "active": "none"} onClick={() => {handleNavClick(1)}}>The Michigan Daily</li>
                    <li className={tab == 2 ? "active": "none"} onClick={() => {handleNavClick(2)}}>Portraits & People</li>
                </ul>
            </div>
            <div className="grid-container">
            {tab === 0 && landscapes.map((image) => (
                <div key={image.id} className="grid-item"  onClick={() => {handleImgClick(image.id)}}>
                    <img className={`portfolio-img ${loaded ? 'loaded' : ''}`} src={`../images/portfolio/landscapes/` + image.id + `.jpg`} onLoad={handleLoad}/>
                </div>
            ))}
            {tab === 1 && daily.map((image) => (
                <div key={image.id} className="grid-item"  onClick={() => {handleImgClick(image.id)}}>
                    <img className={`portfolio-img ${loaded ? 'loaded' : ''}`} src={`../images/portfolio/daily/` + image.id + `.jpg`} onLoad={handleLoad}/>
                </div>
            ))}
            {tab === 2 && portraits.map((image) => (
                <div key={image.id} className="grid-item"  onClick={() => {handleImgClick(image.id)}}>
                    <img className={`portfolio-img ${loaded ? 'loaded' : ''}`} src={`../images/portfolio/portraits/` + image.id + `.jpg`} onLoad={handleLoad}/>
                </div>
            ))}
            </div>
            <ScrollDown active={top}/>
            {active && <PortfolioViewer series={series} img={picIdx} handleChange={handleModalChange}/>}
        </>
    );
}

export default Portfolio;