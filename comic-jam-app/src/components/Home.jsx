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
            <h1>Comic Jam! </h1>
            <div className = "ButtonContainer">
                <button onClick={createLobby}>Create Lobby</button>
                <button onClick={navigateToJoinGame}>Join a Game</button> 
            </div>
            </>
    );
}

