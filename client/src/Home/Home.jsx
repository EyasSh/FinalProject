import React from 'react';
import {Outlet} from 'react-router-dom'
import Convo from '../Convo/Convo';
import Nav from '../Nav/Nav';

function Home(props) {

    const chats = [
        {
            name: "Firas Sharary",
            picture: "https://cdn.inflact.com/media/293676483_1084918885444539_5446438895038859389_n.webp?url=https%3A%2F%2Fscontent.cdninstagram.com%2Fv%2Ft51.2885-15%2F293676483_1084918885444539_5446438895038859389_n.webp%3Fstp%3Ddst-jpg_e35%26_nc_ht%3Dscontent.cdninstagram.com%26_nc_cat%3D103%26_nc_ohc%3DDCxPDOqo_X4AX_KThHw%26edm%3DAJBgZrYBAAAA%26ccb%3D7-5%26ig_cache_key%3DMjg4NDQ3MDMwNDQwNDY1Njc4Mw%253D%253D.2-ccb7-5%26oh%3D00_AT8J8LDChsJYLmG6a4F1HzCdu3Q1wU952rIQ4l4yaRGqzg%26oe%3D62F270DC%26_nc_sid%3D78c662&time=1659535200&key=d90cc87c4205cc0b6613c9a80abba39e",
            messages: [
                {
                    sender: "Firas Sharary",
                    content: "Hi",
                    read: false,
                    createdAt: 1659600598233
                }
            ]           
        }
    ]
    return (
        <div>
            
            <Nav chats={chats} />
            <Convo />
            <Outlet></Outlet>
        </div>
    );
}

export default Home;