import React from 'react'
import { useState } from 'react'

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

function Published() {

    return (
    <div id="published">
        <div className="rotary">
            {
                publishedData["featured"].map((item, idx) => (
                    <div className="panel featured">
                        <img onLoad={() => {console.log("yippee")}} src={`https://res.cloudinary.com/dch9wtpmk/image/upload/${item.url}.jpg`}></img>
                    </div>
                ))
            }
        </div>
        <p>The following are large-scale projects I led.</p>
        <div className="rotary">
            {
                publishedData["projects"].map((item, idx) => (
                    <div className="panel projects">
                        <iframe src={item.url} title="description"></iframe>
                    </div>
                ))
            }
        </div>
    </div>
    );
}

export default Published;