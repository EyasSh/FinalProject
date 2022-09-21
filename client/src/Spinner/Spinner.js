import React from 'react';

//stylesheet
import "./Spinner.css"
function Spinner(props) {
    return (
        <>
            <div className='spinner' id='layer1'></div>
            <div className='spinner' id='layer2'></div>
            <div className='spinner' id='layer3'></div>
            <div className='spinner' id='layer4'></div>
            <span className='loadingText'>{props.text?? ""}</span>
        </>
    );
}

export default Spinner;