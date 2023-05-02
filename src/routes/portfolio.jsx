import React from 'react'
import { useState, useEffect, useRef } from 'react'
import ScrollDown from '../components/scrolldown.jsx'
import PortfolioViewer from '../components/portfolioviewer.jsx'
import Footer from '../components/footer.jsx';

function Portfolio() {

    const [tab, setTab] = useState(1);
    const [top, setTop] = useState(false);
    const [picIdx, setPicIdx] = useState(-1);
    const [active, setActive] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [navScroll, setNavScroll] = useState(0);
    const [caption, setCaption] = useState('');

    const photos = [
        [
            { id: 0, caption: "../images/portfolio/landscapes/0.jpg",},
            { id: 1, caption: "../images/portfolio/landscapes/1.jpg",},
            { id: 2, caption: "../images/portfolio/landscapes/2.jpg",},
            { id: 3, caption: "../images/portfolio/landscapes/3.jpg",},
            { id: 4, caption: "../images/portfolio/landscapes/4.jpg",},
            { id: 5, caption: "../images/portfolio/landscapes/5.jpg",},
            { id: 6, caption: "../images/portfolio/landscapes/6.jpg",},
            { id: 7, caption: "../images/portfolio/landscapes/7.jpg",},
            { id: 8, caption: "../images/portfolio/landscapes/8.jpg",},
        ]
        ,
        [
            { id: 0, caption: "Michigan vs Central Michigan Baseball, 3/28/2023",},
            { id: 1, caption: "Michigan vs Ohio State Lacrosse, 4/21/2023",},
            { id: 2, caption: "An evening with Governor Gretchen Whitmer and CNN Anchor Chris Wallace, 3/8/2023",},
            { id: 3, caption: "An evening with Governor Gretchen Whitmer and CNN Anchor Chris Wallace, 3/8/2023",},
            { id: 4, caption: "Michigan vs Ohio State Lacrosse, 4/21/2023",},
            { id: 5, caption: "An evening with Governor Gretchen Whitmer and CNN Anchor Chris Wallace, 3/8/2023",},
            { id: 6, caption: "Nebraska ACLU organized protest against the historic overturning of Roe v. Wade, 6/24/2022",},
            { id: 7, caption: "Nebraska ACLU organized protest against the historic overturning of Roe v. Wade, 6/24/2022",},
            { id: 8, caption: "Michigan vs Central Michigan Baseball, 3/28/2023",},
            { id: 9, caption: "It's TAPpening show hosted by the RhythM Tap Ensemble, 1/21/2023",},
        ]
        ,
        [
            { id: 0, caption: "../images/portfolio/portraits/0.jpg",},
            { id: 1, caption: "../images/portfolio/portraits/1.jpg",},
            { id: 2, caption: "../images/portfolio/portraits/2.jpg",},
            { id: 3, caption: "../images/portfolio/portraits/3.jpg",},
            { id: 4, caption: "../images/portfolio/portraits/4.jpg",},
            { id: 5, caption: "../images/portfolio/portraits/5.jpg",},
            { id: 6, caption: "../images/portfolio/portraits/6.jpg",},
            { id: 7, caption: "../images/portfolio/portraits/7.jpg",},
            { id: 8, caption: "../images/portfolio/portraits/8.jpg",},
            { id: 9, caption: "../images/portfolio/portraits/6.jpg",},
            { id: 10, caption: "../images/portfolio/portraits/7.jpg",},
            { id: 11, caption: "../images/portfolio/portraits/8.jpg",},
        ]
    ]
    const [total, setTotal] = useState(photos[1].length);
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

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
    
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleNavClick = (tab) => {
        setTab(tab);
    }

    const handleImgClick = (idx) => {
        setPicIdx(idx);
        setCaption(photos[tab][idx].caption)
        setActive(true);
    }

    const handleModalChange = () => {
        setActive((prev) => !prev);
    }

    const handleLoad = () => {
        setLoaded(true);
    }

    const handleScroll = (e) => {
        setNavScroll(window.pageYOffset / 2);
    }

    return (
        <>
            <div>
                <ul id="portfolio-nav" style={{transform: `translateY(${navScroll}px)`}}>
                    <li className={tab == 0 ? "active": "none"} onClick={() => {handleNavClick(0)}}>Landscapes & Nature</li>
                    <li className={tab == 1 ? "active": "none"} onClick={() => {handleNavClick(1)}}>The Michigan Daily</li>
                    <li className={tab == 2 ? "active": "none"} onClick={() => {handleNavClick(2)}}>Portraits & People</li>
                </ul>
            </div>
            <div className="grid-container">
            {tab === 0 && photos[0].map((image) => (
                <div key={image.id} className="grid-item"  onClick={() => {handleImgClick(image.id)}}>
                    <img className={`portfolio-img ${loaded ? 'loaded' : ''}`} src={`images/portfolio/landscapes/` + image.id + `.jpg`} onLoad={handleLoad}/>
                </div>
            ))}
            {tab === 1 && photos[1].map((image) => (
                <div key={image.id} className="grid-item"  onClick={() => {handleImgClick(image.id)}}>
                    <img className={`portfolio-img ${loaded ? 'loaded' : ''}`} src={`images/portfolio/daily/` + image.id + `.jpg`} onLoad={handleLoad}/>
                </div>
            ))}
            {tab === 2 && photos[2].map((image) => (
                <div key={image.id} className="grid-item"  onClick={() => {handleImgClick(image.id)}}>
                    <img className={`portfolio-img ${loaded ? 'loaded' : ''}`} src={`images/portfolio/portraits/` + image.id + `.jpg`} onLoad={handleLoad}/>
                </div>
            ))}
            </div>
            <Footer/>
            <ScrollDown active={top}/>
            {active && <PortfolioViewer series={tab} img={picIdx} total={total} handleChange={handleModalChange} caption={caption} photos={photos}/>}
        </>
    );
}

export default Portfolio;