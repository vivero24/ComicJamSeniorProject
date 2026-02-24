import React,  {useState} from 'react';

export default function CreateLobby()
{
    const[numOfRounds, setNumOfRounds] = useState(0);
    const[numOfPlayers, setNumOfPlayers] = useState(0);
    const[timeLimit, setTimeLimit] = useState(0);
    
    function submitSettings()
    {
        const lobby = 
        {
            numOfRounds: numOfRounds,
            numOfPlayers: numOfPlayers,
            timeLimit: timeLimit
        };

        console.log(lobby);
    }

    //insert function to send info to backend
    

    return(
        <>
            <h1>Lobby Configuration</h1>
            <div class = "menuContainer">

                <div class = "inputRow">
                    <label for = "numOfRounds" > Number of Rounds</label>
                    <input type = "number" id = "numOfRounds" name = "numOfRounds" min = "1" max = "4" value = {numOfRounds} onChange={(e) => setNumOfRounds(e.target.value)}></input> <br></br>
                </div>

        
                <div class = "inputRow">
                    <label for = "numOfPlayers"> Number of Players</label>
                    <input type = "number" id = "numOfPlayers" name = "numOfPlayers" min = "1" max = "4" value = {numOfPlayers} onChange = {(e) => setNumOfPlayers(e.target.value)} ></input> <br></br>
                </div>

                <div class = "inputRow">
                    <label for = "timeLimit"> Round Time Limit</label>
                    <input type = "number" id = "timeLimit" name = "timeLimit" min = "1" max = "10" value = {timeLimit} onChange = {(e) => setTimeLimit(e.target.value)}></input> <br></br>
                </div>

                <button id = "submitButton" name = "submitButton" onClick = {submitSettings}>Submit</button>
                
            </div>
        </>
    );
}
