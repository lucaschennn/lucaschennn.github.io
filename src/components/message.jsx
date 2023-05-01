import React from 'react'
import { useState, useEffect} from 'react'
import emailjs from '@emailjs/browser';


function Message(props) {

    const name = props.name;
    const email = props.email;
    const [sub, setSub] = useState('');
    const [msg, setMsg] = useState('');
    const [disabled, setDisabled] = useState(false);

    const handleChange = (e, type) => {
        if(type === 'subject') {
            setSub(e.target.value);
        } else if (type === 'msg') {
            setMsg(e.target.value);
        }
    }

    const handleSubmit = (e) => {
        if(!name || !email || !sub || !msg) {
            alert("Please fill in all fields!");
            return;
        }
        if(disabled) {
            alert("Please wait before sending another message.");
            return;
        }

        setDisabled(true);
        emailjs.send(
            'service_jfzj577',
            'template_dxp3izl',
            {from_name: name, from_email: email, subject: sub, message: msg},
            'AnOCiHXgg3aoSa61O'
        );
        alert("Message received. Thank you for reaching out!");
        const submitTimeout = setTimeout(() => setDisabled(false), 60000);
    }

    return (
        <div id="contact-msg">
            <form> 
                <label>Subject</label>
                <input type="text" id="inp-subject" value={sub} placeholder="Subject" onChange={(event) => {handleChange(event, 'subject')}}></input> 

                <label>Message</label>
                <textarea type="text" id="inp-msg" rows="4" value={msg} placeholder="Message" onChange={(event) => {handleChange(event, 'msg')}}></textarea> 
            </form>
            <button id="msg-submit-btn" onClick={handleSubmit}>Submit</button>
        </div>
    );
}
export default Message;