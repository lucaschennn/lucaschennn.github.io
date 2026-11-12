import React from 'react'
import { useState } from 'react'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import { FaLinkedin, FaInstagram, FaExternalLinkAlt, FaCopy } from "react-icons/fa";
import { quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/quality";

import Divider from './divider.jsx';

import '../App.css'
import '../styles/published.css'


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

function Published({pageref, cloud, data: publishedData}) {

    // Loaded image URLs, so each image fades in on its own load. Keyed by public ID
    // rather than index, so tear sheets and projects don't share state.
    const [loaded, setLoaded] = useState(() => new Set())
    const handleImageLoad = (url) => setLoaded((prev) => new Set(prev).add(url))
    const fade = (url) => loaded.has(url) ? "active" : "hidden"

    return (
    <div id="published" ref={pageref}>
        <h4>Tear Sheets</h4>
        <ResponsiveMasonry
                columnsCountBreakPoints={{350: 2, 750: 3}}
                gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}            
        >
            <Masonry>
            {
                publishedData["featured"].map((item, idx) => (
                    <div key={idx} className="tear-sheets-wrapper">
                        <img
                            className={fade(item.url)}
                            onLoad={() => handleImageLoad(item.url)}
                            src={cloud.image(item.url).delivery(quality(auto())).toURL()}
                            loading="lazy"
                        />
                    </div>
                ))
            }
            </Masonry>
        </ResponsiveMasonry>
        <h4>Projects</h4>
        <div className="projects-wrapper">
            {
                publishedData["projects"].map((item, idx) => {
                    // The whole card is the link. Without one, it's a plain card with no hover.
                    const Card = item.ref ? "a" : "div"
                    const link = item.ref ? {href: item.ref, target: "_blank", rel: "noreferrer"} : {}
                    return (
                        <Card className="project" key={idx} {...link}>
                            <div className="project-image">
                                <img
                                    className={fade(item.url)}
                                    onLoad={() => handleImageLoad(item.url)}
                                    src={cloud.image(item.url).delivery(quality(auto())).toURL()}
                                    alt={item.title}
                                    loading="lazy"
                                />
                            </div>
                            <div className="project-text">
                                <p className="project-title">
                                    {item.title}
                                    {item.ref && <FaExternalLinkAlt className="project-icon" aria-hidden/>}
                                </p>
                                {item.description && <p className="project-subtitle">{item.description}</p>}
                            </div>
                        </Card>
                    )
                })
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