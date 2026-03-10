export default function PlayerLobby()
{

    //need to get array of current player objects to display them
    //hardcoding them for now
    return(
        <>
        <h1>Player Lobby</h1>

        <div className = "menuContainer" >
            <div className = "playerCard">
                <h4>Player 1</h4>
                <img src = "/defaultpfp.png" width ="40" height = "40" ></img>
            </div> 

            <div className = "playerCard">
                <h4>Player 2</h4>
            </div>

            <div className = "playerCard">
                <h4>Player 3</h4>
            </div>
        

        </div>
        </>
        

    );  
}