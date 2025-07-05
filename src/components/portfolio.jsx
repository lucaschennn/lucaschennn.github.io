import React from 'react'
import { useState } from 'react'
import { Masonry } from "masonic"

import '../App.css'
import '../styles/portfolio.css'

import portfolioData from '../assets/portfolio.json'

const PortfolioImage = ({index, data: { url, caption }, width}) => (
    <div className="image-wrapper">
        <img onLoad={() => {console.log("yippee")}} src={`https://res.cloudinary.com/dch9wtpmk/image/upload/${url}.jpg`}></img>
    </div>
)

function Portfolio() {

    return (
    <div id="portfolio">
        <Masonry
        items={portfolioData}
        render={PortfolioImage}
        columnGutter={16}
        columnCount={3}
        />
    </div>
    );
}

export default Portfolio;