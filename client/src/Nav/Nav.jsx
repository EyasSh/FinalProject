import React from 'react';
import { AudioOutlined ,SearchOutlined } from '@ant-design/icons';
import './Nav.css'
import { Link, Route, Router, Routes } from 'react-router-dom';

function Nav(props) {
   
    return (
        <div className='Nav-Container'>
            <input placeholder="Search..." type={"text"} className="Search" 
                ></input>
             
            
            <div className='Op-Container'>
            
            <Link to='/User/Home/Chats'>
                <button 
                
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