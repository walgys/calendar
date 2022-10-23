import { Button, Container, Divider, Paper, TextField, Typography } from '@mui/material'
import React from 'react'
import GoogleIcon from '@mui/icons-material/Google';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
  } from 'firebase/auth';
  import { auth } from '../utilitarios/fb';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUsers } from '../utilitarios/data';

const Login = () => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const doLogin = async () => {
        try {
          const user = await signInWithEmailAndPassword(auth, userName, password);
        } catch (err) {
          console.log(err);
        }
      };
    
      const googleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        const user = await signInWithPopup(auth, provider);
        createUsers(user.user);
      };

  return (
    <Container>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '100vh'}}>
            <Paper elevation={3}>

        <div style={{display: 'flex', justifyContent: 'space-between' ,flexDirection: 'column', width: '25vw', alignContent: 'center', margin: '2rem'}}>
        <Typography textAlign={'center'}>
                Ingrese Con Google
              </Typography>
              <Divider />
              <Button
                variant="contained"
                color="error"
                sx={{
                  width: '100%',
                  maxWidth: '200px',
                  alignSelf: 'center',
                  padding: '0.5rem 1rem 0.5rem 1rem',
                  margin: '1rem 0rem 1rem 0rem',
                }}
                onClick={() => googleSignIn()}
              >
                <GoogleIcon />
                oogle
              </Button>
            </div>
                  </Paper>
            </div>
    </Container>
  )
}

export default Login