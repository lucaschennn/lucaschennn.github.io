import React from 'react'
import { useState, useEffect} from 'react'

function Portfolio() {
    return (
        <>
            {images.reverse().map((image) => (
                <img key ={image.id} src={image.src} className={`home-img ${imgActive? "active" : ""}`} />
            ))}
        </>
    );
}
export default Portfolio;