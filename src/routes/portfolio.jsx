/*
Only load tab that is selected.

    const [tab, setTab] = useState(1);
    const [top, setTop] = useState(false);
    const [picIdx, setPicIdx] = useState(-1);
    const [active, setActive] = useState(false);
    
    const [navScroll, setNavScroll] = useState(0);
    const [caption, setCaption] = useState('');


    1. const [preloaded, setPreloaded] = useState()
    2. in a useEffect, create an array of promises that resolve with each image url loads. after promise.all(promises) is true, setPreloaded(loadedimages)
        a. could modify the dependency array to run when tab changes. choose which images to load based on tab.

    3. in the return, run a map on preloaded.
*/

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
    
    const [navScroll, setNavScroll] = useState(0);
    const [caption, setCaption] = useState('');

    const photos = [
        [
            { id: 0, caption: "Milky Way captured near Wenatchee, Washington State. 5/28/2023", },
            { id: 1, caption: "Male Ruby-throated Hummingbird near Seattle, Washington. 6/15/2021", },
            { id: 2, caption: "Haymarket Pedestrian Bridge near Pinnacle Bank Arena in Lincoln, Nebraska. 3/2/2022", },
            { id: 3, caption: "Starscape captured at Vedauwoo near Laramie, Wyoming. 8/16/2022", },
            { id: 4, caption: "Two tree swallows near Pioneer's Park in Lincoln, Nebraska. 5/6/2022", },
            { id: 5, caption: "Tree Sparrow at Kensington Metropark, Michigan. 1/8/2023", },
            { id: 6, caption: "House Finch in downtown Los Angeles. 5/14/2022", },
            { id: 7, caption: "Evening landscape of the sandhills near Valentine, Nebraska. 5/24/2021", },
            { id: 8, caption: "A hungry squirrel searches for food amongst the fall leaves. 10/22/2023", },
            { id: 9, caption: "The sunrise cuts through a bamboo forest near Xuancheng, China. 8/11/2023", },
            { id: 10, caption: "A rainy Lotus flower pond near Huzhou, China. 8/16/2023", },
        ]
        ,
        [
            { id: 0, caption: "Michigan vs Central Michigan Baseball. 3/28/2023",},
            { id: 1, caption: "Michigan vs Ohio State Lacrosse. 4/21/2023",},
            { id: 2, caption: "Santa Ono and others pose for the groundbreaking of a new Unviersity of Michigan dorm. 10/13/2023",},
            { id: 3, caption: "An evening with Governor Gretchen Whitmer and CNN Anchor Chris Wallace. 3/8/2023",},
            { id: 4, caption: "Michigan vs Ohio State Lacrosse. 4/21/2023",},
            { id: 5, caption: "J.J. McCarthy celebrates a win against Nebraska with fans. 9/30/2023",},
            // { id: 6, caption: "Nebraska ACLU organized protest against the historic overturning of Roe v. Wade. 6/24/2022",},
            { id: 6, caption: "Kalel Mullings beats the pack to score against Nebraska. 9/30/2023",},
            { id: 7, caption: "Michigan vs Central Michigan Baseball. 3/28/2023",},
            { id: 8, caption: "It's TAPpening show hosted by the RhythM Tap Ensemble. 1/21/2023",},
            { id: 9, caption: "Jim Duree wearing his Trump Anti-War Candidate sign. 6/25/2023",},
            { id: 10, caption: "Donald Trump speaks at the Lincoln Day Dinner in Novi, Michigan. 6/25/2023",},
            { id: 11, caption: "Ann Arbor resident Jeremy Fiori performs through the reverberant acoustics of Graffiti Alley. 7/9/2023",},
            { id: 12, caption: "Engaged concertgoers groove together at the annual Ann Arbor Summer Fest Saturday evening. 6/10/2023",},
            { id: 13, caption: "Fourth of July celebration at The Big House. 7/4/2023"},
            { id: 14, caption: "Olivier Nkamhoua delivers a dunk against Youngstown State. 11/10/2023"},
            { id: 15, caption: "CNN anchor Jake Tapper visits the University of Michigan to join Director of the Wallace House Lynette Clemetson in a conversation about democracy. 11/03/2023"},
        ]
        ,
        [
            { id: 0, caption: "Unknown at the University of Michigan League. 4/7/2023"},
            { id: 1, caption: "Lee Bowes & the Jupiter Rings performing at Checkerfest. 7/11/2021"},
            { id: 2, caption: "Professional portrait taken at the Ross School of Business. 4/08/2023"},
            { id: 3, caption: "A grandmother and granddaughter strolling near Kirkland, Washington. 4/29/2023"},
            { id: 4, caption: "Portrait taken near Pioneer's Park in Lincoln Nebraska. 6/1/2022"},
            { id: 5, caption: "Portrait taken in downtown Lincoln Nebraska. 6/3/2022"},
            { id: 6, caption: "Paddle exchange at the Kappa Phi Lambda sorority -- Phi chapter banquet. 4/15/2023"},
            { id: 7, caption: "Mother & daughter near Waikiki Beach, Honolulu. 2/26/2023"},
            { id: 8, caption: "USC Marshall School of Business Graduation. 5/13/2022"},
            { id: 9, caption: "Checkerfest promotion. 7/8/2021"},
        ]
    ]

    const [preloaded, setPreloaded] = useState([]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
    
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {

        const preloadImages = () => {
            const promises = photos[tab].map((obj) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = (error) => reject(error);
                    // img.src = obj.id;
                    if(tab === 0) {
                        img.src = `images/portfolio/landscapes/${obj.id}.jpg`
                    } else if (tab === 1) {
                        img.src = `images/portfolio/daily/${obj.id}.jpg`
                    } else if (tab === 2) {
                        img.src = `images/portfolio/portraits/${obj.id}.jpg`
                    }
                })
            })

            Promise.all(promises)
            .then((loaded) => {
                console.log(loaded);
                setPreloaded((prev) => loaded);
            })
            .catch((error) => {
                console.error("error", error);
            })
        }

        preloadImages();
        console.log(preloaded, typeof(preloaded));
        console.log(tab);
    }, [tab])
    const handleNavClick = (tab) => {
        setTab(tab);
        setPreloaded([])
    }

    const handleImgClick = (idx) => {
        const img = photos[tab][idx];
        setPicIdx(img.id);
        setCaption(img.caption)
        setActive(true);
    }

    const handleModalChange = () => {
        setActive((prev) => !prev);
    }

    const handleLoad = (idx) => {
        // set this image to loaded
        // for each image in tab, check if those are loaded
        setLoaded((prev) => {
            prev[tab][idx].loaded = true
            return prev;
            // console.log(prev[tab][idx].loaded)
        });

        // console.log(loaded)

        loaded[tab].forEach((obj) => {
            if(!obj.loaded) {
                setAllLoaded(false);
                return;
            }
        })
        setAllLoaded(true);
        console.log(loaded, allLoaded)
    }

    const handleScroll = (e) => {
        if(window.pageYOffset === 0) {
            setTop(true)
          } else {
              setTop(false);
        }
        setNavScroll(window.pageYOffset / 2);
    }

    // let  balls = preloaded.map((image, idx) => {
    //     { console.log("hi") }
    //     <div key={idx} className="grid-item"  onClick={() => {handleImgClick(image)}}>
    //         <img className={`portfolio-img loaded`} src={image.src}/>
    //     </div>
    // })

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

            <div className={preloaded.length === 0 ? "loading-icon active": "loading-icon"}>
                <i>loading...</i>
            </div>

            {preloaded.length > 0 && preloaded.map((image, idx) => (
                <div key={idx} className="grid-item"  onClick={() => {handleImgClick(idx)}}>
                    <img className={`portfolio-img loaded`} src={image.src}/>
                </div>
            ))}

            </div>
            <Footer/>
            <ScrollDown active={top}/>
            {active && <PortfolioViewer series={tab} img={picIdx} total={photos[tab].length} handleChange={handleModalChange} caption={caption} photos={photos}/>}
        </>
    );
}

export default Portfolio;