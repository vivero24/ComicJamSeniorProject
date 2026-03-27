
import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';


export default function CreateLobby({ onDataSend })
{
    const navigate = useNavigate();

    const[numOfRounds, setNumOfRounds] = useState(0);
    const[numOfPlayers, setNumOfPlayers] = useState(0);
    const[timeLimit, setTimeLimit] = useState(0);


    const onLobbySubmit = () =>
    {
        //send all settings in object - done
        //send message to create a room - done on app.jsx

        const lobby =
        {
            numOfRounds: numOfRounds,
            numOfPlayers: numOfPlayers,
            timeLimit: timeLimit
        };

        fetch('api/create-lobby', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lobby),
            credentials: 'include'
        });

        navigate('/PlayerLobby');
        console.log(lobby);
        onDataSend(lobby);
    }

    return(
        <>
            <h1>Lobby Configuration</h1>
            <div className = "menuContainer">

                <div className = "inputRow">
                    <label htmlFor = "numOfRounds" > Number of Rounds</label>
                    <input type = "number" id = "numOfRounds" name = "numOfRounds" min = "1" max = "4" value = {numOfRounds} onChange={(e) => setNumOfRounds(e.target.value)}></input> <br></br>
                </div>


                <div className = "inputRow">
                    <label htmlFor = "numOfPlayers"> Number of Players</label>
                    <input type = "number" id = "numOfPlayers" name = "numOfPlayers" min = "1" max = "4" value = {numOfPlayers} onChange = {(e) => setNumOfPlayers(e.target.value)} ></input> <br></br>
                </div>

                <div className = "inputRow">
                    <label htmlFor = "timeLimit"> Round Time Limit</label>
                    <input type = "number" id = "timeLimit" name = "timeLimit" min = "1" max = "10" value = {timeLimit} onChange = {(e) => setTimeLimit(e.target.value)}></input> <br></br>
                </div>

                <button id = "submitButton" name = "submitButton" onClick = {onLobbySubmit}>Submit</button>

            </div>
        </>
    );
}
