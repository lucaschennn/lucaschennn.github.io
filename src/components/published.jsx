import React from 'react'
import { useState } from 'react'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import { FaLinkedin, FaInstagram, FaExternalLinkAlt, FaCopy } from "react-icons/fa";
import { quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/quality";

import '../App.css'
import '../styles/published.css'

import publishedData from '../assets/published.json'

/*

Tear Sheets
- https://issuu.com/michigandaily/docs/2024-10-30 (cover, 14 (not as good)) football vs msu
- https://issuu.com/michigandaily/docs/2025-02-19 (last page) bball vs osu
- https://issuu.com/michigandaily/docs/2025-01-15 (6-7) year in photo
- https://issuu.com/michigandaily/docs/2024_rivalry_edition (4) (not as good) tyler morris feature
- https://issuu.com/michigandaily/docs/2024-10-09 (last page) football vs washington
- https://issuu.com/michigandaily/docs/2024-09-18 (2) (not as good) sam altman
- https://issuu.com/michigandaily/docs/2024-01-31 (3) pierpont protest
- BOAA 2023?

Projects
photog faves
year in photo 2024
summer in ann arbor

*/

function Published({pageref, cloud}) {


    const [imagesLoaded, setImagesLoaded] = useState(() => 
    Object.fromEntries(
        // convert galleriesData into arr of [key,val] pairs, turn val to false, then recreate obj.
        Object.entries(publishedData).map(([key, arr]) => [key, arr.map(() => false)])
    ))

    const handleImageLoad = (category, idx) => {
        setImagesLoaded((prev) => {
                const updated = {...prev};
                updated[category][idx] = true;
                return updated;
            }
        )
    }

    return (
    <div id="published" ref={pageref}>
        <div className="page-marker" id="published-marker"></div>
        <h4>Tear Sheets</h4>
        <ResponsiveMasonry
                columnsCountBreakPoints={{350: 3, 750: 4}}
                gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}            
        >
            <Masonry>
            {
                publishedData["featured"].map((item, idx) => (
                    <div key={idx} className="tear-sheets-wrapper">
                        <img
                            className={`${imagesLoaded["featured"][idx] ? "active" : "hidden"}`}
                            onLoad={() => handleImageLoad("featured", idx)}
                            src={cloud.image(item.url).delivery(quality(auto())).toURL()}
                        />
                    </div>
                ))
            }
            </Masonry>
        </ResponsiveMasonry>
        <h4>Projects</h4>
        <div className="projects-wrapper">
            {
                publishedData["projects"].map((item, idx) => (
                    <div className="project" key={idx}>
                        <p className="project-title">
                            <a href={item.ref} target="_blank">{item.title} <FaExternalLinkAlt size={"1rem"}/></a>
                        </p>
                        <div className="project-content">
                            <div className="project-overlay">
                                <p className="visit-site">
                                    <a href={item.ref} target="_blank">Visit Site <FaExternalLinkAlt size={"1rem"}/></a>
                                </p>
                            </div>
                            <img
                                className={`${imagesLoaded["featured"][idx] ? "active" : "hidden"}`}
                                onLoad={() => handleImageLoad("featured", idx)}
                                src={cloud.image(item.url).delivery(quality(auto())).toURL()}
                            />
                        </div>
                    </div>
                ))
            }
        </div>
    </div>
    );
}

/*

    return (
    <div id="published" ref={pageref}>
        <h4>Tear Sheets</h4>
        <div className="rotary">
            {
                publishedData["featured"].map((item, idx) => (
                    <div className="panel featured" key={idx}>
                        <AdvancedImage cldImg={cloud.image(item.url).delivery(quality(auto()))}/>
                    </div>
                ))
            }
        </div>
        <h4>Projects</h4>
        <div className="rotary">
            {
                publishedData["projects"].map((item, idx) => (
                    <div className="panel projects" key={idx}>
                        <AdvancedImage cldImg={cloud.image(item.url).delivery(quality(auto()))} plugins={[placeholder({mode: 'predominant-color'})]}/>
                    </div>
                ))
            }
        </div>
    </div>
    );

*/

export default Published;