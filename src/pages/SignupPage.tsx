import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to login page with signup mode
    navigate('/login', { 
      state: { 
        ...location.state,
        signupMode: true 
      } 
    });
  }, [navigate, location.state]);

  return null;
};

export default SignupPage;