import React, { useState } from 'react';
import './SP01.css';

interface SP01Props {
  position: 'top' | 'bottom';
}

export const useSP01 = () => {
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const [spacePressed, setSpacePressed] = useState(false);

  const togglePosition = () => {
    setPosition((prevPosition) => (prevPosition === 'bottom' ? 'top' : 'bottom'));
  };

  const setPositionManually = (newPosition: 'top' | 'bottom') => {
    setPosition(newPosition);
  };

  const handleSpacePressed = (pressed: boolean) => {
    setSpacePressed(pressed);
  };

  // Reset function to set boat position and space state to initial values
  const resetSP01 = () => {
    setPosition('bottom');
    setSpacePressed(false);
  };

  return { position, togglePosition, setPositionManually, spacePressed, handleSpacePressed, resetSP01 };
};

const SP01: React.FC<SP01Props> = ({ position }) => {
  return <div className={`sp01 ${position}`}></div>;
};

export default SP01;
