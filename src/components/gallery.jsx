import React from 'react'
import { useState } from 'react'
import { Masonry } from "masonic"
import {AdvancedImage, placeholder} from '@cloudinary/react';
import { quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/quality";

import '../App.css'
import '../styles/gallery.css'

import galleriesData from '../assets/galleries.json'

function Gallery({pageref, cloud}) {

    const galleryImage = ({index, data: { url, caption }, width}) => (
        <div className="image-wrapper">
            <img src={cloud.image(url).delivery(quality(auto())).toURL()}/>
        </div>
    )

    return (
    <div id="gallery" ref={pageref}>
        <div className="section-header">
            <h3>Galleries</h3>
        </div>
        <h4>UMich School of Music, Theatre & Dance</h4>
        <Masonry
        items={galleriesData.smtd}
        render={galleryImage}
        columnGutter={16}
        columnCount={3}
        overscanBy={999}
        />
        <h4>Sports</h4>
        <Masonry
        items={galleriesData.sports}
        render={galleryImage}
        columnGutter={16}
        columnCount={3}
        overscanBy={999}
        />
    </div>
    );
}

export default Gallery;