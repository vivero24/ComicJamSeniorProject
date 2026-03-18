import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import CreateLobby from './components/CreateLobby';
import JoinGame from './components/JoinGame';
import PlayerLobby from './components/PlayerLobby';

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
