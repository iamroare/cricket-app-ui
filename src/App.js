import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// Corrected imports (make sure the filenames match the component names)
import HomePage from './Pages/homePage'; //from './Pages/HomePage';  // Capital H for HomePage

import CreateTeamPage from './Pages/createTeamPage';// from './Pages/CreateTeamPage';  // Capital C for CreateTeamPage


// import React from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// // Corrected imports with proper casing
// import HomePage from './Pages/HomePage'; 
// import CreateTeamPage from './Pages/CreateTeamPage';

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
        {/* Navbar */}
        <nav style={{ marginBottom: '20px' }}>
          <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', gap: '20px' }}>
            <li>
              <Link to="/" style={{ textDecoration: 'none', fontSize: '18px' }}>Home</Link>
            </li>
            <li>
              <Link to="/create-team" style={{ textDecoration: 'none', fontSize: '18px' }}>Create Team</Link>
            </li>
          </ul>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-team" element={<CreateTeamPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
