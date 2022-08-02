import React, { useRef } from 'react';
import './Nav.css'
import { Link, useLocation } from 'react-router-dom';
import {MessageOutlined, ContactsOutlined, UserOutlined} from '@ant-design/icons';
function Nav(props) {
   
    const  chatsRef=useRef();
    const location = useLocation()

    return (
        <div className='Nav-Container'>
            <Link to="/user/home/chats">
                <span className={"navButton " + (location.pathname == "/user/home/chats" ? "active" : "")} id='btnChats'>
                    <MessageOutlined />
                </span>
            </Link>

            <Link to="/user/home/contacts">
                <span className={"navButton " + (location.pathname == "/user/home/contacts" ? "active" : "")} id='btnContacts'>
                    <ContactsOutlined />
                </span>
            </Link>

            <Link to="/user">
                <span className={"navButton " + (location.pathname == "/user" ? "active" : "")} id="btnProfile">
                    <UserOutlined />
                </span>
            </Link>
        </div>
    );
}

export default Nav; 