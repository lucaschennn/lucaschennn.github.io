import React from 'react'
import { useState, useEffect, useRef } from 'react'
import Footer from '../components/footer.jsx';

function Pricing() {

    const [active, setActive] = useState({
        grad: false,
        events: false,
        headshots: false,
        other: false,
    })

    const handleClick = (e, type) => {
        e.preventDefault();

        if(e.currentTarget.className !== "pricing-section") {
            return;
        }
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
            <div className="pricing-section" onClick={(event) => handleClick(event, 'grad')}>
                <h4 className="pricing-header">

                    Graduation

                    {
                        !active.grad ?
                        <svg xmlns="http://www.w3.org/2000/svg" className="dropdown-chevron" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" className="dropdown-chevron" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                        </svg>
                    }
                </h4>
                <GradDescription active={active.grad}/>
            </div>
            <div className="pricing-section" onClick={(event) => handleClick(event, 'events')}>
                <h4 className="pricing-header">
                    Events
                    {
                        !active.events ?
                        <svg xmlns="http://www.w3.org/2000/svg" className="dropdown-chevron"  width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" className="dropdown-chevron" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                        </svg>
                    }
                </h4>
                <EventsDescription active={active.events}/>
            </div>
            <div className="pricing-section" onClick={(event) => handleClick(event, 'headshots')}>
                <h4 className="pricing-header">
                    Headshots
                    {
                        !active.headshots ?
                        <svg xmlns="http://www.w3.org/2000/svg" className="dropdown-chevron"  width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" className="dropdown-chevron" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                        </svg>
                    }
                </h4>
                <HeadshotsDescription active={active.headshots}/>
            </div>
            <div className="pricing-section" onClick={(event) => handleClick(event, 'other')}>
                <h4 className="pricing-header">
                    Other
                    {
                        !active.other ?
                        <svg xmlns="http://www.w3.org/2000/svg" className="dropdown-chevron"  width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" className="dropdown-chevron" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                        </svg>
                    }
                </h4>
                <OtherDescription active={active.other}/>
            </div>
            <div className="important-info">
            IMPORTANT POLICY INFORMATION!
<h5 className="info-header">
Payment and Fees:
</h5>
The full charge is specified as per the full pricing policy here unless otherwise discussed prior to the shoot.
Payment is due during the time of booking.
Venmo, PayPal, and cash are accepted!
<h5 className="info-header">
Cancellation and Reschedule Policy:
</h5>
I understand that unforeseen circumstances may occur. As such, rescheduling may be done free of charge within 24 hours of the original start time. Otherwise a $25 rescheduling fee will be added to your final charge.
Cancellations made before 48 hours of the shoot will receive a full refund. Cancellations made after this cutoff will not receive a refund.
<h5 className="info-header">
Turnaround and Delivery
</h5>
Edited photos will be delivered within 2 weeks of the session. Larger events may take longer. A more accurate timeframe will be provided after booking.
Rush delivery is available for $20-$40 depending on delivery date and the number of images.
            </div>
            <Footer/>
        </div>
      </>
    );
}

function GradDescription(props) {
    return ( props.active &&
        <div className="pricing-info">
            <h5 className="pricing-subheader">
                Individual: $30-$60
            </h5>
            <ul className="pricing-list">
                <li> 30 minutes ($30)</li>
                <li> 1 hour ($60)</li>
                <li> 1-2 locations</li>
                <li> 20+ edited photos (30min) / 40+ edited photos (1hr)</li>
            </ul>
            <h5 className="pricing-subheader">
                Group: $40 per person
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
        <div className="pricing-info">
            <ul className="pricing-list">
                <li> $40 flat fee (editing and transportation)</li>
                <li> $40 per hour</li>
                <li> around 20 edited photos per hour</li>
            </ul>
            <p className="pricing-list">
                Please contact me regarding specific circumstances!
            </p>
        </div>
    )
}

function HeadshotsDescription(props) {
    return ( props.active &&
        <div className="pricing-info">
            <h5 className="pricing-subheader">
                Individual: $20
            </h5>
            <ul className="pricing-list">
                <li> 30 minutes</li>
                <li> 1 locations</li>
                <li> 10+ edited photos</li>
            </ul>
            <h5 className="pricing-subheader">
                Group: $15 per preson
            </h5>
            <ul className="pricing-list">
                <li> 2+ people minutes</li>
                <li> 30 minutes</li>
                <li> 1 locations</li>
                <li> 5+ edited photos per person</li>
            </ul>
        </div>
    )
}

function OtherDescription(props) {
    return ( props.active &&
        <div className="pricing-info pricing-list">
            I would love to accomodate your specific photographer needs! Please contact me directly about pricing for miscellaneous and other photo needs!
            <br></br><br></br>
        </div>
    )
}


export default Pricing;