import React, { useState, useEffect } from 'react';
import SP01 from './SP01';
import Boia from './Boia';
import './Game.css';

interface BoiaState {
  positionX: number;
  positionY: 'top' | 'bottom';
}

const Game: React.FC = () => {
  const [sp01Position, setSp01Position] = useState<'top' | 'bottom'>('bottom');
  const [boias, setBoias] = useState<BoiaState[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false); // Add paused state
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [boiaSpeed, setBoiaSpeed] = useState(50); // Speed for boias movement (higher is slower)
  const [spawnSpeed, setSpawnSpeed] = useState(1000); // Initial spawn speed (3 seconds)

  // Function to toggle SP01 position based on key input
  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameOver) {
      if (e.key === 'r' || e.key === 'R') {
        resetGame(); // Call reset function when 'r' is pressed during game over
      }
      return;
    }

    if (e.key === 'Escape') {
      setPaused((prevPaused) => !prevPaused); // Toggle pause state when 'Esc' is pressed
      return;
    }

    if (paused) return; // If paused, ignore further key presses

    if (e.key === ' ') {
      setSp01Position(sp01Position === 'bottom' ? 'top' : 'bottom');
    } else if (e.key === 'ArrowUp' && sp01Position === 'bottom') {
      setSp01Position('top');
    } else if (e.key === 'ArrowDown' && sp01Position === 'top') {
      setSp01Position('bottom');
    }
  };

  // Function to reset the game state
  const resetGame = () => {
    setSp01Position('bottom');
    setBoias([]);
    setGameOver(false);
    setPaused(false);
    setScore(0); // Reset score when restarting
    setBoiaSpeed(50); // Reset boia speed when restarting
    setSpawnSpeed(1000); // Reset spawn speed when restarting
  };

  // Function to spawn a boia in one lane (either top or bottom)
  const spawnBoia = () => {
    setBoias((prevBoias) => {
      const positionY: 'top' | 'bottom' = Math.random() > 0.5 ? 'top' : 'bottom';
      const newBoia: BoiaState = { positionX: -50, positionY };

      /*if (prevBoias.length < 3) {
        return [...prevBoias, newBoia];
      } else {
        return prevBoias;
      }*/
      return [...prevBoias, newBoia];
    });
  };

  // Adjust boia speed based on the score
  useEffect(() => {
    if (!gameOver && !paused) {      
      if (score % 100 == 0){
        const newBoiaSpeed = boiaSpeed - 3; // Increase speed when the score is a multiple of 100
        setBoiaSpeed(newBoiaSpeed); // Set a minimum speed threshold of 20ms
      }
    }
  }, [score, gameOver, paused]);

  // Adjust spawn speed dynamically based on the score
  useEffect(() => {
    if (!gameOver && !paused) {
      if (score % 100 == 0){
        const newSpawnSpeed = Math.max(spawnSpeed - 100, 600); // Faster spawning as the score increases
        setSpawnSpeed(newSpawnSpeed); // Set a minimum spawn interval of 500ms
      }
    }
  }, [score, gameOver, paused]);

  // Move each boia and remove it when it goes off the screen
  useEffect(() => {
    if (!gameOver && !paused) {
      const interval = setInterval(() => {
        setBoias((prevBoias) =>
          prevBoias
            .map((boia) => ({
              ...boia,
              positionX: boia.positionX + 10, // Move boias to the left
            }))
            .filter((boia) => boia.positionX < 800) // Remove boias that go off-screen
        );
      }, boiaSpeed); // Adjust the speed of boia movement based on boiaSpeed

      return () => clearInterval(interval);
    }
  }, [boiaSpeed, gameOver, paused]);

  // Dynamically spawn boias based on the spawnSpeed
  useEffect(() => {
    if (!gameOver && !paused) {
      const spawnInterval = setInterval(spawnBoia, spawnSpeed); // Use dynamic spawn speed

      return () => clearInterval(spawnInterval);
    }
  }, [spawnSpeed, gameOver, paused]);

  // Increase score and check max score
  useEffect(() => {
    if (!gameOver && !paused) {
      const scoreInterval = setInterval(() => {
        setScore((prevScore) => {
          const newScore = prevScore + 1;

          // Check if the score is greater than or equal to maxScore
          if (newScore >= maxScore) {
            setMaxScore(newScore); // Update maxScore dynamically
          }

          return newScore;
        });
      }, 100); // Increase score every 100ms

      return () => clearInterval(scoreInterval);
    }
  }, [gameOver, maxScore, paused]);

  // Detect collision between SP01 and any boia
  useEffect(() => {
    if (!paused) {
      const detectCollision = () => {
        boias.forEach((boia) => {
          if (
            boia.positionX < 675 &&
            boia.positionX > 625 &&
            sp01Position === boia.positionY  //! SEE THIS: Ver sobre coordenada mesmo
          ) {
            setGameOver(true); // End the game on collision
          }
        });
      };
      detectCollision();
    }
  }, [boias, sp01Position, paused]);

  // Key press handler
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sp01Position, gameOver, paused]);

  return (
    <div className="score-border">
      <div className="max-score">High Score: {maxScore}</div> {/* Display the high score */}
      <div className="score">Score: {score}</div> {/* Display the current score */}
      <div className="game-area">
        <SP01 position={sp01Position} />
        {boias.map((boia, index) => (
          <Boia key={index} positionX={boia.positionX} positionY={boia.positionY} />
        ))}
        {gameOver && <div className="game-over">Game Over! Pressione R para reiniciar</div>}

        {/* Show pause menu when the game is paused */}
        {paused && (
          <div className="pause-menu">
            <div className="menu-options">
              <button className="pause-button continue" onClick={() => setPaused(false)}>Continue</button> {/* Continue button */}
              <button className="pause-button reset" onClick={resetGame}>Reset</button> {/* Reset button */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;


//TODO (GAMEPLAY): GAME START SCREEN
//TODO (DESIGN): ALDI IMAGES (BARCO DONE)
//TODO (GAMEPLAY): CHECK SP01 COLLISION
//TODO (DESIGN): MAYBE WATER SP01 ANIMATIONST
//TODO (GAMEPLAY): ADJUST BOIA SPAWN PROBABILITY LANE (QUANTO MAIS DE UM LADO CRESCE A CHANCE DE SPAWNAR DO OUTRO)
