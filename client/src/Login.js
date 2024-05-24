import { Alert, Button, Card, CardContent, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { Logo } from './components/Logo'
import { Box, Container, maxWidth, width } from '@mui/system';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const Login = () => {


  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/')
    } catch (e) {
      console.error(e)
      setError('Failed to sign in');
    }
    setLoading(false);
  };
  

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
      }}>

      <Card sx={{ width: '400px', widthmaxWidth: '400px' }}>
        <CardContent>
          <Box 
            component='form'
            onSubmit={handleLogin}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%'
            }}>
              <Typography 
                variant='h4' 
              >
                Log In
              </Typography>
              <Logo />
            </div>
            {error && <Alert severity='error'>{error}</Alert>}
            <TextField 
              margin='normal'
              id='email' 
              type='email'
              label='Email'
              required
              fullWidth
              value={email}
              onChange={(e) => {setEmail(e.target.value)}}
            />
            <TextField 
              margin='normal'
              id='password' 
              type='password'
              label='Password'
              required
              fullWidth
              value={password}
              onChange={(e) => {setPassword(e.target.value)}}
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              disabled={loading}
              sx={{ mt: 3 }}
            >
              log in
            </Button>
          </Box>

          

        </CardContent>
      </Card>
      
    </div>
  )
}

export default Login
