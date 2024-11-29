import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './homePage.css';

const HomePage = () => {
  const [teamStats, setTeamStats] = useState({
    totalRuns: 0,
    totalOuts: 0,
    totalBallsPlayed: 0,
    totalWide: 0,
    totalNoBall: 0,
    totalBye: 0,
    totalLegBye: 0,
  });

  const [battingStats, setBattingStats] = useState([]);
  const [players, setPlayers] = useState({
    striker: { name: '', runs: 0, balls: 0 },
    nonStriker: { name: '', runs: 0, balls: 0 },
  });

  const [bowlerData, setBowlerData] = useState([]); // To store bowler data (name, balls bowled)
  const [currentBowlerIndex, setCurrentBowlerIndex] = useState(0); // Index to keep track of the current bowler
  const [bowlerBalls, setBowlerBalls] = useState([]); // To track balls bowled by each bowler
  const [selectedRun, setSelectedRun] = useState(0); // Selected run (0, 1, 2, 3, 4, 6)
  const [selectedExtras, setSelectedExtras] = useState({
    noBall: false,
    wide: false,
    bye: false,
    legBye: false,
    wicket: false,
  });

 
  useEffect(() => {
    fetchData();
  }, []); 

  // Function to fetch data for team stats, batting stats, and current batters
  const fetchData = () => {
    // Fetching team scorecard
    axios.get('http://localhost:3010/api/match/team-scorecard?team=TeamA')
      .then((response) => {
        const data = response.data;
        setTeamStats({
          totalRuns: data.totalRuns,
          totalOuts: data.totalOuts,
          totalBallsPlayed: data.totalBallsPlayed,
          totalWide: data.totalWide,
          totalNoBall: data.totalNoBall,
          totalBye: data.totalBye,
          totalLegBye: data.totalLegBye,
        });
      })
      .catch((error) => console.error('Error fetching team stats:', error));

    // Fetching player scorecard
    axios.get('http://localhost:3010/api/match/player-scorecard?firstTeam=TeamA&secondTeam=TeamB')
      .then((response) => {
        setBattingStats(response.data.batting);
      })
      .catch((error) => console.error('Error fetching player scorecard:', error));

    // Fetching current batters (striker & non-striker)
    axios.get('http://localhost:3010/api/match/get-batters?team=TeamA')
      .then((response) => {
        const { striker, nonStriker } = response.data;
        setPlayers({
          striker: { name: striker.name, runs: striker.runs, balls: striker.balls },
          nonStriker: { name: nonStriker.name, runs: nonStriker.runs, balls: nonStriker.balls },
        });
      })
      .catch((error) => console.error('Error fetching current batters:', error));

    // Fetching bowlers for TeamB and initializing their balls count
    axios.get('http://localhost:3010/api/match/get-bowlers?team=TeamB')
      .then((response) => {
        const bowlers = response.data;
        setBowlerData(bowlers);
        setBowlerBalls(bowlers.map(() => 0)); // Initialize all bowlers with 0 balls bowled
      })
      .catch((error) => console.error('Error fetching bowlers:', error));
  };

  // Handle the selection of runs (0, 1, 2, 3, 4, 6)
  const handleRunSelection = (run) => {
    setSelectedRun(run);
  };

  // Handle extras selection (noBall, wide, bye, legBye, wicket)
  const handleExtrasSelection = (extra) => {
    setSelectedExtras({
      ...selectedExtras,
      [extra]: !selectedExtras[extra], // Toggle the selected extra
    });
  };

  // Helper function to convert balls to overs format
  const formatBallsToOvers = (balls) => {
    const overs = Math.floor(balls / 6);
    const ballsLeft = balls % 6;
    return `${overs}.${ballsLeft}`;
  };

  // Function to handle the NewBall button click
  const handleNewBall = async () => {
    const currentBowler = bowlerData[currentBowlerIndex];
    const { striker, nonStriker } = players;

    const requestBody = {
      striker: striker.name,
      nonStriker: nonStriker.name,
      strikerTeam: 'TeamA',
      bowler: currentBowler.name,
      run: selectedRun,
      wicket: selectedExtras.wicket,
      bye: selectedExtras.bye,
      legBye: selectedExtras.legBye,
      noBall: selectedExtras.noBall,
      wide: selectedExtras.wide,
    };

    try {
      const response = await axios.post('http://localhost:3010/api/match/player-action', requestBody);
      console.log('Ball action submitted:', response.data);

      // Update the number of balls bowled by the current bowler
      const updatedBowlerBalls = [...bowlerBalls];
      updatedBowlerBalls[currentBowlerIndex] += 1;
      setBowlerBalls(updatedBowlerBalls);

      // If the current bowler has bowled 6 balls, move to the next bowler
      if (updatedBowlerBalls[currentBowlerIndex] >= 6) {
        const nextBowlerIndex = (currentBowlerIndex + 1) % bowlerData.length;
        setCurrentBowlerIndex(nextBowlerIndex);
      }

      // Reset the run/extras selection
      setSelectedRun(0);
      setSelectedExtras({
        noBall: false,
        wide: false,
        bye: false,
        legBye: false,
        wicket: false,
      });

      // Re-fetch relevant data after New Ball action
      fetchData(); // Refetch data for team stats, batting stats, and bowlers

    } catch (error) {
      console.error('Error submitting ball action:', error);
    }
  };

  return (
    <div className="home-page">
      <div className="left-column">
        <div className="box a">
          <h3>Current Batting</h3>
          <div className="current-batting">
            <div className="batter-box">
              <h4>Striker</h4>
              <p>{players.striker.name}: {players.striker.runs} ({players.striker.balls})</p>
            </div>
            <div className="batter-box">
              <h4>Non-Striker</h4>
              <p>{players.nonStriker.name}: {players.nonStriker.runs} ({players.nonStriker.balls})</p>
            </div>
          </div>
        </div>

        <div className="box b">
          <h3>Action Panel</h3>
          <div className="run-buttons">
            {['0', '1', '2', '3', '4', '6'].map((run) => (
              <button key={run} onClick={() => handleRunSelection(parseInt(run))}>{run}</button>
            ))}
          </div>

          <div className="extras-buttons">
            {['noBall', 'wide', 'bye', 'legBye', 'wicket'].map((extra) => (
              <button
                key={extra}
                className={selectedExtras[extra] ? 'selected' : ''}
                onClick={() => handleExtrasSelection(extra)}
              >
                {extra}
              </button>
            ))}
          </div>

          <button className="new-ball-button" onClick={handleNewBall}>New Ball</button>
        </div>
      </div>

      <div className="right-column">
        <div className="box c">
          <h3>Team Score</h3>
          <ul>
            <li>Total Runs: {teamStats.totalRuns}</li>
            <li>Total Outs: {teamStats.totalOuts}</li>
            <li>Total Balls Played: {teamStats.totalBallsPlayed}</li>
            <li>Total Wide: {teamStats.totalWide}</li>
            <li>Total No Ball: {teamStats.totalNoBall}</li>
            <li>Total Bye: {teamStats.totalBye}</li>
            <li>Total Leg Bye: {teamStats.totalLegBye}</li>
          </ul>
        </div>

        <div className="box d">
          <h3>Player Scorecard</h3>
          <ul>
            {battingStats.map((player, index) => (
              <li key={index}>
                <strong>{player.name}</strong> - Runs: {player.runs}, Balls Played: {player.ballsPlayed}
              </li>
            ))}
          </ul>
        </div>

        <div className="box e">
          <h3>Bowler Stats</h3>
          <ul>
            {bowlerData.map((bowler, index) => (
              <li key={index}>
                <strong>{bowler.name}</strong> - Runs: {bowler.runGiven} | Balls: {bowlerBalls[index]} | Overs: {formatBallsToOvers(bowlerBalls[index])}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
