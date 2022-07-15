import React from 'react';
import { AudioOutlined ,SearchOutlined } from '@ant-design/icons';
import './Nav.css'

function Nav(props) {
    
    return (
        <div className='Nav-Container'>
            <input placeholder="Search..." type={"text"} className="UserData" 
                ></input>
             
            
            <div className='Op-Container'>
            <span>Chats</span>
            <span> Contacts</span>
            </div>
            



        </div>
    );
}

export default Nav; 