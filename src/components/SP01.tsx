import React from 'react';
import './SP01.css';

interface SP01Props {
  position: 'top' | 'bottom'; 
}

const SP01: React.FC<SP01Props> = ({ position }) => {
  return <div className={`sp01 ${position}`}></div>;
};

export default SP01;
