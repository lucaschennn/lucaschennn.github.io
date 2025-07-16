import React from 'react'
import { useState } from 'react'
import {AdvancedImage, placeholder} from '@cloudinary/react';
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

    return (
    <div id="published" ref={pageref}>
        <div className="section-header">
            <h3>Published</h3>
        </div>
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
}

export default Published;