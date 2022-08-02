import React from 'react';
import Nav from '../Nav/Nav';
import {Outlet} from 'react-router-dom'

function Home(props) {
    return (
        <div>
            <Nav></Nav>
            <Outlet></Outlet>
        </div>
    );
}

export default Home;