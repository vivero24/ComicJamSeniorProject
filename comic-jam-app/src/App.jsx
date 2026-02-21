import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import CreateLobby from './CreateLobby';
function App() //main root component, ties all other components in here
{
  return(
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = { <Home/>} />
        <Route path = "/CreateLobby" element = {<CreateLobby/>}/>
      </Routes>
    </BrowserRouter>

    
  );
};

export default App;
