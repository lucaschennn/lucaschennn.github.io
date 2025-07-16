import React from 'react'
import { useState, useEffect } from 'react'
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

function Header({pagerefs}) {
    
    const [showGalleryDropdown, setShowGalleryDropdown] = useState(false);
    const [activePage, setActivePage] = useState(0);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                if(entry.target.id === "gallery") {
                    setActivePage(2);
                } else if (entry.target.id === "published") {
                    setActivePage(1);
                } else if (entry.target.id === "portfolio") {
                    setActivePage(0);
                }
            }
        }, { threshold: 0.1 });

        pagerefs.forEach((targetRef => {
            if (targetRef.current) {
                observer.observe(targetRef.current);
            }
        }))


        return () => {
            pagerefs.forEach((targetRef => {
                if (targetRef.current) {
                    observer.unobserve(targetRef.current);
                }
            }))
        };
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
        <ul className="list left">
            <li className={`home-item`} onClick={() => handleNavClick(0)}>
                <img src="icons/android-chrome-192x192.png"/>
            </li>
            <li className={`nav-item ${activePage === 0 ? "active" : ""}`} onClick={() => handleNavClick(0)}>Portfolio</li>
            <li className={`nav-item ${activePage === 1 ? "active" : ""}`} onClick={() => handleNavClick(1)}>Published</li>
            <li className={`nav-item ${activePage === 2 ? "active" : ""}`}
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