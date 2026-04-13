
import DrawScreen from './DrawScreen';
import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket.js'


export default function PlayerGame({ onDataSend })
{
    const navigate = useNavigate()

    const[currRound, setCurrRound] = useState(0)
    const[totalRounds, setTotalRounds] = useState(0)
    const [initialTimeLimit, setInitialTimeLimit] = useState(3)
    const[timeRemaining, setTimeRemaining] = useState(initialTimeLimit)

    useEffect(() => {
        // TODO:
        // - Display countdown using time limit retrieved
        // from the websocket event
        const handleRoundStart = (json, callback) => {
            console.log(json)

            setCurrRound(json['currentRound'])
            setTotalRounds(json['totalRounds'])
            setTimeRemaining(json['timeLimit'])

            callback()
        }

        const handleGameEnd = (callback) => {
            callback()
            navigate('/Downloads');
        }

        const handleRoundEnd = (callback) => {
            callback()
        }

                if (timeRemaining <= 0)
        {
            submitDrawing();
            return;
        }

       const interval = setInterval(() =>{
        setTimeRemaining(prev => prev -1);
       }, 1000)

        socket.on('round-start', handleRoundStart);
        socket.on('round-end', handleRoundEnd);
        socket.on('game-end', handleGameEnd);

        return () => {
            socket.off('round-start', handleRoundStart);
            socket.on('round-end', handleRoundEnd);
            socket.off('game-end', handleGameEnd);
            clearInterval(interval);
        }
    }, [timeRemaining])


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
