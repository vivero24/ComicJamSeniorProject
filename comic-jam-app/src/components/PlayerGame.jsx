import DrawScreen from './DrawScreen';
import {useState, useEffect, useRef, useLayoutEffect, useImperativeHandle} from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket.js'

// TODO:
// - Move current round and players still drawing to be on host side only
// to give it a purpose

//Need to figure out how to not show overlay when the timer goes off. Only do it when the button is clicked.
function WaitingOverlay()
{
    return<>
        <h1>Waiting for other players...</h1>
    </>
}

function PlanningPhase({onPromptSubmitted, promptRef, numPanels})
{
    const [comicTitle, setComicTitle] = useState("");
    const [prompts, setPrompts] = useState([...Array(numPanels)].map(() => {
        return ""
    }));

    const updatePrompts = (newVal, targetIndex) => {
        const newPrompts = prompts.map((currVal, currIndex) => {
            if (currIndex === targetIndex) {
                return newVal;
            } else {
                return currVal;
            }
        });

        setPrompts(newPrompts);
    }

    const submitPrompt = async() => {
        // collect input from all prompts
        await onPromptSubmitted(comicTitle, prompts);
    }

    useImperativeHandle(promptRef, () =>({
        submitPrompt: submitPrompt
        }
    ));

    return(
        <>
            <h1>What's the title of your comic?</h1>
            <input type = "text" value = {comicTitle} onChange = {e => { setComicTitle(e.target.value)}} ></input>
            <br></br>
            <h1>Describe what should happen in each panel:</h1>
            {prompts.map((val, i) => {
                return (
                    <input type = "text"
                        value = {val}
                        key = {i}
                        placeholder={"Panel "+ (i+1)}
                        onChange={ e => { updatePrompts(e.target.value, i) }}>
                    </input>)
            })}
            <button onClick = {submitPrompt}>Submit prompt</button>
        </>
    )
}

export default function PlayerGame({numRounds, timeLimit})
{
    const drawScreenRef = useRef();
    const promptRef = useRef();
    const navigate = useNavigate();

    const[currRound, setCurrRound] = useState(null);
    const[totalRounds, setTotalRounds] = useState(null);
    const[timeRemaining, setTimeRemaining] = useState(60);
    const[isSubmitted, setIsSubmitted] = useState(false);
    const[numPlayersRemaining, setNumPlayersRemaining] = useState(0)
    const[promptSubmitted, setPromptSubmitted] = useState(false);

    const[assignedPanelPrompt, setAssignedPanelPrompt] = useState('')
    const[assignedComicTitle, setAssignedComicTitle] = useState('')

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

    const onPromptSubmitted = async (title, prompts) => {
        console.log("Submitting prompts...")
        console.log(prompts)

        if (promptSubmitted == false) {
            setPromptSubmitted(true);
        }

        var comicPlan = {
            'comicTitle': title,
            'prompts': prompts
        }

        //sending the prompt to the db for storage.
        await fetch('api/submit-prompts', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(comicPlan),
            credentials: 'include'
        });
    }

    useLayoutEffect(() => {
        const initGameState = async () => {
            await fetch('/api/lobby-settings')
            .then(res => res.json())
            .then(json => {
                setTimeRemaining(json['timeLimit']);
                setTotalRounds(json['numRounds']);
            });
        }
        initGameState();
    }, []);

    useEffect(() => {
        const handleRoundStart = (json, callback) => {
            console.log(json);

            setCurrRound(json['currentRound']);
            setTotalRounds(json['totalRounds']);
            setTimeRemaining(json['timeLimit']); //* 60);
            setIsSubmitted(false);
            setPromptSubmitted(false);

            setAssignedComicTitle(json['assignedTitle'])
            setAssignedPanelPrompt(json['assignedPrompt'])

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
            // NOTE: Prompting phase has been moved to round 0 instead of 1
            // so that all panels will be drawn for
            if(currRound === 0 && promptSubmitted != true) {
                console.log("Prompt autosubmitted")
                await promptRef.current.submitPrompt();
            }
            else if (currRound != 0 && isSubmitted != true) {
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
    }, [isSubmitted, currRound, promptSubmitted])

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

            {
                currRound === 0
                    ? promptSubmitted
                        ? <WaitingOverlay/>
                        : <PlanningPhase onPromptSubmitted = {onPromptSubmitted} 
                            promptRef={promptRef}
                            numPanels={totalRounds}/>
                    : isSubmitted && timeRemaining > 0
                        ? <WaitingOverlay/>
                        :
                        <>
                            <DrawScreen ref = {drawScreenRef}
                                onDrawingSubmit={onDrawingSubmit}
                                prompt={assignedPanelPrompt}
                                title={assignedComicTitle}/>
                            <button onClick = {() => drawScreenRef.current.submitDrawing()}> Submit </button>
                        </>
            }

        </>
    );
}
