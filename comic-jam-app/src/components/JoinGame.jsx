import {useState} from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinGame({ onDataSend })
{
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');

    const onPlayerJoin = async () => {
        setJoinError('');

        if(joinCode.length < 5 ) {
            setJoinError('Join code must be 5 characters long');
        }
        else {
            const player =
                {
                    userName: userName,
                    joinCode: joinCode.toUpperCase(),
                };

            try {
                const response = await fetch('api/join-lobby', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(player),
                    credentials: 'include'
                });

                if (response.ok) {
                    navigate('/PlayerLobby');
                    onDataSend(player);
                    return;
                }

                if (response.status === 404) {
                    setJoinError('No lobby found for that code.');
                    return;
                }

                if (response.status === 403) {
                    setJoinError('That lobby is full.');
                    return;
                }

                setJoinError('Could not join lobby. Please try again.');
            } catch (error) {
                console.error(error);
                setJoinError('Could not join lobby. Please try again.');
            }
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
                {joinError && <p>{joinError}</p>}
            </div>

        </>
    )
};
