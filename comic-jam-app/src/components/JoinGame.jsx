import {useState} from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinGame({ onDataSend })
{
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [joinCode, setJoinCode] = useState('');

    const onPlayerJoin = async () => {
        if(joinCode.length < 5 ) {
            window.alert('Join code must be 5 characters long');
        }
        else {
            const player =
                {
                    userName: userName,
                    joinCode: joinCode,
                };
 
            // TODO: 
            // - handle 403 error when attempting to join a
            // lobby that is already full
            // - handle 404 when lobby does not exist
            await fetch('api/join-lobby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(player),
                credentials: 'include'
            })
            .then(res => res.json())
            .then(() => {

                navigate('/PlayerLobby');
                onDataSend(player);

            });
        }
    }

    return(
        <>
            <h1>Join a Game</h1>
            <div className = "menuContainer">

                <div className = "inputRow">
                    <label htmlFor = "gameCode">Enter Game Code</label>
                    <input type = "text" id = "gameCode" name = "gameCode" placeholder = "5 digit code"  maxLength= "5" value = {joinCode} onChange = {(e) => setJoinCode(e.target.value)}></input>
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
