import React, { useState, useEffect } from 'react';
import SP01 from './SP01';
import Boia from './Boia';
import './Game.css';

interface BoiaState {
  positionX: number;
  positionY: 'top' | 'bottom';
}

const Game: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false); // New state to track if game has started
  const [sp01Position, setSp01Position] = useState<'top' | 'bottom'>('bottom');
  const [boias, setBoias] = useState<BoiaState[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [boiaSpeed, setBoiaSpeed] = useState(50);
  const [spawnSpeed, setSpawnSpeed] = useState(1000);
  const [spacePressed, setSpacePressed] = useState(false);

  let lastSpawnPosition: 'top' | 'bottom' | null = null;
  let consecutiveCount = 0;

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

  const resetGame = () => {
    setGameStarted(false); // Reset gameStarted to false for the start screen
    setSp01Position('bottom');
    setBoias([]);
    setGameOver(false);
    setPaused(false);
    setScore(0);
    setBoiaSpeed(50);
    setSpawnSpeed(1000);
  };

  const spawnBoia = () => {
    let positionY: 'top' | 'bottom';

    if (lastSpawnPosition && consecutiveCount >= 3) {
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

  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      if (score % 100 === 0) {
        setBoiaSpeed(Math.max(boiaSpeed - 5, 20));
      }
    }
  }, [score, gameStarted, gameOver, paused]);

  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      if (score % 100 === 0) {
        setSpawnSpeed(Math.max(spawnSpeed - 100, 600));
      }
    }
  }, [score, gameStarted, gameOver, paused]);

  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      const interval = setInterval(() => {
        setBoias((prevBoias) =>
          prevBoias.map((boia) => ({ ...boia, positionX: boia.positionX + 10 }))
                  .filter((boia) => boia.positionX < 800)
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

  useEffect(() => {
    if (!paused) {
      const detectCollision = () => {
        boias.forEach((boia) => {
          if (boia.positionX < 675 && boia.positionX > 625 && sp01Position === boia.positionY) {
            setGameOver(true);
          }
        });
      };
      detectCollision();
    }
  }, [boias, sp01Position, paused]);

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
          {gameOver && <div className="game-over">Game Over! Pressione R para reiniciar</div>}
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

//TODO (DESIGN): MAYBE WATER SP01 ANIMATIONST
//TODO (DESIGN): ADD SOUND EFFECTS
