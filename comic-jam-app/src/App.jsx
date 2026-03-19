import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import CreateLobby from './components/CreateLobby';
import JoinGame from './components/JoinGame';
import PlayerLobby from './components/PlayerLobby';

import { socket } from './socket';
import { useState, useEffect } from 'react';



function App() //main root component, ties all other components in here
{

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionCount, setConnectionCount] = useState(0);
  const [lobbySettings, setLobbySettings] = useState(null);
  const[playerInfo, setPlayerInfo] = useState(null);
  
  const getLobbySettings = (lobbySettings) =>
  {
    setLobbySettings(lobbySettings);
    console.log('Settings:', lobbySettings);
    socket.emit("lobby-create", lobbySettings);
  };

  const getPlayerInfo = (playerInfo) =>
  {
    setPlayerInfo(playerInfo);
    console.log('Player info:', playerInfo);
    socket.emit("player-join", playerInfo);
  }

  useEffect( () =>
  {
    function onConnect()
    {
      setIsConnected(true);
      console.log('connected');
    }

    function onDisconnect()
    {
      setIsConnected(false);
    }
    
    function updateConnectionCount(userCount)
    {
      setConnectionCount(userCount);
      console.log(userCount);
    }

    
  
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('user-count-update', updateConnectionCount);
    

    return () =>{
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      
    }
  } ,[]);





  return(
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = { <Home/>} />
        <Route path = "/CreateLobby"  element = {<CreateLobby onDataSend={getLobbySettings} />}/>
        <Route path = "/JoinGame" element = {<JoinGame onDataSend = {getPlayerInfo}/>} />
        <Route path = "/PlayerLobby" element = {<PlayerLobby/>}/>
      </Routes>
    </BrowserRouter>
    
  );
};

export default App;
