import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const googleError = searchParams.get('error');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://agentpilot.onrender.com/auth/google';
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>AP</div>
          <span>Agent Pilot</span>
        </div>

        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {(error || googleError) && (
          <div style={styles.errorMsg}>{error || googleError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="your_username"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>
          <button 
            type="submit" 
            style={loading ? {...styles.btn, ...styles.btnDisabled} : styles.btn}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.divider}>
          <span>or</span>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleLogin}
          style={styles.btnGoogle}
        >
          <svg viewBox="0 0 48 48" style={styles.googleIcon}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.06 24.06 0 0 0 0 21.56l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div style={styles.bottomLink}>
          Don't have an account? <Link to="/signup">Create Account</Link>
        </div>
        <div style={styles.backHome}>
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0f',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    background: '#11111d',
    border: '1px solid #1e1e35',
    borderRadius: '16px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,.5)'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '28px'
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#fff'
  },
  title: {
    fontSize: '26px',
    color: '#fff',
    textAlign: 'center',
    marginBottom: '6px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
    marginBottom: '28px',
    fontSize: '14px'
  },
  errorMsg: {
    background: '#2a1010',
    color: '#ff6b6b',
    border: '1px solid #ff6b6b33',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: '18px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#888',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #1e1e35',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    background: '#0a0a14',
    color: '#fff'
  },
  btn: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
    color: '#fff',
    marginTop: '6px'
  },
  btnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '22px 0',
    color: '#333',
    fontSize: '13px'
  },
  btnGoogle: {
    width: '100%',
    padding: '13px',
    border: '1.5px solid #1e1e35',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    background: '#0a0a14',
    color: '#ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  googleIcon: {
    width: '20px',
    height: '20px'
  },
  bottomLink: {
    textAlign: 'center',
    marginTop: '22px',
    fontSize: '14px',
    color: '#555'
  },
  backHome: {
    textAlign: 'center',
    marginTop: '14px'
  }
};

