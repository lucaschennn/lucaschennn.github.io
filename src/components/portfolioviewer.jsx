import React from 'react'
import { useState, useEffect} from 'react'

function PortfolioViewer(props) {
    const img = props.img; // 0-n
    const series = props.series; //daily, portraits, landscapes
    const total = props.total;

    const [image, setImage] = useState(img);

    const handleClose = (e) => {
        props.handleChange();
    }

    const handlePrev = () => {
        if(image === 0) {
            setImage(total - 1);
            return;
        }
        setImage((prev) => prev - 1)
    }

    const handleNext = () => {
        console.log(image, total);
        if(image === total - 1) { // FIGURE OUT MAX W PROPS
            setImage(0);
            return;
        }
        setImage((prev) => prev + 1)
    }

    return (
    <div id="portfolio-viewer-modal" className="portfolio-viewer">
        <div id="viewer-arrows">
            <button className="viewer-left" onClick={handlePrev}>&#8249;</button>
            <button className="viewer-right" onClick={handleNext}>&#8250;</button>
        </div>
        <button className="viewer-close-btn" onClick={handleClose}>&#10006;</button>
        <div className="port-img-container">
            <img id="viewing-img" src={`../images/portfolio/` + series + '/' + image + `.jpg`}/>

        </div>

    </div>
    );
}

export default PortfolioViewer;