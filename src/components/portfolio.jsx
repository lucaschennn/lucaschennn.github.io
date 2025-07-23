import React from 'react'
import { useState } from 'react'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import {AdvancedImage, placeholder} from '@cloudinary/react';
import { quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/quality";

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
                            src={cloud.image(item.url).delivery(quality(auto())).toURL()}
                        />
                    </div>
                ))
            }
            </Masonry>
        </ResponsiveMasonry>

    </div>
    );
}

export default Portfolio;