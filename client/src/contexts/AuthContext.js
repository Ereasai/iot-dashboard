import React, { useContext, useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from '../firebase'

const AuthContext = React.createContext();

const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {

  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  // const signup = (email, password) => {
  //     return createUserWithEmailAndPassword(auth, email, password);
  // };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe; // clearn up the listner. 
  }, []);

  const value = {
    currentUser,
    // signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* only renders the children if done loading, we avoid any issue of
            the child depending on some state provided by this provider and 
            trying to use it when it hasn't become available. */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export {
  useAuth,
  AuthProvider,
};