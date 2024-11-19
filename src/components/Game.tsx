import React, { useState, useEffect } from 'react';
import {POSITION_SWITCH_DISTANCE, SCORE_INTERVAL} from '../utils/constants'
import SP01, { useSP01 } from './SP01';
import Boia, { useBoias } from './Boia';
import './Game.css';

const Game: React.FC = () => {
  // Main state variables
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  const { boias, updateSpeeds, resetBoias } = useBoias(gameStarted, gameOver, paused);
  const { position: sp01Position, togglePosition, setPositionManually, spacePressed, handleSpacePressed, resetSP01 } = useSP01();

  // Handle user keyboard input for game controls and actions
  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameOver || paused){
      if (e.key === 'r' || e.key === 'R'){
       resetGame();
      }
      return;
    }

    if (e.key === ' ') {
      if (!gameStarted) {
        setGameStarted(true); // Start the game
        return
      } else if (!paused && !spacePressed) {
        togglePosition(); // Only toggle when the game has already started
        handleSpacePressed(true); // Track the space key as pressed
      }
    }
    
    if (e.key === 'Escape' && gameStarted && !gameOver){
       setPaused((prev) => !prev);
       return;
    }

    if (e.key === 'ArrowUp' && sp01Position === 'bottom') {
      setPositionManually('top');
    }
    if (e.key === 'ArrowDown' && sp01Position === 'top') {
      setPositionManually('bottom');
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === ' ') handleSpacePressed(false);
  };

  // Reset game state and variables
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setPaused(false);
    setScore(0);
    resetBoias();
    resetSP01();  
  };

  // Speed up Buoy and spawn rates based on the score
  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      if (score % SCORE_INTERVAL === 0) {
        updateSpeeds(score);
      }
    }
  }, [score, gameStarted, gameOver, paused]);

  // Increase the score over time when the game is running
  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      const scoreInterval = setInterval(() => {
        setScore((prev) => {
          const newScore = prev + 1;
          if (newScore > maxScore) setMaxScore(newScore);
          return newScore;
        });
      }, 100);
      return () => clearInterval(scoreInterval);
    }
  }, [gameStarted, gameOver, paused]);

  // Collision detection for SP01 with buoys
  useEffect(() => {
    const detectCollision = () => {
      boias.forEach((boia) => {
        if (boia.positionX < POSITION_SWITCH_DISTANCE.max &&
           boia.positionX > POSITION_SWITCH_DISTANCE.min &&
           sp01Position === boia.positionY) {
          setGameOver(true);
        }
      });
    };
    if (!paused) detectCollision();
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

