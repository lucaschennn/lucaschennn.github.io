import React from 'react'
import { useState } from 'react'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import {AdvancedImage, placeholder} from '@cloudinary/react';
import { quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/quality";

import PortfolioViewer from './portfolioviewer.jsx';

import '../App.css'
import '../styles/portfolio.css'

import portfolioData from '../assets/portfolio.json'



function Portfolio({pageref, cloud}) {

    const [imagesLoaded, setImagesLoaded] = useState(portfolioData.map(() => false))

    const handleImageLoad = (idx) => {
        setImagesLoaded((prev) => {
            const updated = [...prev];
            updated[idx] = true;
            return updated;
        })
    }

    //PORTFOLIO VIEWER STUFF
    const [viewerActive, setViewerActive] = useState(false);
    const [viewerUrlIdx, setViewerUrlIdx] = useState("");

    const handleOpenViewer = (idx) => {
        setViewerActive(true);
        setViewerUrlIdx(idx);
    }

    const viewerNavigationHandler = (goLeft) => {
        const numImages = portfolioData.length;

        setViewerUrlIdx((prev) => {
            if (goLeft) {
                return (prev - 1 + numImages) % numImages;
            } else {
                return (prev + 1 + numImages) % numImages;
            }
        })
    }
    // END

    return (
    <div id="portfolio">
        <div className="page-marker" id="portfolio-marker" ref={pageref}></div>
        <ResponsiveMasonry
                columnsCountBreakPoints={{350: 2, 750: 3, 900: 4}}
                gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}            
        >
            <Masonry>
            {
                portfolioData.map((item, idx) => (
                    <div key={idx} className="image-wrapper">
                        <img
                            className={`${imagesLoaded[idx] ? "active" : "hidden"}`}
                            onLoad={() => handleImageLoad(idx)}
                            onClick={() => handleOpenViewer(idx)}
                            src={cloud.image(item.url).delivery(quality(auto())).toURL()}
                        />
                    </div>
                ))
            }
            </Masonry>
        </ResponsiveMasonry>
        <PortfolioViewer
            url={portfolioData[viewerUrlIdx]?.url}
            active={viewerActive}
            setActive={setViewerActive}
            updateHandler={viewerNavigationHandler}
            cloud={cloud}
        />
    </div>
    );
}

export default Portfolio;