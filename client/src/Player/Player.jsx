import React from 'react';
import { useState } from 'react';
import {PlayCircleOutlined, PauseCircleOutlined} from "@ant-design/icons"
import "./Player.css"
import { useEffect } from 'react';
import { useRef } from 'react';
function Player(props) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [audio, setAudio] = useState()
    useEffect(() => {
        if (!audio){
            const a = new Audio(props.src)
            a.type = props.type
            setAudio(a)
            a.onended = () => {
                setIsPlaying(false)
            }
        }
    })
    const togglePlaying = () => {
        if (isPlaying){
            console.log("pausing")
            audio.pause()
        } else {
            audio.play()
        }
        setIsPlaying(!isPlaying)
    }


    return ( 
        <div className='playerWrapper'>
            <button style={props.style} onClick={togglePlaying} key={isPlaying} className='playBtn'>{isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}</button>
        </div>
     );
}

export default Player