import React from 'react'
import { useState, useEffect, useRef } from 'react'
import ImgCarousel from '../components/imgcarousel.jsx'
function Home() {

    const words = [' student', ' photograher', 'n engineer'];
    const [top, setTop] = useState(true);
    const [active, setActive] = useState(true);
    const [desc, setDesc] = useState(0);


    const contentRef = useRef();



    useEffect(() => {
        const interval = setInterval(() => {
            setActive(false);
            const timeout = setTimeout(() => {setDesc((desc + 1) % 3); setActive(true);}, 1000);

        }, 2500);



        return () => {clearInterval(interval);}
    })
    /*
    useEffect(() => {
        window.onscroll = function() {
            if(window.pageYOffset === 0) {
              setTop(true)
            } else {
                setTop(false);
            }
          };
    })
    */

    return (
      <div id="intro">
        <p>
          Hi! My name is Lucas. I am a{!active && <span className="cursor"></span>}
          <span className={`intro-text ${active ? "active" : ""}`}>{words[desc]}</span>
          {active && <span className="cursor"></span>}
        </p>
        <div id="home-images">
          <ImgCarousel/>
        </div>
      </div>
    );
}

export default Home;