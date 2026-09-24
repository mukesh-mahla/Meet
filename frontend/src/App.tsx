import { BrowserRouter ,Route,Routes } from 'react-router-dom';
import './App.css';

import { Signin } from './pages/signin';
import { Signup } from './pages/signup';


function App(){
  return <BrowserRouter>
   <Routes>
      <Route path='signin' element={<Signin/>}/>
      <Route path='signup' element={<Signup/>}/>
   </Routes>
  </BrowserRouter>

}
export default App