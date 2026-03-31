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

        const handleSettingsUpdate = (json) => {
            setInviteCode(json['inviteCode'])
        };

        socket.on('lobby-update', handleLobbyUpdate);
        socket.on('settings-update', handleSettingsUpdate);


        // Only connect the websocket at this point
        // Flask sessions only update upon a new socket connection,
        // so this compromise must be made unless we switch to server-side
        // sessions
        socket.connect()

        return () => {
            socket.off('lobby-update', handleLobbyUpdate)
        }
    }, []);

    useLayoutEffect(() => {
        /*
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
        */
    }, []);



    const onPlayerLeave = async () => {
        await fetch('/api/leave-lobby')
        socket.disconnect()
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

            <div className = "buttonContainer">
                <button onClick = {test} >Start</button>
                <button onClick = {onPlayerLeave}>Leave Game</button>
            </div>


        </>


    );  
}
