import React, { useState, useContext } from 'react';
import { db, auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import UserContext from '../UserContext';
import { Dropdown } from 'bootstrap';
import "./buttonUI.css"

function Login() {
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [establishmentData, setEstablishmentData] = useState(null); 
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };  
  const passwordToggleStyle = {
    position: 'absolute',
    right: '10px',
    top: '40%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const handleCreate = () => {
    navigate("/Create");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        let collectionName = '';

        if (userType === 'agents') {
          collectionName = 'agents';
        } else if (userType === 'establishment') {
          collectionName = 'establishments';
        } else {
          alert('Please select a valid account type.');
          return;
        }

        const collectionRef = query(collection(db, collectionName), where('email', '==', email));
        const querySnapshot = await getDocs(collectionRef);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUser(userData);

          alert('Login successful!');

          if (userType === 'agents') {
            navigate('/ViewSpace');
          } else {
            navigate('/Dashboard');
          }
        } else {
          alert('User not found. Please try again.');
        }
      } else {
        alert('User not found. Please try again.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please try again.');
    }
  }

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'white',
    backgroundImage: 'url("https://images.unsplash.com/photo-1604063155785-ee4488b8ad15?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGFya2luZyUyMGxvdHxlbnwwfHwwfHx8MA%3D%3D")', // Replace with your image URL
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',

};

  const selectStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
    fontFamily:'Montserrat'
 
  };
  const formContainerStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent white
    padding: '40px 30px',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '450px', // Use a maximum width
    width: '90%', // Adjust as needed for responsiveness
    height: 'auto', // Let the height adjust to content
    textAlign: 'center',
    position: 'absolute', // Use 'absolute' for responsiveness
    top: '50%', // Center vertically
    left: '50%', // Center horizontally
    transform: 'translate(-50%, -50%)',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 20px',
    margin: '8px 0',
    display: 'inline-block',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease-in-out',
    ':hover': {
      borderColor: '#888'
    }
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#6ac5fe',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
    marginTop: '10%'
  };

  const buttonStyle2 = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#5CED73',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
  };
  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: 'black',
    color: 'white',
    width: '100%',
  };

  const logoStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
  };
  const h1Style ={
    color: 'White',
  }
  const h6Style ={
    color: '#ECECEC',
    marginBottom: '20px'

  }

  return (
   
    <div style={containerStyle}>
        <div style={navbarStyle}>
        <div style={logoStyle}>SpotWise Parking Management</div>
      </div>
      <div style={formContainerStyle}>
        <h1 style={h1Style}>HELLO!</h1>
        <h6 style={h6Style}>Unlock the Gateway to Your World</h6>
         <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          style={selectStyle}
        >
          <option value="">Please select type of account</option>
          <option value="agents">Operator</option>
          <option value="establishment">Establishment</option>
        </select>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Username or Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}

          />
          {password.length > 0 && ( 
            <span style={passwordToggleStyle} onClick={togglePasswordVisibility}>
              {showPassword ? (
                <FontAwesomeIcon icon={faEyeSlash} />
              ) : (
                <FontAwesomeIcon icon={faEye} />
              )}
            </span>
          )}
        </div>
          <div>
          <button type="submit" style={buttonStyle} class ="glowonhover">
            Log In
          </button>
          <p style={{ marginTop: '10px', fontSize: '12px' }}>
          <a href="/forget" style={{ textDecoration: 'none', color: '#ECECEC' }}>Forget Password?</a>
          </p>
          <button className="glowonhover" type="submit" style={buttonStyle2} onClick={handleCreate}>
            Create Account
          </button>
          </div>
        </form>
     
      </div>
    </div>
    
  );
}
export default Login;