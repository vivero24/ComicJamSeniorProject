
import { useNavigate } from 'react-router-dom';

export default function Home()
{
    const navigate = useNavigate();

    function handleClick(componentName)
    {
        navigate(`/${componentName}`);
    };

    return(
        <>
            <h1>Comic Jam! </h1>
            <div>
                <button onClick={ () => handleClick('CreateLobby')}>Create Lobby</button>
                <button onClick = { () => handleClick('JoinGame')}>Join a Game</button>
            </div>
        </>
    
    );
}

