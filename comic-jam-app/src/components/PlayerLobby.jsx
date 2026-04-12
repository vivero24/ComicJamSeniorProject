import React, {useState, useEffect, useLayoutEffect} from 'react';
import { socket } from '../socket.js';
import { useNavigate } from 'react-router-dom';

export default function PlayerLobby()
{
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [inviteCode, setInviteCode] = useState('');
    const [timeLimit, setTimeLimit] = useState(0);
    const [numRounds, setNumRounds] = useState(0);

    useEffect(() => {
        const handleLobbyUpdate = (json) => {
            console.log('lobby-update received: ', json);
            setPlayers(json);
        };

        const handleSettingsUpdate = (json) => {
            setInviteCode(json['inviteCode']);
            setTimeLimit(json['timeLimit']);
            setNumRounds(json['numRounds']);
        };

        // Invoke anonymous "callback" function to acknowledge that the
        // event was handled
        const acknowledgeGameStart = (callback) => {
            callback()
            navigate('/PlayerGame');
        };

        socket.on('lobby-update', handleLobbyUpdate);
        socket.on('settings-update', handleSettingsUpdate);
        socket.on('game-start-ack-requested', acknowledgeGameStart);

        socket.connect();

        return () => {
            socket.off('lobby-update', handleLobbyUpdate);
            socket.off('settings-update', handleSettingsUpdate);
        }
    }, []);

    const onPlayerLeave = async () => {
        await fetch('/api/leave-lobby');
        socket.disconnect();
        navigate('/');
    };

    console.log(players);
        return(
        <>
            <h1>Player Lobby</h1>
            {inviteCode && <h3>Join Code: {inviteCode}</h3>}
            <div className ="inline-flex-parent">
                <div className = "menuContainer" >
                    {players.map((player, index) => (

                        <div className = "playerCard" key = {player}>
                            <h4>{player}</h4>
                            <img src = "/defaultpfp.png" id = "defaultPicture" width = "40" height = "40"></img>
                        </div>

                    ))}
                </div>
                <div className = "menuContainer">
                    <div>Rounds: {numRounds}</div>
                    <div>Time Limit: {timeLimit} minutes</div>
                </div>
            </div>

            <div className = "buttonContainer">
                <button onClick = {onPlayerLeave}>Leave Game</button>
            </div>


        </>


    );  
}
