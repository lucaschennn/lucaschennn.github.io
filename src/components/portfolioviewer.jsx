import React from 'react'
import { useState, useEffect } from 'react'

import { quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/quality";
import { IoMdClose } from "react-icons/io";
import { FaChevronCircleLeft, FaChevronCircleRight, FaWindowClose } from "react-icons/fa";

import '../App.css'
import '../styles/portfolioviewer.css'

function PortfolioViewer({url, active, setActive, updateHandler, cloud}) {
    return (
    <div id="portfolioViewer" className={`${active ? "active" : "inactive"}`}>
        <div className="close" onClick={() => setActive(false)}>
            <IoMdClose size={"2.5rem"} style={{'cursor' : 'pointer'}} color={"white"}/>
        </div> 
        <div className="container">
            <div className="go-left" style={{'cursor' : 'pointer'}} onClick={() => updateHandler(true)}>
                <FaChevronCircleLeft size={"2rem"} color={"white"}/>
            </div>
            <img
                className="image"
                src={cloud.image(url).delivery(quality(auto())).toURL()}
            />
            <div className="go-right" style={{'cursor' : 'pointer'}} onClick={() => updateHandler(false)}>
                <FaChevronCircleRight size={"2rem"} color={"white"}/>
            </div>
        </div>
    </div>
    );
}

export default PortfolioViewer;