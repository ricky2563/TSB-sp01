import React, { useState, useEffect } from 'react';
import SP01 from './SP01';
import Boia from './Boia';
import './Game.css';

// Define the BoiaState interface representing each buoy's position
interface BoiaState {
  positionX: number;
  positionY: 'top' | 'bottom';
}

// Game configuration constants
const GAME_CONFIG = {
  BUOY_MAX_POSITION_X: 800,
  POSITION_SWITCH_DISTANCE: { min: 595, max: 675 },
  INITIAL_BUOY_SPEED: 50,
  MIN_SPAWN_SPEED: 600,
  INITIAL_SPAWN_SPEED: 1000,
  SCORE_INTERVAL: 100,
  SPAWN_NUMBER_THRESHOLD: 3,
  BUOY_MOVE_DISTANCE: 10,
};

const Game: React.FC = () => {
  // Main state variables
  const [gameStarted, setGameStarted] = useState(false); 
  const [sp01Position, setSp01Position] = useState<'top' | 'bottom'>('bottom');
  const [boias, setBoias] = useState<BoiaState[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [boiaSpeed, setBoiaSpeed] = useState(GAME_CONFIG.INITIAL_BUOY_SPEED);
  const [spawnSpeed, setSpawnSpeed] = useState(GAME_CONFIG.INITIAL_SPAWN_SPEED);
  const [spacePressed, setSpacePressed] = useState(false);

  let lastSpawnPosition: 'top' | 'bottom' | null = null;
  let consecutiveCount = 0;

  // Handle user keyboard input for game controls and actions
  const handleKeyDown = (e: KeyboardEvent) => {
  
    if (!gameStarted) {
      if (e.key === ' ') {
        setGameStarted(true);
      }
      return;
    }

    if (gameOver || paused) {
      if (e.key === 'r' || e.key === 'R') {
        resetGame();
      }
      return;
    }

    if (e.key === 'Escape') {
      setPaused((prevPaused) => !prevPaused);
      return;
    }

    if (paused) return;

    if (e.key === ' ' && !spacePressed) {
      setSp01Position(sp01Position === 'bottom' ? 'top' : 'bottom');
      setSpacePressed(true);
    } else if (e.key === 'ArrowUp' && sp01Position === 'bottom') {
      setSp01Position('top');
    } else if (e.key === 'ArrowDown' && sp01Position === 'top') {
      setSp01Position('bottom');
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      setSpacePressed(false);
    }
  };

  // Reset game state and variables
  const resetGame = () => {
    setGameStarted(false);
    setSp01Position('bottom');
    setBoias([]);
    setGameOver(false);
    setPaused(false);
    setScore(0);
    setBoiaSpeed(50);
    setSpawnSpeed(1000);
    setSpacePressed(false);
  };

  // Spawn new buoys in either 'top' or 'bottom' position
  const spawnBoia = () => {
    let positionY: 'top' | 'bottom';

    // Alternate buoy position if consecutive spawn limit is reached
    if (lastSpawnPosition && consecutiveCount >= GAME_CONFIG.SPAWN_NUMBER_THRESHOLD) {
      positionY = lastSpawnPosition === 'top' ? 'bottom' : 'top';
    } else {
      positionY = Math.random() > 0.5 ? 'top' : 'bottom';
    }

    // Track last position and consecutive count
    if (positionY === lastSpawnPosition) {
      consecutiveCount++;
    } else {
      consecutiveCount = 1;
      lastSpawnPosition = positionY;
    }

    setBoias((prevBoias) => [...prevBoias, { positionX: -50, positionY }]);
  };

  // Speed up Buoy and spawn rates based on the score
  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      if (score % GAME_CONFIG.SCORE_INTERVAL === 0) {
        setBoiaSpeed(Math.max(boiaSpeed - 5, 20));
        setSpawnSpeed(Math.max(spawnSpeed - 100, 400));
      }
    }
  }, [score, gameStarted, gameOver, paused]);

  // Update buoy positions at regular intervals
  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      const interval = setInterval(() => {
        setBoias((prevBoias) =>
          prevBoias.map((boia) => ({ ...boia, positionX: boia.positionX + GAME_CONFIG.BUOY_MOVE_DISTANCE }))
                  .filter((boia) => boia.positionX < GAME_CONFIG.BUOY_MAX_POSITION_X)
        );
      }, boiaSpeed);
      return () => clearInterval(interval);
    }
  }, [boiaSpeed, gameStarted, gameOver, paused]);

  // Regularly spawn buoys based on current spawn speed
  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      const spawnInterval = setInterval(spawnBoia, spawnSpeed);
      return () => clearInterval(spawnInterval);
    }
  }, [spawnSpeed, gameStarted, gameOver, paused]);

  // Increase the score over time when the game is running
  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      const scoreInterval = setInterval(() => {
        setScore((prevScore) => {
          const newScore = prevScore + 1;
          if (newScore >= maxScore) setMaxScore(newScore);
          return newScore;
        });
      }, 100);
      return () => clearInterval(scoreInterval);
    }
  }, [gameStarted, gameOver, maxScore, paused]);

  // Detect collisions between SP01 and any Buoy
  useEffect(() => {
    if (!paused) {
      const detectCollision = () => {
        boias.forEach((boia) => {
          if (boia.positionX < GAME_CONFIG.POSITION_SWITCH_DISTANCE.max && 
            boia.positionX > GAME_CONFIG.POSITION_SWITCH_DISTANCE.min && sp01Position === boia.positionY) {
            setGameOver(true);
          }
        });
      };
      detectCollision();
    }
  }, [boias, sp01Position, paused]);

  // Pause game if window visibility changes (e.g., tab change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameStarted && !gameOver) {
        setPaused(true);
      }
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameStarted, gameOver]);

  // Attach key event listeners for gameplay controls
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [sp01Position, gameStarted, gameOver, paused, spacePressed]);

  return (
    <div className="score-border">
      <div className="score-container">
        <div className="max-score">High Score: {maxScore}</div>
        <div className="score">Score: {score}</div>
      </div>
      {gameStarted && !gameOver && (
      <button className="pause-icon"
          onClick={(e) =>{
            setPaused(!paused);
            (e.target as HTMLButtonElement).blur();
          }}
      />
      )}
      {!gameStarted && (
        <div className="start-screen">
          <p className="start-text">Press Space to Start</p>
        </div>
      )}
      {gameStarted && (
        <div className={`game-area ${paused || gameOver ? 'paused' : 'running'}`}>
          <SP01 position={sp01Position} />
          {boias.map((boia, index) => (
            <Boia key={index} positionX={boia.positionX} positionY={boia.positionY} />
          ))}
          {gameOver && <div className="game-over">Game Over! Press R to restart</div>}
          {paused && (
            <div className="pause-menu">
              <div className="menu-options">
                <button className="pause-button continue" onClick={() => setPaused(false)}>Continue</button>
                <button className="pause-button reset" onClick={resetGame}>Reset</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Game;

