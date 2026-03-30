import React, {useState, useEffect, useLayoutEffect} from 'react';

import { socket } from '../socket.js';

export default function PlayerLobby({inviteCode})
{
    // connect to socket at this point, session should be established in JoinGame
    const [players, setPlayers] = useState([])

    useLayoutEffect(() => {
        fetch('/api/lobby-contents')
        .then(response => response.json())
        .then(json => JSON.parse(JSON.stringify(json)))
        .then(players => setPlayers(players))
    }, []);

    useEffect(() => {
        socket.connect();

        socket.on('lobby-update', (json) => {
            // accept json array of usernames
            setPlayers(JSON.parse(JSON.stringify(json)));
        });


    }, []);

    const test = () => {
        socket.emit('test-player');

    }

    //need to get array of current player objects to display them
    //hardcoding them for now

    return(
        <>
            <h1>Player Lobby</h1>
            {inviteCode && <h3>Join Code: {inviteCode}</h3>}

            <div className = "menuContainer" >
                
                {players.map((player, index) => (
                    
                    <div className = "playerCard" key = {index}>
                        <h4>{player}</h4>
                        <img src = "/defaultpfp.png" id = "defaultPicture" width = "40" height = "40"></img>
                    </div>
                    
                ))}
                
                {/*
                <div className = "playerCard">
                    <h4>Player 1</h4>
                    <img src = "/defaultpfp.png" width ="40" height = "40" ></img>
                </div> 

                <div className = "playerCard">
                    <h4>Player 2</h4>
                    <img src = "/defaultpfp.png" width ="40" height = "40" ></img>
                </div>

                <div className = "playerCard">
                    <h4>Player 3</h4>
                    <img src = "/defaultpfp.png" width ="40" height = "40" ></img>
                </div>
                */}
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


            <button onClick = {test} >Start</button>

        </>


    );  
}
