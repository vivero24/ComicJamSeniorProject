
import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import { socket } from '../socket.js'
// NOTE: Perhaps naming this component to HostLobby should be in order, since
// the documentation states it should also display the lobby contents alongside
// the settings

// TODO: 
// - Update lobby with players as they join
// - Send settings to the server as they are updated
export default function CreateLobby({ onDataSend })
{
    const navigate = useNavigate();

    const[inviteCode, setInviteCode] = useState("")
    const[numOfRounds, setNumOfRounds] = useState(0);
    const[numOfPlayers, setNumOfPlayers] = useState(0);
    const[timeLimit, setTimeLimit] = useState(0);

    useEffect(() => {
        socket.connect();

        const handleSettingsUpdate = (json) => {
            setInviteCode(json['inviteCode']);
        };

        socket.on('settings-update', handleSettingsUpdate);

        return () => {
            socket.off('settings-update', handleSettingsUpdate);
        }
    }, []);

    // TODO: POST to update lobby settings whenever they are modified

    const onStartGame = async () => {
        socket.emit('host-started-game')

        navigate('/HostGame')
    }

    return (
        <>
            <h1>Lobby Configuration</h1>
            {inviteCode && <h3>Join Code: {inviteCode}</h3>}
            <div className="inline-flex-parent">
                <div className = "menuContainer">
                    <div className = "inputRow">
                        <label htmlFor = "numOfRounds" > Number of Rounds</label>
                        <input type = "number" id = "numOfRounds" name = "numOfRounds" min = "1" max = "4" value = {numOfRounds} onChange={(e) => setNumOfRounds(e.target.value)}></input> <br></br>
                    </div>

                    <div className = "inputRow">
                        <label htmlFor = "numOfPlayers"> Number of Players</label>
                        <input type = "number" id = "numOfPlayers" name = "numOfPlayers" min = "1" max = "4" value = {numOfPlayers} onChange = {(e) => setNumOfPlayers(e.target.value)} ></input> <br></br>
                    </div>

                    <div className = "inputRow">
                        <label htmlFor = "timeLimit"> Round Time Limit</label>
                        <input type = "number" id = "timeLimit" name = "timeLimit" min = "1" max = "10" value = {timeLimit} onChange = {(e) => setTimeLimit(e.target.value)}></input> <br></br>
                    </div>
                </div>
                <div className = "menuContainer">
                    Lobby View Here
                </div>
            </div>
            <div>
                <button id = "submitButton" name = "submitButton" onClick = {onStartGame}>Start Game</button>
            </div>
        </>
    );
}
