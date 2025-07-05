import React from 'react'
import { useState, useEffect, useMemo } from 'react'

import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';

const cld = new Cloudinary({ cloud: { cloudName: 'dch9wtpmk' } });

function ImgCarousel() {

    const [imgActive, setImgActive] = useState(true);
    const [feature, setFeature] = useState(0);

    const images = [
        { id: 0, src: "images/home/new0.jpg",},
        { id: 1, src: "images/home/new1.jpg",},
        { id: 2, src: "images/home/new2.jpg",},
        { id: 3, src: "images/home/new3.jpg",}
    ]


    useEffect(() => {
        const interval = setInterval(() => {
            setFeature((prevFeature) => (prevFeature + 1) % images.length);
        }, 5000);

        return () => {clearInterval(interval);}
    }, [])

    
    return (
        <>
            {images.map((image, idx) => (
                <img  key={image.id} className={`home-img ${image.id === feature? "active" : "inactive"}`} src={image.src}/>
            ))}
        </>
    );
}
export default ImgCarousel;