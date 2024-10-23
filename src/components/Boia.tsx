import React from 'react';
import './Boia.css';

interface BoiaProps {
  positionX: number; // posição horizontal da boia
  positionY: 'top' | 'bottom'; // posição da boia (vertical)
}

const Boia: React.FC<BoiaProps> = ({ positionX, positionY }) => {
  return (
    <div
      className="boia"
      style={{
        right: `${positionX}px`, // Horizontal position
        top: positionY === 'top' ? '40px' : '110px', // Vertical position based on top or bottom
      }}
    ></div>
  );
};

export default Boia;
