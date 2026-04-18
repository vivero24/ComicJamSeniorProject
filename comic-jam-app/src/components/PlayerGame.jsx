import DrawScreen from './DrawScreen';
import {useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket.js'

export default function PlayerGame()
{
    const drawScreenRef = useRef();
    const navigate = useNavigate();

    const[currRound, setCurrRound] = useState(0);
    const[totalRounds, setTotalRounds] = useState(0);
    const [initialTimeLimit, setInitialTimeLimit] = useState(15);
    const[timeRemaining, setTimeRemaining] = useState(initialTimeLimit);

    const onDrawingSubmit = async (drawingInfo) => {
        console.log('Drawing submitted');

        // Send dataURL of image to server
        await fetch('api/submit-panel', {
            method: 'POST',
            body: drawingInfo,
            credentials: 'include'
        });
    }

    useEffect(() => {
        const handleRoundStart = (json, callback) => {
            console.log(json);

            setCurrRound(json['currentRound']);
            setTotalRounds(json['totalRounds']);
            setTimeRemaining(json['timeLimit']);

            callback();
        }

        const handleGameEnd = async (callback) => {
            await drawScreenRef.current.submitDrawing();
            await callback();
            navigate('/Downloads');
        }

        const handleRoundEnd = async (callback) => {
            await drawScreenRef.current.submitDrawing();
            await callback();
        }

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 0) {
                    return 0;
                } else {
                    return prev-1;
                }
            });

            // Prevent timer from going negative
            // if server is slow to respond
        }, 1000);

        socket.on('round-start', handleRoundStart);
        socket.on('round-end', handleRoundEnd);
        socket.on('game-end', handleGameEnd);

        return () => {
            socket.off('round-start', handleRoundStart);
            socket.on('round-end', handleRoundEnd);
            socket.off('game-end', handleGameEnd);
            clearInterval(interval);
        }
    }, [])

    return (
        <>
            <div id="headerContainer">
                <div className="inputRow">
                    <h1>Player Game Debug</h1>
                    <div>Round {currRound} of {totalRounds}</div>
                    <div>Time Remaining: {timeRemaining}</div>
                    <div>Players Still drawing:</div>
                    <div>Players Submitted:</div>
                </div>
            </div>

            <DrawScreen ref = {drawScreenRef} onDrawingSubmit={onDrawingSubmit}/>
            <button onClick = {() => drawScreenRef.current.submitDrawing()}> Submit </button> 
        </>
    );
}
