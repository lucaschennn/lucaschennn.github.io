import React from 'react'
import { useState, useRef } from 'react'
import { IoMdClose } from "react-icons/io";
import { FaLinkedin, FaInstagram, FaExternalLinkAlt, FaCopy } from "react-icons/fa";
import {AdvancedImage, placeholder} from '@cloudinary/react';
import '../App.css'
import '../styles/about.css'


function About({active, setAboutActive, cloud}) {

    const [alertActive, setAlertActive] = useState(false);
    const alertTimeoutRef = useRef(null);

    const handleCopy = async (textToCopy) => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setAlertActive(true);

            //reset timeout by remove existing timeout
            if(alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
            }
            alertTimeoutRef.current = setTimeout(() => {
                setAlertActive(false);
                alertTimeoutRef.current = null;
            }, 3000);

        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
    <div id="about" className={`${active ? "active" : "hidden"}`}>
        <div className="bg" onClick={() => setAboutActive(false)}></div>
        <div className="content">
            <div className="header">
                <IoMdClose onClick={() => setAboutActive(false)} size={"1.5rem"} style={{'cursor' : 'pointer'}}/>
            </div>  
            <div className="intro">
                <div className="intro-text">
                    <p className="heading">Hi, I'm <span>Lucas Chen</span>!</p>
                    <p className="bio">
                        I'm a photographer based in Ann Arbor specializing in <span>sports, news, and astrophotography.</span> <br/><br/>
                        I graduated from the University of Michigan with a degree in <a href="https://lucaschen.me" target="_blank">computer science <FaExternalLinkAlt size={"1rem"}/></a> as well as a deep love for photography.
                        I photographed for our school paper, The Michigan Daily, as well as for the University of Michigan School of Music, Theatre, & Dance.
                    </p>
                </div>
                <div className="intro-portrait">
                    <AdvancedImage cldImg={cloud.image('lukey_ymdsmv')}/>
                </div>
            </div>
            <div className="body">
                <div className="lil-thing">

                </div>
                I'm currently available for freelance assignment. Please don't hesitate to reach out at <span onClick={() => handleCopy("lucasch@umich.edu")}>lucasch@umich.edu <FaCopy /></span>. I look forward to working with you!
            </div>
            <div className="socials">
                <div className="icon-container">
                    <a href="https://linkedin.com/in/chen-lucas" target="_blank"><FaLinkedin size={24} /></a>
                </div>
                <div className="icon-container">
                    <a href="https://instagram.com/lucaschenphoto" target="_blank"><FaInstagram size={24} /></a>
                </div>
            </div>
        </div>
        <div className={`alert ${alertActive ? "" : "hidden"}`}>
            Copied to clipboard! <span onClick={() => setAlertActive(false)}><IoMdClose size={"1.5rem"} style={{'cursor' : 'pointer'}}/></span>
        </div>
    </div>
    );
}

export default About;