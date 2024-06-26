import React from 'react'
import { useState, useEffect } from 'react'

import { Cloudinary } from '@cloudinary/url-gen';
import { auto, scale } from '@cloudinary/url-gen/actions/resize';
import {AdvancedImage, responsive, } from '@cloudinary/react';


function PortfolioViewer(props) {
    const img = props.img; // 0-n
    const series = props.series; //daily, portraits, landscapes
    const photos = props.photos;
    const starting_cap = props.caption;
    const path = {
        0: 'landscapes',
        1: 'daily',
        2: 'portraits',
    }
    const total = props.total;

    const [image, setImage] = useState(img);
    const [caption, setCaption] = useState(starting_cap)
    const [hovering, setHovering] = useState(false);
    const [cldObjs, setCldObjs] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const cld = new Cloudinary({ cloud: { cloudName: 'dch9wtpmk' } });

    const handleClose = (e) => {
        if(!hovering && !["viewer-left", "viewer-right"].includes(e.target.className)) {
            props.handleChange();
        } else if (e.currentTarget.className === "viewer-close-btn") {
            props.handleChange();
        }


    }

    const handlePrev = () => {
        if(image === 0) {
            setImage(total - 1);
            setCaption(photos[series][total-1].caption);
            return;
        }
        setCaption(photos[series][image - 1].caption);
        setImage((prev) => prev - 1)
    }

    const handleNext = () => {
        console.log(image, total);
        if(image === total - 1) {
            setCaption(photos[series][0].caption);
            setImage(0);
            return;
        }
        setCaption(photos[series][image + 1].caption);
        setImage((prev) => prev + 1)
    }


    // useEffect(() => {
    //     photos[series].forEach((obj) => {
    //         let newLst = cldObjs;
    //         newLst.push(cld.image(obj.src).format('auto').quality('auto'));
    //         setCldObjs(newLst);
    //     })
    //     console.log(cldObjs);
    // }, [])

    return (
    <div id="portfolio-viewer-modal" className="portfolio-viewer" onClick={handleClose}>
        <div id="viewer-arrows">
            <button className="viewer-left" onClick={handlePrev}>&#8249;</button>
            <button className="viewer-right" onClick={handleNext}>&#8250;</button>
        </div>
        
        <div onMouseEnter={() => {setHovering(true)}} onMouseLeave={() => {setHovering(false)}} className="port-img-container">
            {/* <AdvancedImage id="viewing-img"
                cldImg={cld.image(photos[series][image].src).format('webp').quality('auto')}
                plugins={[responsive()]}    
            /> */}
            {photos[series].map((obj) => (
                <AdvancedImage key={obj.id} hidden={obj.id !== image} cldImg={
                    cld.image(obj.src)
                    .resize(scale().width(2400))
                    .format('auto')
                    .quality('auto')} />
            ))}
            {/* <AdvancedImage id="viewing-img" cldImg={cldObjs[image]} /> */}
            {/* <img id="viewing-img" src={`../images/portfolio/` + path[series] + '/' + image + `.jpg`}/> */}
            {/* <i className="loading-text"> loading... </i> */}
            {hovering && <button className="viewer-close-btn" onClick={handleClose}>&#10006;</button>}
            <div className={`viewer-caption${hovering? " active" : ""} `}>
                <p>
                    {caption}    
                </p>
            </div>
        </div>
    </div>
    );
}

export default PortfolioViewer;