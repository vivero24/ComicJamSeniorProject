import React, {useState, useEffect} from 'react';

export default function PlayerGame({ onDataSend })
{
    const[currRound, setCurrRound] = useState(0)
    const[totalRounds, setTotalRound] = useState(0)
    const[initialTimeLimit, setInitialTimeLimit] = useState(30)
    const[timeRemaining, setTimeRemaining] = useState(initialTimeLimit)


    return (
        <>
            <h1>
                Player Game Debug
            </h1>
            <div className='menuContainer'>
                Drawing Canvas Here
            </div>
            <button>Submit</button>
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
