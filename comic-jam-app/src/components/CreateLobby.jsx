
import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

// NOTE: Perhaps naming this component to HostLobby should be in order, since
// the documentation states it should also display the lobby contents alongside
// the settings

// TODO: 
// - Create lobby and connect to socket on enter
// - display invite code and lobby view to align
// more with requirements document

export default function CreateLobby({ onDataSend })
{
    const navigate = useNavigate();

    const[numOfRounds, setNumOfRounds] = useState(0);
    const[numOfPlayers, setNumOfPlayers] = useState(0);
    const[timeLimit, setTimeLimit] = useState(0);

    // Must be async so we don't naviate to the next page
    // before the lobby is created
    const onLobbySubmit = async () =>
    {
        if (numOfRounds == 0 || numOfPlayers == 0 || timeLimit == 0)
        {
            window.alert("No values for the lobby can be 0");
        }
        else if (numOfPlayers == 1)
        {
            window.alert("Number of players cannot be 1");
        }
        else
        {
            const lobby =
            {
                numOfRounds: numOfRounds,
                numOfPlayers: numOfPlayers,
                timeLimit: timeLimit
            };

            await fetch('api/create-lobby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lobby),
                credentials: 'include'
            })
            .then(res => res.json())
            .then(data => {
                console.log('Created lobby with invite code: ', data.invite_code);
                navigate('/HostGame');
                onDataSend(lobby, data.invite_code);
            });
        }
    }

    return (
        <>
            <h1>Lobby Configuration</h1>
            <h3>
                Invite Code: 
            </h3>
            <div className="inline-flex-parent">
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
                </div>
                <div className = "menuContainer">
                    Lobby View Here
                </div>
            </div>
            <div>
                <button id = "submitButton" name = "submitButton" onClick = {onLobbySubmit}>Start Game</button>
            </div>
        </>
    );
}
