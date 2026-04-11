import React, {useState, useEffect, useRef} from 'react';
import DrawScreen from './DrawScreen';

export default function PlayerGame({ onDataSend })
{
    const[currRound, setCurrRound] = useState(0)
    const[totalRounds, setTotalRound] = useState(0)
    const [initialTimeLimit, setInitialTimeLimit] = useState(3)
    const[timeRemaining, setTimeRemaining] = useState(initialTimeLimit)

    const submitDrawing = async() =>
    {
        //code to send drawing information to db
        console.log('Drawing submitted');
    }

    useEffect(() =>
    {
        if (timeRemaining <= 0)
        {
            submitDrawing();
            return;
        }

       const interval = setInterval(() =>{
        setTimeRemaining(prev => prev -1);
       }, 1000)

       return () => clearInterval(interval)

    }, [timeRemaining]);


    return (
        <>

            <h1>
                Player Game Debug
            </h1>
            <div className='menuContainer'>
                Drawing Canvas Here
                <DrawScreen/>
            </div>
            <button onClick = {submitDrawing}> Submit</button>
           <div>
                Round {currRound} of {totalRounds}
            </div>
            <div>
                
                Time Remaining: {timeRemaining}
            </div>
            <div>

                Players Still drawing:
            </div>
            <div>
                Players Submitted:
            </div>
        </>

    );
}
