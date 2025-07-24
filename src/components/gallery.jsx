import React from 'react'
import { useState } from 'react'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import {AdvancedImage, placeholder} from '@cloudinary/react';
import { quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/quality";

import PortfolioViewer from './portfolioviewer.jsx';

import '../App.css'
import '../styles/gallery.css'

import galleriesData from '../assets/galleries.json'

function Gallery({pageref, cloud}) {

    const [imagesLoaded, setImagesLoaded] = useState(() => 
    Object.fromEntries(
        // convert galleriesData into arr of [key,val] pairs, turn val to false, then recreate obj.
        Object.entries(galleriesData).map(([key, arr]) => [key, arr.map(() => false)])
    ))

    const handleImageLoad = (gallery, idx) => {
        setImagesLoaded((prev) => {
                const updated = {...prev};
                updated[gallery][idx] = true;
                return updated;
            }
        )
    }

    //PORTFOLIO VIEWER STUFF
    const [viewerActive, setViewerActive] = useState(false);
    const [viewerUrlIdx, setViewerUrlIdx] = useState("");
    const [viewerGallery, setViewerGallery] = useState("");

    const handleOpenViewer = (gallery, idx) => {
        setViewerGallery(gallery);
        setViewerActive(true);
        setViewerUrlIdx(idx);
    }

    const viewerNavigationHandler = (goLeft) => {
        const numImages = galleriesData[viewerGallery].length;

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
    <div id="gallery" ref={pageref}>
        <div className="page-marker" id="gallery-marker"></div>
        <h4>UMich School of Music, Theatre & Dance</h4>
        <ResponsiveMasonry
                columnsCountBreakPoints={{350: 2, 750: 3, 900: 4}}
                gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}            
        >
            <Masonry>
            {
                galleriesData["smtd"].map((item, idx) => (
                    <div key={idx} className="image-wrapper">
                        <img
                            className={`${imagesLoaded["smtd"][idx] ? "active" : "hidden"}`}
                            onLoad={() => handleImageLoad("smtd", idx)}
                            onClick={() => handleOpenViewer("smtd", idx)}
                            src={cloud.image(item.url).delivery(quality(auto())).toURL()}
                        />
                    </div>
                ))
            }
            </Masonry>
        </ResponsiveMasonry>
        <h4>Sports</h4>
        <ResponsiveMasonry
                columnsCountBreakPoints={{350: 2, 750: 3, 900: 4}}
                gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}            
        >
            <Masonry>
            {
                galleriesData["sports"].map((item, idx) => (
                    <div key={idx} className="image-wrapper">
                        <img
                            className={`${imagesLoaded["sports"][idx] ? "active" : "hidden"}`}
                            onLoad={() => handleImageLoad("sports", idx)}
                            onClick={() => handleOpenViewer("sports", idx)}
                            src={cloud.image(item.url).delivery(quality(auto())).toURL()}
                        />
                    </div>
                ))
            }
            </Masonry>
        </ResponsiveMasonry>
        <h4>Astrophotography</h4>
        <ResponsiveMasonry
                columnsCountBreakPoints={{350: 2, 750: 3, 900: 4}}
                gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}            
        >
            <Masonry>
            {
                galleriesData["astro"].map((item, idx) => (
                    <div key={idx} className="image-wrapper">
                        <img
                            className={`${imagesLoaded["astro"][idx] ? "active" : "hidden"}`}
                            onLoad={() => handleImageLoad("astro", idx)}
                            onClick={() => handleOpenViewer("astro", idx)}
                            src={cloud.image(item.url).delivery(quality(auto())).toURL()}
                        />
                    </div>
                ))
            }
            </Masonry>
        </ResponsiveMasonry>
        <PortfolioViewer
            url={galleriesData[viewerGallery]?.[viewerUrlIdx]?.url}
            active={viewerActive}
            setActive={setViewerActive}
            updateHandler={viewerNavigationHandler}
            cloud={cloud}
        />
    </div>
    );
}

export default Gallery;