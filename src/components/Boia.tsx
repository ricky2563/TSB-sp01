import React, { useState, useEffect } from 'react';
import {
  BUOY_MAX_POSITION_X,
  INITIAL_BUOY_SPEED,
  MIN_BUOY_SPEED,
  MIN_SPAWN_SPEED,
  INITIAL_SPAWN_SPEED,
  SPAWN_NUMBER_THRESHOLD,
  BUOY_MOVE_DISTANCE
} from '../utils/constants'
import './Boia.css';

// Interface for the buoy state
interface BoiaState {
  positionX: number;
  positionY: 'top' | 'bottom';
}


export const useBoias = (gameStarted: boolean, gameOver: boolean, paused: boolean) => {
  const [boias, setBoias] = useState<BoiaState[]>([]);
  const [boiaSpeed, setBoiaSpeed] = useState(INITIAL_BUOY_SPEED);
  const [spawnSpeed, setSpawnSpeed] = useState(INITIAL_SPAWN_SPEED);

  let lastSpawnPosition: 'top' | 'bottom' | null = null;
  let consecutiveCount = 0;

  // Spawn a new buoy at either 'top' or 'bottom' position
  const spawnBoia = () => {
    let positionY: 'top' | 'bottom';
    if (lastSpawnPosition && consecutiveCount >= SPAWN_NUMBER_THRESHOLD) {
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

  // Reset function to reset the state of boias and speeds
  const resetBoias = () => {
    setBoias([]); // Clear all existing buoys
    setBoiaSpeed(INITIAL_BUOY_SPEED); // Reset to initial speed
    setSpawnSpeed(INITIAL_SPAWN_SPEED); // Reset to initial spawn speed
  };

  // Update buoy positions at regular intervals
  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      const interval = setInterval(() => {
        setBoias((prevBoias) =>
          prevBoias
            .map((boia) => ({
              ...boia,
              positionX: boia.positionX + BUOY_MOVE_DISTANCE,
            }))
            .filter((boia) => boia.positionX < BUOY_MAX_POSITION_X)
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

  // Speed up buoys based on score (passed from Game component)
  const updateSpeeds = (score: number) => {
    if (score % 100 === 0) {
      setBoiaSpeed(Math.max(boiaSpeed - 5, MIN_BUOY_SPEED));
      setSpawnSpeed(Math.max(spawnSpeed - 100, MIN_SPAWN_SPEED));
    }
  };

  return { boias, spawnBoia, updateSpeeds, resetBoias };
};

// Boia component for rendering individual buoys
const Boia: React.FC<BoiaState> = ({ positionX, positionY }) => (
  <div
    className="boia"
    style={{
      right: `${positionX}px`,
      top: positionY === 'top' ? '40px' : '110px',
    }}
  ></div>
);

export default Boia;
