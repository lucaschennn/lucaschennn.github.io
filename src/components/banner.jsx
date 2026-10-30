import { useState } from 'react'
import { FaChevronRight } from "react-icons/fa";

import '../styles/banner.css'

function Banner({emoji, title, text, buttonText, buttonIcon, buttonHref, startCollapsed = false, storageKey}) {

    const [collapsed, setCollapsed] = useState(startCollapsed);
    // Red dot on the chip until the banner has been opened once (remembered across visits)
    const [opened, setOpened] = useState(() => {
        if (!storageKey) return true;
        try {
            return localStorage.getItem(storageKey) === "1";
        } catch {
            return false;
        }
    });

    const expand = () => {
        setCollapsed(false);
        setOpened(true);
        if (!storageKey) return;
        try {
            localStorage.setItem(storageKey, "1");
        } catch {}
    };

    return (
        <>
            <div className={`banner ${collapsed ? "collapsed" : ""}`} role="region" aria-hidden={collapsed}>
                <div className="banner-body">
                    {title && <p className="banner-title">{title}</p>}
                    <p className="banner-text">{text}</p>
                    <a className="banner-cta" href={buttonHref} target="_blank" rel="noreferrer" tabIndex={collapsed ? -1 : 0}>
                        {buttonIcon}
                        {buttonText}
                    </a>
                </div>
                <button className="banner-collapse" onClick={() => setCollapsed(true)} aria-label="Collapse banner" tabIndex={collapsed ? -1 : 0}>
                    <FaChevronRight size={12} />
                </button>
            </div>
            <button className={`banner-chip ${collapsed ? "" : "hidden"}`} onClick={expand} aria-label="Expand banner" tabIndex={collapsed ? 0 : -1}>
                <span>{emoji}</span>
                {!opened && <span className="banner-badge" />}
            </button>
        </>
    )
}

export default Banner;
