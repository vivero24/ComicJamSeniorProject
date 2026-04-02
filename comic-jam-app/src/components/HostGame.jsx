import React, {useState, useEffect} from 'react';

export default function HostGame({ onDataSend })
{
    const[currRound, setCurrRound] = useState(0)
    const[totalRounds, setTotalRound] = useState(0)
    const[initialTimeLimit, setInitialTimeLimit] = useState(30)
    const[timeRemaining, setTimeRemaining] = useState(initialTimeLimit)
   
    // Rudimentary timer
    useEffect(() => {
        let interval = setInterval(() => {
            setTimeRemaining((timeRemaining) => {
                if (timeRemaining > 0) {
                    return timeRemaining - 1;
                } else {
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // TODO:
    // - listeners for round start, round end, game end events
    // - countdown for time remaining
    // - autosubmit when timer expires
    return (
        <>
            <h1> Host Game Debug </h1>
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
