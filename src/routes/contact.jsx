import React from 'react'
import { useState } from 'react'
import Book from '../components/book.jsx'
import Message from '../components/message.jsx'

function Contact() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState(0);

    const handleChange = (e, label) => {
      if(label === 'name') {
        setName(e.target.value);
      } else if(label === 'email') {
        setEmail(e.target.value);
      }
    }

    const handleContactChange = (contact) => {
      if(contact === 0) {
        setContact(0);
      } else {
        setContact(1);
      }
    }

    const setNull = () => {
      setName('');
      setEmail('');
    }

    return (
      <div id="contact-page">
        <form> 
          <label>Name</label>
          <input type="text" id="name" value={name} placeholder="Name" onChange={(event) => {handleChange(event, 'name')}}></input> 
          <label>Email</label>
          <input type="text" id="email" value={email} placeholder="Email" onChange={(event) => {handleChange(event, 'email')}}></input> 
        </form>
        <ul id="msg-select">
          <li className={contact === 0 ? "active" : ""} onClick={() => {handleContactChange(0)}}>Message</li>
          <li className={contact === 1 ? "active" : ""} onClick={() => {handleContactChange(1)}}>Book Now</li>
        </ul>
        {contact === 0 ?
        <Message name={name} email={email} setNull={setNull}/>
        :
        <Book/>
        }
      </div>
    );
}

export default Contact;