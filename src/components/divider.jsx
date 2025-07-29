import React from 'react';
import { useState, useEffect, useRef } from 'react'

import '../App.css'
import '../styles/divider.css'

function Divider({text}) {

    const ref = useRef(null);
    const [titleInView, setTitleInView] = useState(false);


    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry], instance) => {
                if (entry.isIntersecting) {
                    setTitleInView(true);
                    instance.unobserve(entry.target);
                } 

            },
            {threshold: 0.5}
        )

        const current = ref.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        }

    }, []);

    return (
        <div id="divider" ref={ref}>
            <p className={`${titleInView ? "wipe-fade" : ""}`}>{text}</p>
        </div>
    )
}

export default Divider;