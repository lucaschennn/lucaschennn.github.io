import { FaInstagram } from "react-icons/fa";

import Banner from './banner.jsx'

// Shown September (month 8) through May (month 4)
function inGradSeason(date = new Date()) {
    const month = date.getMonth();
    return month >= 8 || month <= 4;
}

function GradBanner() {

    if (!inGradSeason()) return null;

    return (
        <Banner
            emoji="🎓"
            startCollapsed
            storageKey="gradBannerOpened"
            title="🎓Calling all University of 〽️ichigan Graduates!🎓"
            text="Still waiting to finalize those grad photo plans? I'm available! Email me at lucasch@umich.edu or DM me on Instagram and let's work together!"
            buttonText="Instagram"
            buttonIcon={<FaInstagram size={16} />}
            buttonHref="https://instagram.com/lucaschenphoto"
        />
    )
}

export default GradBanner;
