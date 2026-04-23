import './App.css'
import { useState, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { API_BASE_URL } from './config'

const HomePage = lazy(() => import('./pages/homePage'))

const LoginPage = ({
  handleLoginSubmit,
  loginUserName,
  setLoginUserName,
  loginPassword,
  setLoginPassword,
  toggleAuthRoute
}) => {
  return (
    <div className="login-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleLoginSubmit}>
          <input
            type="text"
            name="username"
            className='input-box'
            placeholder="Enter Username"
            value={loginUserName}
            onChange={(e) => setLoginUserName(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            className='input-box'
            placeholder="Enter Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
          <button type="submit" className='submit-button'>Login</button>
        </form>
        <p className='auth-switch-text'>
          Don't have an account? <span className="toggle-auth-text" onClick={toggleAuthRoute}>Sign Up</span>
        </p>
      </div>
    </div>
  )
}

const SignupPage = ({
  handleSignupSubmit,
  signupUserName,
  setSignupUserName,
  signupEmail,
  setSignupEmail,
  signupPassword,
  setSignupPassword,
  signupConfirmPassword,
  setSignupConfirmPassword,
  toggleAuthRoute
}) => {
  return (
    <div className="signup-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSignupSubmit}>
          <input
            type="text"
            className='input-box'
            name="username"
            placeholder="Choose Username"
            value={signupUserName}
            onChange={(e) => setSignupUserName(e.target.value)}
            required
          />
          <input
            type="email"
            className='input-box'
            name="email"
            placeholder="Enter Email"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className='input-box'
            name="password"
            placeholder="Create Password"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className='input-box'
            name="confirmPassword"
            placeholder="Confirm Password"
            value={signupConfirmPassword}
            onChange={(e) => setSignupConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className='submit-button'>Sign Up</button>
        </form>
        <p className='auth-switch-text'>
          Already have an account? <span className="toggle-auth-text" onClick={toggleAuthRoute}>Login</span>
        </p>
      </div>
    </div>
  )
}

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(Cookies.get('token')));
  const [authRoute, setAuthRoute] = useState('login')

  const toggleAuthRoute = () => {
    setAuthRoute(authRoute === 'login' ? 'signup' : 'login')
  }

  const [loginUserName, setLoginUserName] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [signupUserName, setSignupUserName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginUserName,
          password: loginPassword,
        }),
      })
      const data = await result.json()
      if (data.message === 'User Logged In Successfully') {
        Cookies.set('token', data.token)
        alert(data.message)
        setIsLoggedIn(true)
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error during login:', error)
      alert('Login failed. Please try again.')
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupUserName,
          email: signupEmail,
          password: signupPassword,
        }),
      })
      const data = await result.json()
      if (data.message === 'User registered successfully') {
        Cookies.set('token', data.token)
        setIsLoggedIn(true)
        alert(data.message)
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error during signup:', error)
      alert('Signup failed. Please try again.')
    }
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <Routes>
          <Route
            path='/*'
            element={
              isLoggedIn ?
                <HomePage setIsLoggedIn={setIsLoggedIn} /> :
                authRoute === 'login' ? (
                  <LoginPage
                    handleLoginSubmit={handleLoginSubmit}
                    loginUserName={loginUserName}
                    setLoginUserName={setLoginUserName}
                    loginPassword={loginPassword}
                    setLoginPassword={setLoginPassword}
                    toggleAuthRoute={toggleAuthRoute}
                  />
                ) : (
                  <SignupPage
                    handleSignupSubmit={handleSignupSubmit}
                    signupUserName={signupUserName}
                    setSignupUserName={setSignupUserName}
                    signupEmail={signupEmail}
                    setSignupEmail={setSignupEmail}
                    signupPassword={signupPassword}
                    setSignupPassword={setSignupPassword}
                    signupConfirmPassword={signupConfirmPassword}
                    setSignupConfirmPassword={setSignupConfirmPassword}
                    toggleAuthRoute={toggleAuthRoute}
                  />
                )
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App