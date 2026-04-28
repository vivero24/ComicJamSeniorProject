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
    const [lobbyAvailability, setLobbyAvailability] = useState();

    useEffect(() => {
        if (sessionStorage.getItem("leftLobby") === "true") {
            sessionStorage.removeItem("leftLobby");
            socket.disconnect();
            navigate('/');
            return;
        }

        const handleLobbyUpdate = (json) => {
            console.log('lobby-update received: ', json);
            setPlayers(json);
        };

        const handleSettingsUpdate = (json) => {
            setInviteCode(json['inviteCode']);
            setTimeLimit(json['timeLimit']);
            setNumRounds(json['numRounds']);
            setLobbyAvailability(json['lobbyAvailability'])
        };

        // Invoke anonymous "callback" function to acknowledge that the
        // event was handled
        const acknowledgeGameStart = (callback) => {
            callback();
            navigate('/PlayerGame');
        };

        const handlePageLeave = async () => {
            sessionStorage.setItem("leftLobby", "true");
            await onPlayerLeave();
        };

        const handleLobbyClosed = (callback) => {
            callback();
            socket.disconnect();
            navigate('/');
        };

        const handleKickedPlayer = (callback) => {
            callback();
            socket.disconnect();
            navigate('/');
            alert("You have been kicked from the lobby!");
        }

        socket.on('lobby-closed', handleLobbyClosed);
        socket.on('player-kicked', handleKickedPlayer);

        socket.on('lobby-update', handleLobbyUpdate);
        socket.on('settings-update', handleSettingsUpdate);
        socket.on('game-start-ack-requested', acknowledgeGameStart);

        socket.connect();

        window.addEventListener('beforeunload', handlePageLeave);
        window.addEventListener('pagehide', handlePageLeave);

        return () => {
            socket.off('lobby-update', handleLobbyUpdate);
            socket.off('settings-update', handleSettingsUpdate);
            socket.off('lobby-closed', handleLobbyClosed);
            socket.off('game-start-ack-requested', acknowledgeGameStart);

            window.removeEventListener('beforeunload', handlePageLeave);
            window.removeEventListener('pagehide', handlePageLeave);
        }
    }, []);

    const onPlayerLeave = async () => {
        await fetch('/api/leave-lobby');
        socket.disconnect();
        navigate('/');
    };

    return(
        <>
        <div id="container">
            <h1>Player Lobby</h1>
            {<h3>Join Code: {inviteCode}</h3>}
            <div className ="inline-flex-parent">
            <div className = "menuContainer" >
                <h2>Players in Lobby:</h2>
                {players.map((player, index) => (

                    <div className = "playerCard" key = {player.ID}>
                        <h4>{player.username}</h4>
                        <img src = "/defaultpfp.png" id = "defaultPicture" width = "40" height = "40"></img>
                    </div>

                ))}
                </div>
                <div className = "menuContainer">
                    <div>Rounds: {numRounds}</div>
                    <div>Time Limit: {timeLimit} minutes</div>
                    <div>Lobby Availability: {lobbyAvailability ? "Lobby is open" : "Lobby is closed"}</div>
                </div>

                <div className = "buttonContainer">
                    <button onClick = {onPlayerLeave}>Leave Game</button>
                </div>
            </div>
        </div>
        </>
    );  
}
