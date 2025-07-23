import React, { act } from 'react'
import { useState, useEffect, useRef } from 'react'
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

function Header({pagerefs, setAboutActive}) {
    
    const [showGalleryDropdown, setShowGalleryDropdown] = useState(false);
    const [activePage, setActivePage] = useState(0);
    const [title, setTitle] = useState("");

    const fullTitle = "lucaschenphoto"
    useEffect(() => {
        let i = 0;

        const interval = setInterval(() => {
            setTitle((prev) => {
                if (i >= fullTitle.length) {
                    clearInterval(interval);
                    return prev;
                }
                const next = fullTitle.charAt(i);
                i++
                return prev + next;
            })
        }, 50)
        

    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const screenMiddle = window.scrollY + (window.innerHeight / 2);

            if (screenMiddle > pagerefs[2].current.offsetTop) {
                setActivePage(2)
            } else if (screenMiddle > pagerefs[1].current.offsetTop) {
                setActivePage(1)
            } else {
                setActivePage(0)
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // initial call

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const handleNavClick = (page) => {
        setActivePage(page);
        if(page === 0) {
            window.scrollTo(0,0);
        } else if (page === 1) {
            pagerefs[1].current?.scrollIntoView();
        } else if (page === 2) {
            pagerefs[2].current?.scrollIntoView();
        }
    }

    return (
    <div id="header">
        <div className={`title ${title === fullTitle ? "complete" : "incomplete"}`}>
            {title}
        </div>
        <ul className="list left">
            <li className={`home-item`} onClick={() => handleNavClick(0)}>
                <img src="icons/android-chrome-192x192.png"/>
            </li>
            <li className={`nav-item ${activePage === 0 ? "active" : "inactive"}`} onClick={() => handleNavClick(0)}>Portfolio</li>
            <li className={`nav-item ${activePage === 1 ? "active" : "inactive"}`} onClick={() => handleNavClick(1)}>Published</li>
            <li className={`nav-item ${activePage === 2 ? "active" : "inactive"}`}
                onMouseLeave={() => setShowGalleryDropdown(false)}
                onClick={() => handleNavClick(2)}
            >
                <span onMouseEnter={() => setShowGalleryDropdown(true)}>
                Galleries</span>
                {/* <ul className={`list-dropdown list ${showGalleryDropdown ? "" : "hidden"}`}>
                    <li>Chinese Frontier Astrophotography</li>
                    <li>UMich School of Music, Theatre & Dance</li>
                    <li>Summer in Ann Arbor</li>
                </ul> */}
            </li>
        </ul>
        <ul className="list right">
            <li className="nav-item inactive" onClick={() => setAboutActive(true)}>About</li>
            <li className="nav-icon"><a href="https://linkedin.com/in/chen-lucas" target="_blank"><FaLinkedin size={24} /></a></li>
            <li className="nav-icon"><a href="https://instagram.com/lucaschenphoto" target="_blank"><FaInstagram size={24} /></a></li>
        </ul>
        {/* <h5 className="title">
            LUCAS CHEN PHOTO
        </h5> */}
    </div>
    );
}

export default Header;