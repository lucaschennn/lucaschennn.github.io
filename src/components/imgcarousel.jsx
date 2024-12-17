import React from 'react'
import { useState, useEffect, useRef } from 'react'

import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';

function ImgCarousel() {

    // const [img, setImg] = useState(0);
    const [imgActive, setImgActive] = useState(true);
    const [feature, setFeature] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            const timeout = setTimeout(() => {setFeature((feature + 1) % 4);}, 500);

        }, 2500);



        return () => {clearInterval(interval);}
    })

    const images = [
        { id: 0, src: "6_tq9p2x",},
        { id: 1, src: "13_ptal5d",},
        { id: 2, src: "DSC04093_y2qvrf",},
        { id: 3, src: "_27A8236_lnpssb",}
    ]


    const cld = new Cloudinary({ cloud: { cloudName: 'dch9wtpmk' } });
  
    // Use this sample image or upload your own via the Media Explorer
    const imgtest = cld
          .image('13_ptal5d')
          .format('auto') // Optimize delivery by resizing and applying auto-format and auto-quality
          .quality('auto')
  
    
    return (
        <>
            {images.map((image) => (
                <AdvancedImage key={image.id} className={`home-img ${image.id === feature? "active" : "inactive"}`} cldImg={cld.image(image.src).format('auto').quality('auto')}/>
            ))}
        </>
    );
}
export default ImgCarousel;