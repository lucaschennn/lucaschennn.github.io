import React from 'react'
import { useState, useEffect} from 'react'

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

    const handleClose = (e) => {
        props.handleChange();
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

    return (
    <div id="portfolio-viewer-modal" className="portfolio-viewer">
        <div id="viewer-arrows">
            <button className="viewer-left" onClick={handlePrev}>&#8249;</button>
            <button className="viewer-right" onClick={handleNext}>&#8250;</button>
        </div>
        
        <div onMouseEnter={() => {setHovering(true)}} onMouseLeave={() => {setHovering(false)}} className="port-img-container">
            <img id="viewing-img" src={`../images/portfolio/` + path[series] + '/' + image + `.jpg`}/>
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