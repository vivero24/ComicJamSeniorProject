import React, {useState, useEffect, useLayoutEffect} from 'react';
import { socket } from '../socket.js';
import { useNavigate } from 'react-router-dom';

export default function PlayerLobby()
{
    const navigate = useNavigate();
    // connect to socket at this point, session should be established in JoinGame
    const [players, setPlayers] = useState([]);
    const [inviteCode, setInviteCode] = useState('');


    useEffect(() => {
    const handleLobbyUpdate = (json) => {
        console.log('lobby-update received: ', json);
        setPlayers(json);
    };

    socket.on('lobby-update', handleLobbyUpdate);
    
    return () => {

        socket.off('lobby-update', handleLobbyUpdate)
    }
    }, []);
    
    useLayoutEffect(() => {
        fetch('/api/lobby-contents')
        .then(response => response.json())
        .then(json => JSON.parse(JSON.stringify(json)))
        .then(data => {
                console.log(data)
                setPlayers(data.usernames);
                setInviteCode(data.invite_code);
                console.log(data.inviteCode)
                socket.emit('rejoin-room', data.invite_code)
                console.log('rejoining room', data.invite_code);
                
        })
    }, []);



    const onPlayerLeave = () => {
        socket.emit('player-leave');
        navigate('/');

    };

    const test = () => {
        socket.emit('test-player');

    }

    //need to get array of current player objects to display them
    //hardcoding them for now
    
    console.log(players);
    return(
        <>
            <h1>Player Lobby</h1>
            {inviteCode && <h3>Join Code: {inviteCode}</h3>}

            <div className = "menuContainer" >
                
                {players.map((player, index) => (
                    
                    <div className = "playerCard" key = {player}>
                        <h4>{player}</h4>
                        <img src = "/defaultpfp.png" id = "defaultPicture" width = "40" height = "40"></img>
                    </div>
                    
                ))}

            </div>

            <div>
                DEBUG | PLAYERS IN FETCH VIA HTTP:
                <ul>
                    { players.map(player => <li>{player}</li>)}
                </ul>
            </div>

            <div>
                DEBUG | PLAYERS IN FETCH VIA WEBSOCKET:
                <ul>
                    { players.map(player => <li>{player}</li>)}
                </ul>
            </div>

            <div className = "buttonContainer">
                <button onClick = {test} >Start</button>
                <button onClick = {onPlayerLeave}>Leave Game</button>
            </div>
            

        </>


    );  
}
