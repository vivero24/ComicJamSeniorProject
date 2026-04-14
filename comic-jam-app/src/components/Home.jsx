import { useNavigate } from 'react-router-dom';

export default function Home()
{
    const navigate = useNavigate();

    // Must be async so we don't naviate to the next page
    // before the lobby is created
    const createLobby = async () => {
        await fetch('api/create-lobby', {
            method: 'GET',
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            console.log('Created lobby with invite code: ', data.invite_code);
            navigate('/CreateLobby');
            onDataSend(lobby, data.invite_code);
        });

    }

    const navigateToJoinGame = () => {
        navigate('/JoinGame')
    }

    return(
            <>
            <div id="container">
                <h1>Welcome to Comic Jam!</h1>
                <div className = "ButtonContainer">
                    <button className="button-start" onClick={createLobby}>Create a Lobby</button>
                    <button className="button-start" onClick={navigateToJoinGame}>Join a Lobby</button> 
                </div>
            </div>
            </>
    );
}

