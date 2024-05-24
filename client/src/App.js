import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Dashboard from './Dashboard';
import Login from './Login';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<PrivateRoute element={<Dashboard />} />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
