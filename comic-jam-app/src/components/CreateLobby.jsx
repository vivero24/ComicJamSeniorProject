
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
    const[players, setPlayers] = useState([]);
    const[numOfRounds, setNumOfRounds] = useState(4);
    const[timeLimit, setTimeLimit] = useState(30);

    useEffect(() => {
        socket.connect();

        const handleLobbyUpdate = (usernames) => {
            setPlayers(usernames);
        };

        const handleSettingsUpdate = (json) => {
            setInviteCode(json['inviteCode']);
        };

        socket.on('lobby-update', handleLobbyUpdate);
        socket.on('settings-update', handleSettingsUpdate);

        return () => {
            socket.off('lobby-update', handleLobbyUpdate);
            socket.off('settings-update', handleSettingsUpdate);
        }
    }, []);

    // Run updateSettings() whenever timeLimit or numOfRounds are updated
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

    const closeLobby = () => {
        //socket.emit('host-closed-lobby');
        socket.disconnect();
        navigate('/');
    }

    const restrictNumVal = (value, min, max) => {
        if (value < min) value = min;
        if (value > max) value = max;
        return value;
    };

    return (
        <>
            <div id="container">
                <h1>Lobby Configuration</h1>
                {inviteCode && <h3>Lobby code: {inviteCode}</h3>}
                <div className="inline-flex-parent">

                    <div className = "menuContainer">
                        <div className = "inputRow">
                            <label htmlFor = "numOfRounds" >Number of Rounds</label>
                            <input type = "number"
                                id = "numOfRounds"
                                name = "numOfRounds"
                                min = "3"
                                max = "8"
                                value = {numOfRounds}
                                onChange={e => { setNumOfRounds(restrictNumVal(e.target.value, e.target.min, e.target.max))}}>
                            </input> <br></br>
                        </div>

                        <div className = "inputRow">
                            <label htmlFor = "timeLimit">Round Time Limit</label>
                            <input type = "number"
                                id = "timeLimit"
                                name = "timeLimit"
                                min = "30"
                                max = "300"
                                value = {timeLimit}
                                onChange={e => { setTimeLimit(restrictNumVal(e.target.value, e.target.min, e.target.max))}}>
                            </input> <br></br>
                        </div>
                    </div>

                    <div className = "menuContainer">
                        <h4>Players Joined</h4>
                        {players.length === 0 && <p>No players joined yet.</p>}
                        {players.map((player) => (
                            <div className = "playerCard" key = {player}>
                                <h4>{player}</h4>
                                <img src = "/defaultpfp.png" id = "defaultPicture" width = "40" height = "40"></img>
                            </div>
                        ))}
                    </div>

                </div>

                <div>
                    <button id = "submitButton" name = "submitButton" onClick = {onStartGame}>Start Game</button>
                    <button id = "submitButton" name = "submitButton" onClick = {closeLobby}>Close Lobby</button>
                </div>

            </div>
        </>
    );
}
