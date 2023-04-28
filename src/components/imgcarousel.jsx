import React from 'react'
import { useState, useEffect, useRef } from 'react'

function ImgCarousel() {

    const [img, setImg] = useState(0);
    const [imgActive, setImgActive] = useState(true);

    const images = [
        { id: 0, src: "../images/home/0.jpg",},
        { id: 1, src: "../images/home/1.jpg",},
        { id: 2, src: "../images/home/2.jpg",}
    ]

    
    return (
        <>
            {images.map((image) => (
                <img key ={image.id} src={image.src} className={`home-img`} />
            ))}
        </>
    );
}
export default ImgCarousel;