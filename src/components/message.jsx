import React from 'react'
import { useState, useEffect} from 'react'

function Message() {

    const [sub, setSub] = useState('');
    const [msg, setMsg] = useState('');

    const handleChange = (e, type) => {
        if(type === 'subject') {
            setSub(e.target.value);
        } else if (type === 'msg') {
            setMsg(e.target.value);
        }
    }

    return (
        <div id="contact-msg">
            <form> 
                <label>Subject</label>
                <input type="text" id="inp-subject" value={sub} placeholder="Subject" onChange={(event) => {handleChange(event, 'subject')}}></input> 

                <label>Message</label>
                <textarea type="text" id="inp-msg" rows="4" value={msg} placeholder="Message" onChange={(event) => {handleChange(event, 'msg')}}></textarea> 
            </form>
            <button id="msg-submit-btn">Submit</button>
        </div>
    );
}
export default Message;