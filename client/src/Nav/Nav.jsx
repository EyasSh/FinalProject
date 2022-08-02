import React, { useRef } from 'react';
import './Nav.css'
import { Link } from 'react-router-dom';

function Nav(props) {
   
    const  chatsRef=useRef();
    
    return (
        <div className='Nav-Container'>
            <input placeholder="Search...
            " type={"text"} 
            className="Search"
            
            ></input>
             
            
            <div className='Op-Container'>
            
            <Link to='/User/Home/Chats'>
                <button 
                ref={chatsRef}
                className='Chat-Btn' 
                >Chats</button>
            </Link>
            

            <Link to='/User/Home/Contacts'> 
                <button className='Contact-Btn'> Contacts</button>
            </Link>
            
            </div>
            
            


        </div>
    );
}

export default Nav; 