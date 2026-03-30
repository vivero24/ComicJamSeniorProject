import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client'

//const URL = 'http://localhost:5000'
//const socket = io(URL);

export default function Home()
{
    /*
    const [connected, setConnected] = useState("false");
    const [connectionCount, setConnectionCount] = useState(0);

    useEffect(() => {
        socket.on('connect', () => {
            setConnected('true');
        });

        socket.on("user-count-update", (userCount) => {
            setConnectionCount((userCount));
        });

        return () => {
            socket.off('connect');
        }
    }, []);
    */

    const navigate = useNavigate();

    function handleClick(componentName) {
        navigate(`/${componentName}`);
    };

    return(
        <>
            <h1>Comic Jam! </h1>
            <div className = "ButtonContainer">
                <button onClick={ () => handleClick('CreateLobby')}>Create Lobby</button>
                <button onClick = { () => handleClick('JoinGame')}>Join a Game</button> 
            </div>
            {/*
            <p>Connected: {connected.toLocaleString()}</p>
            <p>Users Connected: {connectionCount.toLocaleString()} </p>
            -*/}
        </>

    );
}

