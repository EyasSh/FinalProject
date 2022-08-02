import React from 'react';
import Nav from '../Nav/Nav';
import {Outlet} from 'react-router-dom'

function Home(props) {
    return (
        <div>
            <Outlet></Outlet>
            <Nav></Nav>
        </div>
    );
}

export default Home;