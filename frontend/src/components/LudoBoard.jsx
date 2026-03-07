import React from 'react';

function LudoBoard({ session, userId, onRoll, onMoveToken, pendingMove }) {
  const state = session?.gameState || {};
  const cfg = state.config || {};
  const size = 600;
  const tokenR = 18;
  const pathWidth = 40;
  const startX = 50;
  const startY = 50;
  const boardSize = 500;

  const playerIds = session.players?.map(p => (p.user?._id || p.user)?.toString()) || [];
  const myId = (userId?._id || userId?.id || userId)?.toString();
  const isMyTurn = String(state.nextTurn?._id || state.nextTurn || '') === String(myId || '');

  const myTokens = state.tokens?.[String(myId || '')] || [];
  const canMove = (idx) => Boolean(isMyTurn && state.dice && !pendingMove && myTokens[idx]);

  // Color mapping
  const getPlayerColor = (pid) => {
    const colorMap = {
      [playerIds[0]]: '#E74C3C', // Red
      [playerIds[1]]: '#2ECC71', // Green
      [playerIds[2]]: '#F1C40F', // Yellow
      [playerIds[3]]: '#3498DB'  // Blue
    };
    return colorMap[pid] || '#95A5A6';
  };

  // Position mapping for classic Ludo
  const getPathPosition = (pos) => {
    if (pos < 0) return null;
    
    // Classic Ludo path coordinates (52 positions)
    const pathCoords = [
      // Bottom row (Red start area)
      { x: 4, y: 12 }, { x: 5, y: 12 }, { x: 6, y: 12 }, { x: 7, y: 12 }, { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 },
      // Right column
      { x: 10, y: 11 }, { x: 10, y: 10 }, { x: 10, y: 9 }, { x: 10, y: 8 }, { x: 10, y: 7 }, { x: 10, y: 6 }, { x: 10, y: 5 }, { x: 10, y: 4 },
      // Top row (Yellow area)
      { x: 9, y: 4 }, { x: 8, y: 4 }, { x: 7, y: 4 }, { x: 6, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 4 }, { x: 3, y: 4 },
      // Left column
      { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 }, { x: 3, y: 8 }, { x: 3, y: 9 }, { x: 3, y: 10 }, { x: 3, y: 11 }, { x: 3, y: 12 },
      // Continue for remaining positions...
    ];

    // Generate remaining positions
    for (let i = pathCoords.length; i < 52; i++) {
      const baseIndex = i % pathCoords.length;
      const base = pathCoords[baseIndex];
      pathCoords[i] = { ...base };
    }

    const coord = pathCoords[pos] || pathCoords[0];
    return {
      x: startX + coord.x * pathWidth + pathWidth/2,
      y: startY + coord.y * pathWidth + pathWidth/2
    };
  };

  const getYardPosition = (pid, idx) => {
    const col = getPlayerColor(pid);
    let baseX, baseY;

    // Position yards in corners
    if (col === '#E74C3C') { // Red - bottom left
      baseX = startX + pathWidth * 2;
      baseY = startY + pathWidth * 10;
    } else if (col === '#2ECC71') { // Green - top left
      baseX = startX + pathWidth * 2;
      baseY = startY + pathWidth * 2;
    } else if (col === '#F1C40F') { // Yellow - top right
      baseX = startX + pathWidth * 10;
      baseY = startY + pathWidth * 2;
    } else { // Blue - bottom right
      baseX = startX + pathWidth * 10;
      baseY = startY + pathWidth * 10;
    }

    // Arrange in 2x2 grid
    const offsets = [
      { dx: -15, dy: -15 },
      { dx: 15, dy: -15 },
      { dx: -15, dy: 15 },
      { dx: 15, dy: 15 },
    ];

    return {
      x: baseX + offsets[idx].dx,
      y: baseY + offsets[idx].dy
    };
  };

  const getHomePosition = (pid, homeIdx) => {
    const col = getPlayerColor(pid);
    
    if (col === '#E74C3C') { // Red - center to bottom (one cell below)
      return {
        x: startX + pathWidth * 7,
        y: startY + pathWidth * (9 + homeIdx)
      };
    } else if (col === '#2ECC71') { // Green - center to left
      return {
        x: startX + pathWidth * (5 - homeIdx),
        y: startY + pathWidth * 7
      };
    } else if (col === '#F1C40F') { // Yellow - center to top
      return {
        x: startX + pathWidth * 7,
        y: startY + pathWidth * (5 - homeIdx)
      };
    } else { // Blue - center to right (one cell right)
      return {
        x: startX + pathWidth * (9 + homeIdx),
        y: startY + pathWidth * 7
      };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: boardSize + 100, height: boardSize + 100 }}>
        <svg width={boardSize + 100} height={boardSize + 100}>
          {/* Wooden board background */}
          <rect
            x={startX - 10}
            y={startY - 10}
            width={boardSize + 20}
            height={boardSize + 20}
            fill="#8B4513"
            rx="20"
            ry="20"
          />
          
          {/* Main board */}
          <rect
            x={startX}
            y={startY}
            width={boardSize}
            height={boardSize}
            fill="#FDF5E6"
            rx="16"
            ry="16"
          />

          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => (
            <line
              key={`vline-${i}`}
              x1={startX + i * pathWidth}
              y1={startY}
              x2={startX + i * pathWidth}
              y2={startY + boardSize}
              stroke="#DEB887"
              strokeWidth="1"
            />
          ))}
          
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => (
            <line
              key={`hline-${i}`}
              x1={startX}
              y1={startY + i * pathWidth}
              x2={startX + boardSize}
              y2={startY + i * pathWidth}
              stroke="#DEB887"
              strokeWidth="1"
            />
          ))}

          {/* Colored houses */}
          {/* Red house (bottom-left) */}
          <rect
            x={startX + pathWidth}
            y={startY + pathWidth * 9}
            width={pathWidth * 4}
            height={pathWidth * 4}
            fill="#E74C3C20"
            stroke="#E74C3C"
            strokeWidth="3"
            rx="8"
            ry="8"
          />
          
          {/* Green house (top-left) */}
          <rect
            x={startX + pathWidth}
            y={startY + pathWidth}
            width={pathWidth * 4}
            height={pathWidth * 4}
            fill="#2ECC7120"
            stroke="#2ECC71"
            strokeWidth="3"
            rx="8"
            ry="8"
          />
          
          {/* Yellow house (top-right) */}
          <rect
            x={startX + pathWidth * 9}
            y={startY + pathWidth}
            width={pathWidth * 4}
            height={pathWidth * 4}
            fill="#F1C40F20"
            stroke="#F1C40F"
            strokeWidth="3"
            rx="8"
            ry="8"
          />
          
          {/* Blue house (bottom-right) */}
          <rect
            x={startX + pathWidth * 9}
            y={startY + pathWidth * 9}
            width={pathWidth * 4}
            height={pathWidth * 4}
            fill="#3498DB20"
            stroke="#3498DB"
            strokeWidth="3"
            rx="8"
            ry="8"
          />

          {/* Home paths */}
          {/* Red home (vertical - one cell below center) */}
          <rect
            x={startX + pathWidth * 6}
            y={startY + pathWidth * 9}
            width={pathWidth * 3}
            height={pathWidth * 4}
            fill="#E74C3C15"
            stroke="#E74C3C"
            strokeWidth="2"
            strokeDasharray="5 3"
            rx="4"
            ry="4"
          />
          
          {/* Green home (horizontal) */}
          <rect
            x={startX + pathWidth * 2}
            y={startY + pathWidth * 6}
            width={pathWidth * 4}
            height={pathWidth * 3}
            fill="#2ECC7115"
            stroke="#2ECC71"
            strokeWidth="2"
            strokeDasharray="5 3"
            rx="4"
            ry="4"
          />
          
          {/* Yellow home (vertical) */}
          <rect
            x={startX + pathWidth * 6}
            y={startY + pathWidth * 2}
            width={pathWidth * 3}
            height={pathWidth * 4}
            fill="#F1C40F15"
            stroke="#F1C40F"
            strokeWidth="2"
            strokeDasharray="5 3"
            rx="4"
            ry="4"
          />
          
          {/* Blue home (horizontal - one cell right of center) */}
          <rect
            x={startX + pathWidth * 9}
            y={startY + pathWidth * 6}
            width={pathWidth * 4}
            height={pathWidth * 3}
            fill="#3498DB15"
            stroke="#3498DB"
            strokeWidth="2"
            strokeDasharray="5 3"
            rx="4"
            ry="4"
          />

          {/* Center area */}
          <rect
            x={startX + pathWidth * 6}
            y={startY + pathWidth * 6}
            width={pathWidth * 3}
            height={pathWidth * 3}
            fill="#FDF5E6"
            stroke="#DEB887"
            strokeWidth="2"
          />

          {/* Center star */}
          <polygon
            points={`${startX + pathWidth * 7.5},${startY + pathWidth * 6.5} ${startX + pathWidth * 8.5},${startY + pathWidth * 7.5} ${startX + pathWidth * 7.5},${startY + pathWidth * 8.5} ${startX + pathWidth * 6.5},${startY + pathWidth * 7.5}`}
            fill="#FBBF24"
            stroke="#B45309"
            strokeWidth="3"
          />
          
          <circle
            cx={startX + pathWidth * 7.5}
            cy={startY + pathWidth * 7.5}
            r="12"
            fill="#FBBF24"
            stroke="#B45309"
            strokeWidth="2"
          />

          {/* Path markers (small circles) */}
          {[...Array(52)].map((_, i) => {
            const pos = getPathPosition(i);
            if (pos) {
              return (
                <circle
                  key={`path-${i}`}
                  cx={pos.x}
                  cy={pos.y}
                  r="6"
                  fill="#CD853F"
                  fillOpacity="0.3"
                  stroke="#8B4513"
                  strokeWidth="1"
                />
              );
            }
            return null;
          })}

          {/* Safe spots (stars) */}
          {[8, 13, 21, 26, 34, 39, 47, 52].map(pos => {
            const coords = getPathPosition(pos - 1);
            if (coords) {
              return (
                <polygon
                  key={`safe-${pos}`}
                  points={`${coords.x},${coords.y - 8} ${coords.x + 5},${coords.y - 2} ${coords.x + 8},${coords.y + 2} ${coords.x + 2},${coords.y + 5} ${coords.x - 2},${coords.y + 5} ${coords.x - 8},${coords.y + 2} ${coords.x - 5},${coords.y - 2}`}
                  fill="#FFD700"
                  stroke="#B45309"
                  strokeWidth="1.5"
                />
              );
            }
            return null;
          })}

          {/* Tokens */}
          {playerIds.map((pid) => {
            const tokens = state.tokens?.[pid] || [];
            const color = getPlayerColor(pid);
            
            return tokens.map((token, idx) => {
              let pos;
              if (token.pos === -1) {
                pos = getYardPosition(pid, idx);
              } else if (token.pos >= 0 && token.pos < 52) {
                pos = getPathPosition(token.pos);
              } else if (token.pos >= 100) {
                pos = getHomePosition(pid, token.pos - 100);
              }

              if (!pos) return null;

              const isMine = pid === myId;
              const clickHandler = isMine && canMove(idx) ? () => onMoveToken(idx) : undefined;

              return (
                <g key={`${pid}-${idx}`}>
                  {/* Token shadow */}
                  <circle
                    cx={pos.x + 3}
                    cy={pos.y + 3}
                    r={tokenR}
                    fill="rgba(0,0,0,0.2)"
                  />
                  {/* Token body */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={tokenR}
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    style={{ cursor: clickHandler ? 'pointer' : 'default' }}
                    onClick={clickHandler}
                  />
                  {/* Token highlight */}
                  <circle
                    cx={pos.x - 5}
                    cy={pos.y - 5}
                    r="5"
                    fill="white"
                    fillOpacity="0.4"
                  />
                  {/* Token number */}
                  <text
                    x={pos.x}
                    y={pos.y + 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {idx + 1}
                  </text>
                </g>
              );
            });
          })}
        </svg>

        {/* Game controls overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 min-w-[120px]">
          <div className="text-xs font-bold text-gray-500 mb-1">DICE</div>
          <div className="text-5xl font-black text-center text-primary-600">
            {state.dice || '🎲'}
          </div>
        </div>

        <button
          disabled={!isMyTurn || session.status !== 'in_progress' || state.dice || pendingMove}
          onClick={onRoll}
          className="absolute top-4 right-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-black text-sm shadow-xl transition-all transform hover:scale-105"
        >
          ROLL DICE
        </button>

        {isMyTurn && !state.dice && session.status === 'in_progress' && (
          <div className="absolute bottom-4 left-4 bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-xl animate-bounce">
            Your Turn! Roll the dice 🎲
          </div>
        )}

        {/* Player indicators */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {playerIds.map((pid, index) => {
            const color = getPlayerColor(pid);
            const isActive = String(state.nextTurn?._id || state.nextTurn) === pid;
            return (
              <div
                key={pid}
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: color,
                  boxShadow: isActive ? `0 0 10px ${color}` : 'none',
                  opacity: isActive ? 1 : 0.5
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LudoBoard;