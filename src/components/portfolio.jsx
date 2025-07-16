import React from 'react'
import { useState } from 'react'
import { Masonry } from "masonic"
import {AdvancedImage, placeholder} from '@cloudinary/react';
import { quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/quality";

import '../App.css'
import '../styles/portfolio.css'

import portfolioData from '../assets/portfolio.json'



function Portfolio({pageref, cloud}) {

    const PortfolioImage = ({index, data: { url, caption }, width}) => (
    <div className="image-wrapper">
        <img src={cloud.image(url).delivery(quality(auto())).toURL()}/>
    </div>
)

    return (
    <div id="portfolio" ref={pageref}>
        <Masonry
        items={portfolioData}
        render={PortfolioImage}
        columnGutter={16}
        columnCount={3}
        overscanBy={100}
        />
    </div>
    );
}

export default Portfolio;