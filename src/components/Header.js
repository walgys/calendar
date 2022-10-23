import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { signOut, deleteUser, reauthenticateWithCredential, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../utilitarios/fb';
import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/authContext';
export default function Header() {
  const navigate = useNavigate();
  const { user} = useContext(AuthContext);
  console.log(user && user.photoURL);
  const doSignOut = () => {
    signOut(auth);
    handleClose();
    navigate('/');
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const doDeleteUser = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    reauthenticateWithCredential(auth.currentUser, credential)

    deleteUser(auth.currentUser).then(()=>{
      handleClose();
      navigate('/');
    }).catch((error) => {
      console.log(error);
    });
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {user && (
            <Tooltip title="Salir del Administrador">
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={()=>doSignOut()}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
           Calendario de grupo
          </Typography>

          {user && (
            <Avatar alt="Remy Sharp" src={user.photoURL} onClick={handleMenu} />
          )}
        </Toolbar>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => doSignOut()}>Logout</MenuItem>
          <MenuItem onClick={() => doDeleteUser()}>Delete Account</MenuItem>
        </Menu>
      </AppBar>
    </Box>
  );
}
