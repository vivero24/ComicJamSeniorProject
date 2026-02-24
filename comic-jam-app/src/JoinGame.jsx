import React, {useState} from 'react';

export default function JoinGame()
{
    const [userName, setUserName] = useState('user1');
    const [joinCode, setJoinCode] = useState();

    

    return(
        <>
            <h1>Join a Game</h1>
            <div class = "menuContainer">

                <div class = "inputRow">
                    <label for = "gameCode">Enter Game Code</label>
                    <input type = "text" id = "gameCode" name = "gameCode" placeholder = "4 digit code" value = {joinCode} onChange = {(e) => setJoinCode(e.target.value)}></input>
                </div>

                <div class = "inputRow">
                    <label for = "username">Enter your username</label>
                    <input type = "text" id = "username" name = "username" placeholder = "Ex: player123" value = {userName} onChange={(e) => setUserName(e.target.value)}></input>
                </div>

                <button id = "submitButton" name = "submitButton">Submit

                </button>

            </div>

        </>
    )
};