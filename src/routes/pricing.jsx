import React from 'react'
import { useState, useEffect, useRef } from 'react'

function Pricing() {

    const [active, setActive] = useState({
        grad: false,
        events: false,
        headshots: false,
        other: false,
    })

    const handleClick = (type) => {
        if(type === 'grad') {
            if(active.grad) {
                setActive((prev) => ({...prev, grad: false}));
            } else {
                setActive((prev) => ({...prev, grad: true}));
            }
        } else if(type === 'events') {
            if(active.events) {
                setActive((prev) => ({...prev, events: false}));
            } else {
                setActive((prev) => ({...prev, events: true}));
            }
        } else if(type === 'headshots') {
            if(active.headshots) {
                setActive((prev) => ({...prev, headshots: false}));
            } else {
                setActive((prev) => ({...prev, headshots: true}));
            }
        } else if(type === 'other') {
            if(active.other) {
                setActive((prev) => ({...prev, other: false}));
            } else {
                setActive((prev) => ({...prev, other: true}));
            }
        }
    }

    return (
      <>
        <div id="pricing-background">
        </div>
        <div id="stationary">
            <div className="pricing-section" onClick={() => handleClick('grad')}>
                <h4 className="pricing-header">
                    Graduation
                </h4>
                <GradDescription active={active.grad}/>
            </div>
            <div className="pricing-section" onClick={() => handleClick('events')}>
                <h4 className="pricing-header">
                    Events
                </h4>
                <EventsDescription active={active.events}/>
            </div>
            <div className="pricing-section" onClick={() => handleClick('headshots')}>
                <h4 className="pricing-header">
                    Headshots
                </h4>
                <HeadshotsDescription active={active.headshots}/>
            </div>
            <div className="pricing-section" onClick={() => handleClick('other')}>
                <h4 className="pricing-header">
                    Other
                </h4>
                <OtherDescription active={active.other}/>
            </div>
        </div>
      </>
    );
}

function GradDescription(props) {
    return ( props.active &&
        <div className="pricing-info">
            <h5 className="pricing-subheader">
                Individual: $30 -$60
            </h5>
            <ul className="pricing-list">
                <li> 30 minutes ($30)</li>
                <li> 1 hour ($60)</li>
                <li> 1-2 locations</li>
                <li> 20+ edited photos (30min) / 40+ edited photos (1hr)</li>
            </ul>
            <h5 className="pricing-subheader">
                Group: $40 per preson
            </h5>
            <ul className="pricing-list">
                <li> 2+ people</li>
                <li> 1 hour</li>
                <li> 1-2 locations</li>
                <li> 10+ edited photos per person, 10+ edited group photos (may depend on group size)</li>
            </ul>
        </div>
    )
}

function EventsDescription(props) {
    return ( props.active &&
        <>
            events description
        </>
    )
}

function HeadshotsDescription(props) {
    return ( props.active &&
        <>
            headshots description
        </>
    )
}

function OtherDescription(props) {
    return ( props.active &&
        <>
            other description
        </>
    )
}


export default Pricing;