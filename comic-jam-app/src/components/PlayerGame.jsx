import DrawScreen from './DrawScreen';
import {useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket.js'


//Need to figure out how to not show overlay when the timer goes off. Only do it when the button is clicked.
function WaitingOverlay()
{
    return<>
        <h1>Waiting for other players...</h1>
    </>
}


export default function PlayerGame()
{
    const drawScreenRef = useRef();
    const navigate = useNavigate();

    const[currRound, setCurrRound] = useState(0);
    const[totalRounds, setTotalRounds] = useState(0);
    const [initialTimeLimit, setInitialTimeLimit] = useState(15);
    const[timeRemaining, setTimeRemaining] = useState(initialTimeLimit);
    const[isSubmitted, setIsSubmitted] = useState(false);

    const[numPlayersRemaining, setNumPlayersRemaining] = useState(0)

    const onDrawingSubmit = async (drawingInfo) => {
        console.log('Drawing submitted');

        if (isSubmitted == false) {

            setIsSubmitted(true);

            // Send dataURL of image to server
            await fetch('api/submit-panel', {
                method: 'POST',
                body: drawingInfo,
                credentials: 'include'
            });
        }
    }

    useEffect(() => {
        const handleRoundStart = (json, callback) => {
            console.log(json);

            setCurrRound(json['currentRound']);
            setTotalRounds(json['totalRounds']);
            setTimeRemaining(json['timeLimit']);
            setIsSubmitted(false)

            callback();
        }

        const handleGameEnd = async (callback) => {
            if (isSubmitted != true) {
                await drawScreenRef.current.submitDrawing();
            }

            callback();
            navigate('/Downloads');
        }

        const handleRoundEnd = async (callback) => {
            if (isSubmitted != true) {
                await drawScreenRef.current.submitDrawing();
            }

            callback();
        }

        const handleSubmissionUpdate = (json) => {
            setNumPlayersRemaining(json['playersRemaining'])
        }

        const interval = setInterval(() => {
            // Prevent timer from going negative
            // if server is slow to respond
            setTimeRemaining(prev => {
                if (prev <= 0) {
                    return 0;
                } else {
                    return prev-1;
                }
            });
        }, 1000);

        socket.on('round-start', handleRoundStart);
        socket.on('round-end', handleRoundEnd);
        socket.on('game-end', handleGameEnd);
        socket.on('player-submission-update', handleSubmissionUpdate);

        return () => {
            socket.off('round-start', handleRoundStart);
            socket.off('round-end', handleRoundEnd);
            socket.off('game-end', handleGameEnd);
            socket.off('player-submission-update', handleSubmissionUpdate);
            clearInterval(interval);
        }
    }, [isSubmitted])

    return (
        <>
            {}
            <div id="headerContainer">
                <div className="inputRow">
                    <h1>Player Game Debug</h1>
                    <div>Round {currRound} of {totalRounds}</div>
                    <div>Time Remaining: {timeRemaining}</div>
                    <div>Players Still Working:{numPlayersRemaining}</div>
                </div>
            </div>

            {isSubmitted && timeRemaining > 0 ? <WaitingOverlay/> :
                <> <DrawScreen ref = {drawScreenRef} onDrawingSubmit={onDrawingSubmit}/>
                    <button onClick = {() => drawScreenRef.current.submitDrawing()}> Submit </button> 
                </>}

        </>
    );
}
