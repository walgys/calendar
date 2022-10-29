import { useEffect, useState } from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import Login from '../pages/Login';
import { auth } from '../utilitarios/fb';
import { AuthContext } from '../contexts/authContext';
import Header from './Header';
import Calendario from '../pages/Calendario';
import { Container } from '@mui/system';
import { SnackbarProvider } from 'notistack';


const AppRouter = (props) => {
    const [user, setUser] = useState();
    const [estado, setEstado] = useState();
    auth.onAuthStateChanged((user) => {
        if(user){
          setUser(user);
        }else{
          setUser(null);
        }
      });

   const IsAuth = ({children}) =>{
    if(user){
        return children;
    }
    return <Login />
} 

  return (
    <AuthContext.Provider
        value={{ user, estado, setEstado }}
      >
    <SnackbarProvider maxSnack={3}>
    <Router>
      <Container>
      <Header />
        <Routes>
            <Route path='/' element={<IsAuth><Calendario/></IsAuth>} />
         </Routes>
      </Container>
    </Router>
    </SnackbarProvider>
      </AuthContext.Provider>
  )
}

export default AppRouter