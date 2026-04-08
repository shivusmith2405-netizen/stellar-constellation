import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [lampOn, setLampOn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUser, setSignupUser] = useState('');
  const [signupPass, setSignupPass] = useState('');

  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('error'); // error or success

  const displayToast = (msg, type = 'error') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const triggerShake = (field) => {
    setErrors(prev => ({ ...prev, [field]: true, [`${field}Pulse`]: false }));
    setTimeout(() => {
        setErrors(prev => ({ ...prev, [`${field}Pulse`]: true }));
    }, 10);
  };

  const clearError = (field) => {
    setErrors(prev => ({ ...prev, [field]: false, [`${field}Pulse`]: false }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    let isValid = true;
    let missingFields = [];

    if (!loginUser.trim()) { triggerShake('loginUser'); missingFields.push('Username'); isValid = false; }
    if (!loginPass.trim()) { triggerShake('loginPass'); missingFields.push('Password'); isValid = false; }

    if (!isValid) {
      displayToast(`Please enter your ${missingFields.join(' and ')}.`);
      return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loginUser, password: loginPass })
        });
        const data = await response.json();
        
        if (response.ok) {
            onLoginSuccess(data.username);
        } else {
            triggerShake('loginUser');
            triggerShake('loginPass');
            displayToast(data.error || 'Authentication failed.');
        }
    } catch (err) {
        displayToast('Network module unable to connect to auth server.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    let isValid = true;

    if (!signupEmail.trim()) { triggerShake('signupEmail'); isValid = false; }
    if (!signupUser.trim()) { triggerShake('signupUser'); isValid = false; }
    if (!signupPass.trim()) { triggerShake('signupPass'); isValid = false; }

    if (!isValid) {
      displayToast("Please fill out all required fields to create an account.");
      return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: signupEmail, username: signupUser, password: signupPass })
        });
        const data = await response.json();
        
        if (response.ok) {
            displayToast('Account created! Sign in to proceed.', 'success');
            setIsSignup(false); // Switch to login screen natively
            setLoginUser(signupUser); // autofill
        } else {
            triggerShake('signupUser');
            triggerShake('signupEmail');
            displayToast(data.error);
        }
    } catch (err) {
        displayToast('Network error while constructing account.');
    }
  };

  return (
    <div className={`login-wrapper ${lampOn ? 'lamp-on' : ''}`}>
      
      <div className={`toast ${showToast ? 'show' : ''}`} style={{ backgroundColor: toastType === 'success' ? '#10b981' : '#ef4444' }}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span>{toastMessage}</span>
      </div>

      <svg className="sketch-overlay" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
        <g stroke="rgba(0, 0, 0, 0.12)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Extended Doodles Context -> Clouds, Data Base Cylinders, Nodes */}
          
          <path d="M 300 150 Q 350 80 420 180 T 550 120 T 650 200" />
          <path d="M 280 180 Q 380 120 450 220 T 600 160" strokeDasharray="6 8" />
          <circle cx="340" cy="110" r="3" fill="rgba(0,0,0,0.12)" />
          <circle cx="480" cy="190" r="4" fill="rgba(0,0,0,0.12)" />
          
          <circle cx="500" cy="100" r="25" />
          <ellipse cx="500" cy="100" rx="45" ry="12" transform="rotate(-15 500 100)" />
          
          <path d="M 200 90 A 30 30 0 1 0 240 140 A 35 35 0 1 1 200 90 Z" fill="rgba(0,0,0,0.05)" />
          
          <line x1="700" y1="50" x2="780" y2="130" strokeDasharray="15 8 5 8"/>
          <polygon points="780,130 770,120 790,115 785,135" fill="rgba(0,0,0,0.12)" />

          <g transform="translate(150, 750)">
            <path d="M 0 -40 L 15 0 L 0 40 L -15 0 Z" />
            <path d="M -40 0 L 0 -15 L 40 0 L 0 15 Z" />
            <circle cx="0" cy="0" r="50" strokeDasharray="6 6" />
            <text x="-8" y="-55" fill="rgba(0,0,0,0.15)" stroke="none" fontSize="18" fontFamily="sans-serif" fontWeight="bold">N</text>
          </g>

          <path d="M 280 850 L 340 730 L 400 820 L 440 760 L 520 880" />
          <path d="M 320 770 L 340 780 L 360 760" />
          <path d="M 420 790 L 440 805 L 460 790" />
          <path d="M 300 830 L 310 810 L 320 830 Z" />
          <path d="M 380 840 L 390 820 L 400 840 Z" />

          {/* Code syntax doodles */}
          <g transform="translate(850, 650) scale(1.5)">
            <path d="M -20 -15 L -35 0 L -20 15" stroke="rgba(0,0,0,0.15)" strokeWidth="4" />
            <path d="M 20 -15 L 35 0 L 20 15" stroke="rgba(0,0,0,0.15)" strokeWidth="4" />
            <line x1="-10" y1="20" x2="10" y2="-20" stroke="rgba(0,0,0,0.15)" strokeWidth="4" />
          </g>

          {/* Database Cylinders Extra */}
          <g transform="translate(300, 300) scale(1.2)">
             <ellipse cx="0" cy="-25" rx="30" ry="10" />
             <ellipse cx="0" cy="0" rx="30" ry="10" strokeDasharray="5, 3" />
             <ellipse cx="0" cy="25" rx="30" ry="10" />
             <line x1="-30" y1="-25" x2="-30" y2="25" />
             <line x1="30" y1="-25" x2="30" y2="25" />
             <text x="-12" y="5" fill="rgba(0,0,0,0.15)" stroke="none" fontSize="10" fontFamily="sans-serif" fontWeight="bold">SQL</text>
          </g>

          <path d="M 500 950 Q 550 820 650 880 T 800 780" strokeDasharray="8 12" strokeWidth="4"/>
          <path d="M 785 765 L 815 795 M 815 765 L 785 795" strokeWidth="5"/> 
          
          <path d="M 50 850 Q 70 830 90 850 T 130 850" />
          <path d="M 80 880 Q 100 860 120 880 T 160 880" />

          <g transform="translate(1000, 150)">
            <path d="M -20 -10 A 20 20 0 0 1 20 -10" />
            <ellipse cx="0" cy="-10" rx="40" ry="12" />
            <circle cx="-25" cy="-8" r="2" fill="rgba(0,0,0,0.12)" />
            <circle cx="0" cy="-6" r="2" fill="rgba(0,0,0,0.12)" />
            <circle cx="25" cy="-8" r="2" fill="rgba(0,0,0,0.12)" />
            <polygon points="-15,2 -30,60 30,60 15,2" fill="rgba(255,255,255,0.05)" strokeDasharray="5 5" />
          </g>

          <g transform="translate(1250, 750)">
            <circle cx="0" cy="0" r="10" />
            <circle cx="0" cy="0" r="30" strokeDasharray="5 5"/>
            <circle cx="0" cy="0" r="50" strokeDasharray="10 15"/>
            <line x1="0" y1="-60" x2="0" y2="60" strokeDasharray="4 4" />
            <line x1="-60" y1="0" x2="60" y2="0" strokeDasharray="4 4" />
          </g>

          {/* Curly brace doodles */}
          <g transform="translate(80, 200) scale(1.8)">
            <path d="M 10 -20 Q 0 -20 0 -10 T -10 0 T 0 10 T 10 20" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
          </g>
          <g transform="translate(1100, 350) scale(2)">
            <path d="M -10 -20 Q 0 -20 0 -10 T 10 0 T 0 10 T -10 20" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
          </g>

        </g>
      </svg>

      <div className="room-darkness"></div>

      <div className="scene" id="scene">
        
        <div className="lamp-container">
          <div className="lamp-shade">
            <div className="face">
              <div className="eyes"><div className="eye"></div><div className="eye"></div></div>
              <div className="mouth"><div className="tongue"></div></div>
            </div>
          </div>
          <div className="lamp-pole"></div>
          <div className="lamp-base"></div>
          
          <div className="pull-string" onClick={() => setLampOn(!lampOn)}>
            <div className="string-line"></div>
            <div className="string-knob"></div>
          </div>
          
          <div className="light-beam"></div>
        </div>

        <div className={`form-wrapper ${isSignup ? 'show-signup' : ''}`}>
          <div className="form-slider">
            
            <div className="form-panel">
              <h2>Sign In</h2>
              <div className={`input-group ${errors.loginUser ? 'has-error' : ''} ${errors.loginUserPulse ? 'shake' : ''}`}>
                <label>Username</label>
                <input type="text" value={loginUser} onChange={(e) => { setLoginUser(e.target.value); clearError('loginUser'); }} placeholder="Enter your username" />
              </div>
              <div className={`input-group ${errors.loginPass ? 'has-error' : ''} ${errors.loginPassPulse ? 'shake' : ''}`}>
                <label>Password</label>
                <input type="password" value={loginPass} onChange={(e) => { setLoginPass(e.target.value); clearError('loginPass'); }} placeholder="Enter your password" />
              </div>
              <button className="submit-btn" onClick={handleLogin}>Login</button>
              <div className="toggle-link">
                Don't have an account? <span style={{ color: '#d946ef', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsSignup(true)}>Sign Up</span>
              </div>
            </div>

            <div className="form-panel">
              <h2>Create Account</h2>
              <div className={`input-group ${errors.signupEmail ? 'has-error' : ''} ${errors.signupEmailPulse ? 'shake' : ''}`}>
                <label>Email</label>
                <input type="email" value={signupEmail} onChange={(e) => { setSignupEmail(e.target.value); clearError('signupEmail'); }} placeholder="Enter your email" />
              </div>
              <div className={`input-group ${errors.signupUser ? 'has-error' : ''} ${errors.signupUserPulse ? 'shake' : ''}`}>
                <label>Username</label>
                <input type="text" value={signupUser} onChange={(e) => { setSignupUser(e.target.value); clearError('signupUser'); }} placeholder="Choose a username" />
              </div>
              <div className={`input-group ${errors.signupPass ? 'has-error' : ''} ${errors.signupPassPulse ? 'shake' : ''}`}>
                <label>Password</label>
                <input type="password" value={signupPass} onChange={(e) => { setSignupPass(e.target.value); clearError('signupPass'); }} placeholder="Create a password" />
              </div>
              <button className="submit-btn" onClick={handleSignup}>Create Account</button>
              <div className="toggle-link">
                Already have an account? <span style={{ color: '#d946ef', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsSignup(false)}>Sign In</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
