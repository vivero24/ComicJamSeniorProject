import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import CreateLobby from './CreateLobby';
import JoinGame from './JoinGame';
function App() //main root component, ties all other components in here
{
  return(
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = { <Home/>} />
        <Route path = "/CreateLobby" element = {<CreateLobby/>}/>
        <Route path = "/JoinGame" element = {<JoinGame/>} />
      </Routes>
    </BrowserRouter>
    
  );
};

export default App;
