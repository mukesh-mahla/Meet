import { BrowserRouter ,Route,Routes } from 'react-router-dom';
import './App.css';

import { Signin } from './pages/signin';
import { Signup } from './pages/signup';
import { CallRoom } from './pages/call';
import { LandingPage } from './pages/Landingpage';
import { Meet } from './pages/meet';
import { Lobby } from './pages/lobby';
import { JoinRoom } from './pages/joinRoom';



function App(){
  return <BrowserRouter>
   <Routes>
      <Route path='signin' element={<Signin/>}/>
      <Route path='signup' element={<Signup/>}/>
      <Route path="/room/:roomId" element={<CallRoom />} />
      <Route path='/' element={<LandingPage/>} />
      <Route path='/meet' element={<Meet/>}/>
      <Route path='/join' element={<JoinRoom/>}/>
      <Route path='/room/:roomId/lobby' element={<Lobby/>}/>
   </Routes>
  </BrowserRouter>

}
export default App