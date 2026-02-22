
export default function CreateLobby()
{
    return(
        <>
            <h1>Lobby Configuration</h1>
            <div>
                <label for = "numOfRounds"> Number of Rounds: </label>
                <input type = "number" id = "numOfRounds" name = "numOfRounds" min = "1" max = "4"></input> <br></br>

                <label for = "numOfPlayers"> Number of Players</label>
                <input type = "number" id = "numOfPlayers" name = "numOfPlayers" min = "1" max = "4"></input> <br></br>

                <label for = "timeLimit"> Round Time Limit</label>
                <input type = "number" id = "timeLimit" name = "timeLimit" min = "1" max = "10"></input> <br></br>

                <button id = "submitButton" name = "submitButton">Submit</button>
                
            </div>
        </>
    );
}
