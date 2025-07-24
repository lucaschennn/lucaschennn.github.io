import React, { act } from 'react'
import { useState, useEffect, useRef } from 'react'
import { FaLinkedin, FaInstagram, FaBars } from "react-icons/fa";

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

    // this value MUST equal the media query max-width in header.css
    const MEDIA_QUERY_WIDTH = 768;
    
    const [showGalleryDropdown, setShowGalleryDropdown] = useState(false);
    const [activePage, setActivePage] = useState(0);
    const [title, setTitle] = useState("");
    const [width, setWidth] = useState(window.innerWidth);
    const [navOpen, setNavOpen] = useState(width > MEDIA_QUERY_WIDTH)


    const fullTitle = "lucaschenphoto";
    useEffect(() => {
        let i = title.length;

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
        const handleResize = () => {
            setWidth(window.innerWidth);
            setNavOpen(window.innerWidth > MEDIA_QUERY_WIDTH);
        }

        window.addEventListener('resize', handleResize);

        handleResize();

    return () => window.removeEventListener('resize', handleResize);
    }, [])

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

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const handleNavClick = (page) => {
        if(page === 0) {
            window.scrollTo(0,0);
        } else if (page === 1) {
            pagerefs[1].current?.scrollIntoView();
        } else if (page === 2) {
            pagerefs[2].current?.scrollIntoView();
        }
    }

    const handleToggleBurger = () => {
        console.log("hi")
        setNavOpen(!navOpen);
    }

    return (
    <div id="header">
        <div className={`title ${title === fullTitle ? "complete" : "incomplete"}`}>
            <p className="title-text">
                {title}
            </p>
            <div className={"hamburger"} onClick={handleToggleBurger}>
                <FaBars size={24}/>
            </div>
        </div>

        <div className={`nav ${navOpen ? "active" : "inactive"}`}>
            <ul className="list left">
                <li className={`home-item`} onClick={() => handleNavClick(0)}>
                    <img src="icons/android-chrome-192x192.png"/>
                </li>
                <li className={`nav-item ${activePage === 0 ? "active" : "inactive"}`} onClick={() => handleNavClick(0)}>Portfolio</li>
                <li className={`nav-item ${activePage === 1 ? "active" : "inactive"}`} onClick={() => handleNavClick(1)}>Published</li>
                <li className={`nav-item ${activePage === 2 ? "active" : "inactive"}`} onClick={() => handleNavClick(2)}>Galleries</li>
            </ul>
            <ul className="list right">
                <li className="nav-item inactive" onClick={() => setAboutActive(true)}>About</li>
                <li className="nav-icon"><a href="https://linkedin.com/in/chen-lucas" target="_blank"><FaLinkedin size={24} /></a></li>
                <li className="nav-icon"><a href="https://instagram.com/lucaschenphoto" target="_blank"><FaInstagram size={24} /></a></li>
            </ul>
        </div>

    </div>
    );
}

export default Header;