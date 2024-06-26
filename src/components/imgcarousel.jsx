import React from 'react'
import { useState, useEffect, useRef } from 'react'

import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';

function ImgCarousel() {

    // const [img, setImg] = useState(0);
    const [imgActive, setImgActive] = useState(true);

    const images = [
        { id: 0, src: "3_st0yci",},
        { id: 1, src: "4_tyvgfz",},
        { id: 2, src: "5_xibno0",}
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
                <AdvancedImage key={image.id} className={`home-img`} cldImg={cld.image(image.src).format('auto').quality('auto')}/>
            ))}
        </>
    );
}
export default ImgCarousel;