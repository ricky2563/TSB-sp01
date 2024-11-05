import React, { useState, useEffect } from 'react';
import SP01 from './SP01';
import Boia from './Boia';
import './Game.css';

interface BoiaState {
  positionX: number;
  positionY: 'top' | 'bottom';
}

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

  const handleKeyDown = (e: KeyboardEvent) => {
    // Handle user keyboard input for game controls and actions
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

  const spawnBoia = () => {
    let positionY: 'top' | 'bottom';

    if (lastSpawnPosition && consecutiveCount >= GAME_CONFIG.SPAWN_NUMBER_THRESHOLD) {
      positionY = lastSpawnPosition === 'top' ? 'bottom' : 'top';
    } else {
      positionY = Math.random() > 0.5 ? 'top' : 'bottom';
    }

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

  //Buoy life cycle
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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameStarted && !gameOver) {
        setPaused(true); // Pause the game when the window is hidden
      }
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameStarted, gameOver]);

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
      <div className="max-score">High Score: {maxScore}</div>
      <div className="score">Score: {score}</div>
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

