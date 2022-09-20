import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
function Timer() {
    const [seconds, setSeconds] = useState(0)
    var displayMinutes = "00"
    var displaySeconds = "00"
    const [timer, setTimer] = useState("00:00")
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(seconds+1)
        }, 1000);
        displaySeconds = seconds % 60
        displayMinutes = Math.floor((seconds / 60))
        if (displayMinutes < 10){
            displayMinutes = "0" + displayMinutes
        }

        if (displaySeconds < 10) {
            displaySeconds = "0" + displaySeconds
        }
        setTimer(`${displayMinutes}:${displaySeconds}`)
        return () => {
            clearInterval(interval)
        }
    })
    return ( 
        <>
        {timer}
        </>
    );
}

export default Timer;