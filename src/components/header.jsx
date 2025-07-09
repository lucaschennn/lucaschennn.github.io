import React from 'react'
import { useState } from 'react'
import { FaLinkedin, FaInstagram } from "react-icons/fa";

import '../App.css'
import '../styles/header.css'

/*

- sports
- SMTD
-- 

Main portfolio

Featured -- Trump, MSU Football, Northwestern Football, 

*/

function Header() {

    
    const [showGalleryDropdown, setShowGalleryDropdown] = useState(false);

    return (
    <div id="header">
        <ul className="list left">
            <li className="nav-item">Portfolio</li>
            <li className="nav-item">Published</li>
            <li className="nav-item" onMouseLeave={() => setShowGalleryDropdown(false)}>
                <span onMouseEnter={() => setShowGalleryDropdown(true)}>
                Galleries</span>
                <ul className={`list-dropdown list ${showGalleryDropdown ? "" : "hidden"}`}>
                    <li>Chinese Frontier Astrophotography</li>
                    <li>UMich School of Music, Theatre, and Dance</li>
                    <li>Summer in Ann Arbor</li>
                </ul>
            </li>
        </ul>
        <ul className="list right">
            <li className="nav-item">About</li>
            <li className="nav-item"><a href="https://linkedin.com/in/chen-lucas" target="_blank"><FaLinkedin size={24} /></a></li>
            <li className="nav-item"><a href="https://instagram.com/lucaschenphoto" target="_blank"><FaInstagram size={24} /></a></li>
        </ul>
        {/* <h5 className="title">
            LUCAS CHEN PHOTO
        </h5> */}
    </div>
    );
}

export default Header;