import React, { useState } from 'react';
import axios from 'axios';
import './createTeamPage.css';  // Import the external CSS file for styling
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const CreateTeamPage = () => {
  const navigate = useNavigate(); // To handle navigation to home page
  const [teams, setTeams] = useState([
    {
      name: "TeamA",
      players: Array.from({ length: 11 }, (_, index) => ({
        name: "",
        rank: index + 1, // Default rank based on player index
        isBowler: false
      }))
    },
    {
      name: "TeamB",
      players: Array.from({ length: 11 }, (_, index) => ({
        name: "",
        rank: index + 1, // Default rank based on player index
        isBowler: false
      }))
    }
  ]);

  const [isTeamCreated, setIsTeamCreated] = useState(false); // Track team creation status
  const [errorMessage, setErrorMessage] = useState(""); // Error message for failure

  // Handle input change for players
  const handleInputChange = (teamIndex, playerIndex, field, value) => {
    const newTeams = [...teams];
    newTeams[teamIndex].players[playerIndex][field] = value;
    setTeams(newTeams);
  };

  // Check if all player names are filled
  const isFormValid = () => {
    return teams.every(team =>
      team.players.every(player => player.name.trim() !== "")
    );
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid()) {
      alert("Please fill in the names of all players.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3010/api/match/create-teams', { teams });
      console.log(response.data);  // Handle response as needed

      // Set team creation status to true
      setIsTeamCreated(true);

      // Redirect to home after a delay
      setTimeout(() => {
        navigate('/'); // Navigate to home page
      }, 2000); // 2 seconds delay for the user to see the success message
    } catch (error) {
      console.error('Error while creating teams:', error);
      setErrorMessage("There was an error creating the teams. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1>Create Playing XI</h1>
      <form onSubmit={handleSubmit}>
        <div className="teams-container">
          {teams.map((team, teamIndex) => (
            <div key={teamIndex} className="team">
              <h2>{team.name}</h2>
              {team.players.map((player, playerIndex) => (
                <div key={playerIndex} className="player">
                  <h3>Player {playerIndex + 1}</h3>
                  <div>
                    <label>Name:</label>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handleInputChange(teamIndex, playerIndex, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label>Rank:</label>
                    <input
                      type="number"
                      value={player.rank}
                      readOnly  // Make rank non-editable
                      disabled  // You can use either readOnly or disabled
                    />
                  </div>
                  <div>
                    <label>Is Bowler?</label>
                    <input
                      type="checkbox"
                      checked={player.isBowler}
                      onChange={(e) => handleInputChange(teamIndex, playerIndex, 'isBowler', e.target.checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="submit-container">
          <button type="submit" className="submit-button" disabled={!isFormValid() || isTeamCreated}>
            {isTeamCreated ? "Teams Created" : "Create Teams"}
          </button>
        </div>
      </form>

      {isTeamCreated && (
        <div className="notification success">
          <p>Team Creation Successful!</p>
        </div>
      )}

      {errorMessage && (
        <div className="notification error">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default CreateTeamPage;
