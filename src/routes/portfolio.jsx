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

import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { auto, scale } from '@cloudinary/url-gen/actions/resize';


function Portfolio() {

    const [tab, setTab] = useState(1);
    const [top, setTop] = useState(false);
    const [picIdx, setPicIdx] = useState(-1);
    const [active, setActive] = useState(false);
    
    const [navScroll, setNavScroll] = useState(0);
    const [caption, setCaption] = useState('');

    const cld = new Cloudinary({ cloud: { cloudName: 'dch9wtpmk' } });

    const photos = [
        [
            { id: 0, caption: "Milky Way captured near Wenatchee, Washington State. 5/28/2023", src: "DSC08158-Pano-2_znuvbc"},
            { id: 1, caption: "Male Ruby-throated Hummingbird near Seattle, Washington. 6/15/2021", src: "1_turnee"},
            { id: 2, caption: "Haymarket Pedestrian Bridge near Pinnacle Bank Arena in Lincoln, Nebraska. 3/2/2022", src: "2_hxevjr"},
            { id: 3, caption: "House Finch in downtown Los Angeles. 5/14/2022", src: "6_y8fi6x"},
            { id: 4, caption: "Evening landscape of the sandhills near Valentine, Nebraska. 5/24/2021", src: "7_h0hkfn"},
            { id: 5, caption: "The sunrise cuts through a bamboo forest near Xuancheng, China. 8/11/2023", src: "9_phcrvc"},
            { id: 6, caption: "A rainy Lotus flower pond near Huzhou, China. 8/16/2023", src: "10_d7wu3q"},
            { id: 7, caption: "The aurora borealis shines over Puget Sound near Edmonds, Washington. 5/11/2024", src: "DSC08556_declyh"},
            { id: 8, caption: "Two Tufted Titmouses feed from my hand at Kensington Metropark, Michigan. 1/20/2024", src: "DSC04231_uowome"},
            { id: 9, caption: "The Milky Way spans across the half-frozen Lake Michigan at Headlands International Dark Sky Park, Michigan. 2/26/2024", src: "DSC07330-Pano-2_ebmexl"},
            { id: 10, caption: "Storm clouds loom over the Space Needle in Seattle, Washington. 12/28/2023", src: "DSC03110_z7kp66"}


        ]
        ,
        [
            { id: 0, caption: "Michigan vs Central Michigan Baseball. 3/28/2023", src: "0_oymzew"},
            { id: 1, caption: "Michigan vs Ohio State Lacrosse. 4/21/2023", src: "1_oo27hk"},
            { id: 2, caption: "Santa Ono and others pose for the groundbreaking of a new Unviersity of Michigan dorm. 10/13/2023", src: "2_kc2wjh"},
            { id: 3, caption: "An evening with Governor Gretchen Whitmer and CNN Anchor Chris Wallace. 3/8/2023", src: "3_st0yci"},
            { id: 4, caption: "Michigan vs Ohio State Lacrosse. 4/21/2023", src: "4_tyvgfz"},
            { id: 5, caption: "J.J. McCarthy celebrates a win against Nebraska with fans. 9/30/2023", src: "5_gmglxj"},
            // { id: 6, caption: "Nebraska ACLU organized protest against the historic overturning of Roe v. Wade. 6/24/2022",},
            { id: 6, caption: "Kalel Mullings beats the pack to score against Nebraska. 9/30/2023", src: "6_tq9p2x"},
            { id: 7, caption: "Michigan vs Central Michigan Baseball. 3/28/2023", src: "7_v0m2bg"},
            { id: 8, caption: "It's TAPpening show hosted by the RhythM Tap Ensemble. 1/21/2023", src: "8_zhljnd"},
            { id: 9, caption: "Jim Duree wearing his Trump Anti-War Candidate sign. 6/25/2023", src: "9_drclbi"},
            { id: 10, caption: "Donald Trump speaks at the Lincoln Day Dinner in Novi, Michigan. 6/25/2023", src: "10_f0yyii"},
            { id: 11, caption: "Ann Arbor resident Jeremy Fiori performs through the reverberant acoustics of Graffiti Alley. 7/9/2023", src: "11_aeiuog"},
            // { id: 12, caption: "Engaged concertgoers groove together at the annual Ann Arbor Summer Fest Saturday evening. 6/10/2023",},
            { id: 12, caption: "Sierra Brooks celebrates after a successful routine on the bars. 3/23/2024", src: "1lwc.gmwB1G.03.23.2024.639_osh2pr"},
            { id: 13, caption: "Fourth of July celebration at The Big House. 7/4/2023", src: "13_ptal5d"},
            { id: 14, caption: "Olivier Nkamhoua delivers a dunk against Youngstown State. 11/10/2023", src: "14_thcug9"},
            { id: 15, caption: "CNN anchor Jake Tapper visits the University of Michigan to join Director of the Wallace House Lynette Clemetson in a conversation about democracy. 11/03/2023", src: "15_w75ur5"},
        ]
        ,
        [
            { id: 0, caption: "Unknown at the University of Michigan League. 4/7/2023", src: "0_dpfu5n"},
            { id: 1, caption: "Lee Bowes & the Jupiter Rings performing at Checkerfest. 7/11/2021", src: "1_lxueco"},
            { id: 2, caption: "A grandmother and granddaughter strolling near Kirkland, Washington. 4/29/2023", src: "3_ptz9g0"},
            { id: 3, caption: "Portrait taken in downtown Lincoln Nebraska. 6/3/2022", src: "5_be3aus"},
            { id: 4, caption: "Paddle exchange at the Kappa Phi Lambda sorority -- Phi chapter banquet. 4/15/2023", src: "6_ssuefa"},
            { id: 5, caption: "Mother & daughter near Waikiki Beach, Honolulu. 2/26/2023", src: "7_a6lzsf"},
            { id: 6, caption: "Checkerfest promotion. 7/8/2021", src: "9_iy1q5f"},
            { id: 7, caption: "U of M football players pose for a picture at Winterfest. 2/17/2024", src: "DSC06577-2_a84ora"},
            { id: 8, caption: "Graduation photos in front of the University of Michigan Law Quad. 6/25/2024", src: "DSC08082_fnklrf"},
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
                    const img = new AdvancedImage();
                    img.onload = () => resolve(img);
                    img.onerror = (error) => reject(error);
                    img.cldImg=cld.image(obj.src).resize(scale().width(400)).format('auto').quality('auto');
                    console.log(obj.src)
                    console.log(img.cldImg);
                    // if(tab === 0) {
                    //     img.src = `images/portfolio/landscapes/${obj.id}.jpg`
                    // } else if (tab === 1) {
                    //     img.src = `images/portfolio/daily/${obj.id}.jpg`
                    // } else if (tab === 2) {
                    //     img.src = `images/portfolio/portraits/${obj.id}.jpg`
                    // }
                })
            })
            console.log(promises)

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
{/* 
            <div className={preloaded.length === 0 ? "loading-icon active": "loading-icon"}>
                <i>loading...</i>
            </div> */}

            {photos[tab].map((image, idx) => (
                <div key={idx} className="grid-item"  onClick={() => {handleImgClick(idx)}}>
                    <AdvancedImage key={image.id} className={`portfolio-img loaded`} cldImg={cld.image(image.src).resize(scale().width(400)).format('auto').quality('auto')}/>
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