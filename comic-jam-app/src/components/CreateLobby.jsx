
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
    const[numOfRounds, setNumOfRounds] = useState(4);
    const[timeLimit, setTimeLimit] = useState(5);

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

    // Run updateSettings() whenever timeLimit or numOfRounds are
    // updated
    useEffect(() => {
        const updateSettings = async () => {

            // NOTE: only sending timeLimit for now, waiting until
            // settings are ironed out
            const lobbySettings = {
                timeLimit: timeLimit,
                numRounds: numOfRounds
            }

            await fetch('/api/change-lobby-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lobbySettings),
                credentials: 'include'})
        };

        updateSettings();
    }, [timeLimit, numOfRounds]);

    const onStartGame = async () => {

        if (numOfRounds == 0 || timeLimit == 0)
        {
            window.alert("No values for the lobby can be 0");
        }
        else
        {
            socket.emit('host-started-game')
            navigate('/HostGame')
        }
    }

    return (
        <>
            <h1>Lobby Configuration</h1>
            {inviteCode && <h3>Join Code: {inviteCode}</h3>}
            <div className="inline-flex-parent">
                <div className = "menuContainer">
                    <div className = "inputRow">
                        <label htmlFor = "numOfRounds" > Number of Rounds</label>
                        <input type = "number"
                            id = "numOfRounds"
                            name = "numOfRounds"
                            min = "1"
                            max = "4"
                            value = {numOfRounds}
                            onChange={e => { setNumOfRounds(e.target.value)}}>
                        </input> <br></br>
                    </div>
                    <div className = "inputRow">
                        <label htmlFor = "timeLimit"> Round Time Limit</label>
                        <input type = "number"
                            id = "timeLimit"
                            name = "timeLimit"
                            min = "1"
                            max = "10"
                            value = {timeLimit}
                            onChange={e => { setTimeLimit(e.target.value)}}>
                        </input> <br></br>
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
