import React from 'react';
import './Tile.css';
import type { Tile as TileType } from '../lib/gameEngine';

interface TileProps {
  tile: TileType;
}

const Tile: React.FC<TileProps> = ({ tile }) => {
  const { value, x, y, isNew, mergedFrom } = tile;

  const cellSize = 110;
  const gap = 12;
  
  const style = {
    transform: `translate(${x * (cellSize + gap)}px, ${y * (cellSize + gap)}px)`,
    zIndex: mergedFrom ? 9 : 10,
  };

  const classes = [
    'tile',
    `tile-${value}`,
    isNew ? 'tile-new' : '',
    mergedFrom ? 'tile-merged' : '',
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes} 
      style={style}
      role="gridcell"
    >
      <div className="tile-inner">{value}</div>
    </div>
  );
};

export default Tile;

