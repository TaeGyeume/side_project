import React, {useState} from 'react';
import {authAPI} from '../../api/auth';
import {useAuthStore} from '../../store/authStore';
import {useNavigate} from 'react-router-dom';
import {Button, TextField} from '@mui/material';
import '../auth/style/login.css'; // 기존 스타일 시트

const Login = () => {
  const [formData, setFormData] = useState({
    userid: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {fetchUserProfile} = useAuthStore();

  // Handle input change
  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.loginUser(formData);
      await fetchUserProfile();
      navigate('/main');
    } catch (error) {
      console.error('Login error:', error);

      if (error.response?.status === 401) {
        setError('Invalid username or password.');
      } else if (error.response?.status === 500) {
        setError('Server error, please try again later.');
      } else {
        setError(error.response?.data?.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-12">
          <h2 className="text-center mb-4 text-primary font-weight-bold">Login</h2>

          {/* Error Message */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border rounded-lg shadow-lg bg-white">
            <div className="mb-3">
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                name="userid"
                value={formData.userid}
                onChange={handleChange}
                required
                className="mb-3"
                inputProps={{className: 'login-input'}}
              />
            </div>

            <div className="mb-3">
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mb-3"
                inputProps={{className: 'login-input'}}
              />
            </div>

            {/* Login Button */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              disabled={loading}
              className="btn-login">
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="text-center mt-3">
            <a href="/find-userid" className="text-decoration-none text-muted">
              Find Username
            </a>
          </div>
          <div className="text-center mt-2">
            <a href="/forgot-password" className="text-decoration-none text-muted">
              Forgot Password?
            </a>
          </div>
          <div className="text-center mt-2">
            <a href="/register" className="text-decoration-none text-muted">
              Sign Up
            </a>
          </div>

          {/* Social Login Buttons */}
          <div className="text-center mt-4 social-btns">
            {/* Facebook Button */}
            <Button
              variant="contained"
              style={{backgroundColor: '#3b5998', width: '100%', marginBottom: '10px'}}
              href="#!">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
              Continue with Facebook
            </Button>

            {/* Google Button */}
            <Button
              variant="contained"
              style={{backgroundColor: '#db4437', width: '100%'}}
              href="#!">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M23 12c0-1.45-.47-2.8-1.26-3.88l-5.39-.02c-.42-.89-1.3-1.51-2.39-1.51-1.7 0-3.1 1.2-3.62 2.81-1.11-.91-2.57-1.44-4.01-1.44-3.18 0-5.75 2.65-5.75 5.9 0 3.24 2.58 5.9 5.75 5.9 1.45 0 2.77-.48 3.81-1.29.54.8 1.5 1.3 2.57 1.3 1.85 0 3.36-1.27 3.91-2.95 1.42-3.95-.04-8.09-3.91-8.09z" />
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
