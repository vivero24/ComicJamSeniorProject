import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import CreateLobby from './CreateLobby';
import JoinGame from './JoinGame';
import PlayerLobby from './PlayerLobby';

function App() //main root component, ties all other components in here
{
  return(
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = { <Home/>} />
        <Route path = "/CreateLobby" element = {<CreateLobby/>}/>
        <Route path = "/JoinGame" element = {<JoinGame/>} />
        <Route path = "/PlayerLobby" element = {<PlayerLobby/>}/>
      </Routes>
    </BrowserRouter>
    
  );
};

export default App;
