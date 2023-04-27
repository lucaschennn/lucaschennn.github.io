import React from 'react'

function ScrollDown(props) {
    return (
    <div className={`scroll-down ${props.active ? "":"hidden"}`}>
        &#8595;
    </div>
    );
}

export default ScrollDown;