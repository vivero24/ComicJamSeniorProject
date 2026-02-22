export default function JoinGame()
{


    return(
        <>
            <h1>Join Game</h1>
            <div>
                <label for = "gameCode">Enter Game Code: </label>
                <input type = "text" id = "gameCode" name = "gameCode" placeholder = "4 digit code"></input> <br></br>

                <label for = "username">Enter your username: </label>
                <input type = "text" id = "username" name = "username" placeholder = "Ex: player123"></input> <br></br>

                <button id = "submitButton" name = "submitButton">Submit</button>

            </div>

        </>
    );
};