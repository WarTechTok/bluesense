// src/pages/OAuthRedirect.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function OAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get token and user from URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    console.log('🔍 Raw userStr:', userStr); // DEBUG: See what backend sent

    if (token && userStr) {
      try {
        // Parse the user data
        const user = JSON.parse(decodeURIComponent(userStr));
        
        console.log('✅ Parsed user:', user); // DEBUG: Check if avatar exists
        console.log('🖼️ Avatar URL:', user.avatar); // DEBUG: Check avatar specifically
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Verify it saved correctly
        const savedUser = JSON.parse(localStorage.getItem('user'));
        console.log('💾 Saved in localStorage:', savedUser);

        // Redirect based on role
        if (user.role === 'admin' || user.role === 'staff') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      console.log('❌ No token or user in URL');
      navigate('/login');
    }
  }, [navigate, location]);

  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p>Completing login, please wait...</p>
      
      {/* 🔴 ANIMATION INSIDE THE COMPONENT */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s ease-in-out infinite',
    marginBottom: '20px'
  }
};

export default OAuthRedirect;