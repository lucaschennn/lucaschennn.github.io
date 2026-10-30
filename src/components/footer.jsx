import React from 'react';
import { FaInstagram, FaLinkedin, FaEnvelope } from "react-icons/fa";

import '../App.css'
import '../styles/footer.css'

function Footer() {
    return (
        <footer id="footer">
            <div className="footer-main">
                <div className="footer-brand">
                    <h5 className="footer-header">Lucas Chen</h5>
                    <p className="footer-tagline">Photography · Ann Arbor, MI</p>
                </div>
                <ul className="footer-links">
                    <li><a href="mailto:lucasch@umich.edu" aria-label="Email"><FaEnvelope size={20} /></a></li>
                    <li><a href="https://instagram.com/lucaschenphoto" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram size={22} /></a></li>
                    <li><a href="https://linkedin.com/in/chen-lucas" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin size={22} /></a></li>
                </ul>
            </div>
            <p className="footer-legal">
                © {new Date().getFullYear()} Lucas Chen. All rights reserved. Images may not be used or reproduced without permission.
            </p>
        </footer>
    )
}

export default Footer;
