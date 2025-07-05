import React from 'react'
import { useState } from 'react'

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
            <li>Portfolio</li>
            <li>Featured</li>
            <li>Projects</li>
            <li>
                <span
                    onMouseEnter={() => setShowGalleryDropdown(true)}
                    onMouseLeave={() => setShowGalleryDropdown(false)}
                >
                Galleries</span>
                <ul className={`list list-dropdown ${showGalleryDropdown ? "" : "hidden"}`}>
                    <li>Chinese Frontier Astrophotography</li>
                    <li>UMich School of Music, Theatre, and Dance</li>
                    <li>Summer in Ann Arbor</li>
                </ul>
            </li>
        </ul>
        <ul className="list right">
            <li>About</li>
            <li>IG</li>
            <li>LinkedIn</li>
        </ul>
        <h5 className="title">
            LUCAS CHEN PHOTO
        </h5>
    </div>
    );
}

export default Header;