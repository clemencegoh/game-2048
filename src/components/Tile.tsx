import React from 'react';
import './Tile.css';
import type { Tile as TileType } from '../lib/gameEngine';

interface TileProps {
  tile: TileType;
}

const Tile: React.FC<TileProps> = ({ tile }) => {
  const { value, x, y, isNew, mergedFrom } = tile;

  const style = {
    transform: `translate(calc(${x} * (var(--cell-size) + var(--gap-size))), calc(${y} * (var(--cell-size) + var(--gap-size))))`,
    zIndex: tile.isDeleted ? 8 : (mergedFrom ? 10 : 9),
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

