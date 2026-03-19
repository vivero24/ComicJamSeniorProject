import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinGame({ onDataSend })
{
    const navigate = useNavigate();
    const [userName, setUserName] = useState('user1');
    const [joinCode, setJoinCode] = useState(0);

    const onPlayerJoin = () =>
    {
        const player = 
        {
            userName: userName,
            joinCode: joinCode,
        };

        navigate('/PlayerLobby');
        console.log(player);
        onDataSend(player);


        
    }

    return(
        <>
            <h1>Join a Game</h1>
            <div className = "menuContainer">

                <div className = "inputRow">
                    <label htmlFor = "gameCode">Enter Game Code</label>
                    <input type = "text" id = "gameCode" name = "gameCode" placeholder = "4 digit code" value = {joinCode} onChange = {(e) => setJoinCode(e.target.value)}></input>
                </div>

                <div className = "inputRow">
                    <label htmlFor = "username">Enter your username</label>
                    <input type = "text" id = "username" name = "username" placeholder = "Ex: player123" value = {userName} onChange={(e) => setUserName(e.target.value)}></input>
                </div>

                <button id = "submitButton" name = "submitButton" onClick = {onPlayerJoin}>Submit</button>

            </div>

        </>
    )
};