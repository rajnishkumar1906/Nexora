// Game Socket Handler
import GameSession from '../games/game-session.model.js';

export const setupGameSocket = (io, socket) => {
  // Start Ludo when lobby has 2-4 players
  socket.on('ludo_start', async ({ sessionId }) => {
    try {
      const session = await GameSession.findById(sessionId);
      if (!session) return socket.emit('error', 'Game session not found');
      if (session.gameType !== 'ludo') return socket.emit('error', 'Not a Ludo session');
      const isPlayer = session.players.some(p => p.user.toString() === socket.user._id.toString());
      if (!isPlayer) return socket.emit('error', 'Not a player in this session');
      if (session.status !== 'waiting') return socket.emit('error', 'Game already started');
      if (session.players.length < 2 || session.players.length > 4) {
        return socket.emit('error', 'Ludo needs 2 to 4 players');
      }

      const baseStarts = [0, 13, 26, 39];
      const colors = ['red', 'blue', 'green', 'yellow'];
      const safe = [0, 8, 13, 21, 26, 34, 39, 47];

      const config = { startIndex: {}, homeEntry: {}, safe, boardSize: 52, homeSize: 6, colors: {} };
      session.players.forEach((p, idx) => {
        const start = baseStarts[idx % baseStarts.length];
        config.startIndex[p.user.toString()] = start;
        config.homeEntry[p.user.toString()] = (start + 50) % 52;
        config.colors[p.user.toString()] = colors[idx % colors.length];
      });

      const tokens = {};
      session.players.forEach((p) => {
        tokens[p.user.toString()] = [
          { pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }
        ];
      });

      session.gameState = {
        config,
        tokens,
        finished: Object.fromEntries(session.players.map(p => [p.user.toString(), 0])),
        dice: null,
        nextTurn: session.players[0].user
      };
      session.status = 'in_progress';
      await session.save();
      io.to(sessionId).emit('game_update', session);
    } catch (e) {
      console.error('Ludo start error:', e);
      socket.emit('error', 'Failed to start Ludo');
    }
  });

  socket.on('join_game_session', async (sessionId) => {
    try {
      const session = await GameSession.findById(sessionId);
      if (!session) {
        return socket.emit('error', 'Game session not found');
      }

      const isPlayer = session.players.some(p => p.user.toString() === socket.user._id.toString());
      if (!isPlayer) {
        return socket.emit('error', 'Access denied to this game session');
      }

      socket.join(sessionId);
      console.log(`🎮 Socket ${socket.id} joined game: ${sessionId}`);
    } catch (error) {
      console.error('Join game session error:', error);
      socket.emit('error', 'Failed to join game session');
    }
  });

  socket.on('game_move', async ({ sessionId, move }) => {
    try {
      const session = await GameSession.findById(sessionId);
      if (!session || session.status !== 'in_progress') {
        return socket.emit('error', 'Game is not active');
      }

      const player = session.players.find(p => p.user.toString() === socket.user._id.toString());
      if (!player) {
        return socket.emit('error', 'You are not a player in this game');
      }

      if (session.gameState.nextTurn.toString() !== socket.user._id.toString()) {
        return socket.emit('error', 'Not your turn');
      }

      if (session.gameType === 'tic-tac-toe') {
        const board = session.gameState.board;
        const moveIndex = move.index;

        if (board[moveIndex] !== null) {
          return socket.emit('error', 'Invalid move');
        }

        board[moveIndex] = player.role;
        session.moves.push({ player: socket.user._id, move });

        const winner = checkTicTacToeWinner(board);
        if (winner) {
          session.status = 'completed';
          session.winner = socket.user._id;
          session.gameState.board = board;
          session.gameState.nextTurn = null;
          session.markModified('gameState');
        } else if (board.every(cell => cell !== null)) {
          session.status = 'completed';
          session.isDraw = true;
          session.gameState.board = board;
          session.gameState.nextTurn = null;
          session.markModified('gameState');
        } else {
          const otherPlayer = session.players.find(p => p.user.toString() !== socket.user._id.toString());
          session.gameState.nextTurn = otherPlayer.user;
          session.gameState.board = board;
          session.markModified('gameState');
          console.log(`🔄 Turn switched to: ${otherPlayer.user}`);
        }

        await session.save();
        
        io.to(sessionId).emit('game_update', session);

        if (session.status === 'completed') {
          const resultMessage = session.isDraw 
            ? "Game ended in a draw!" 
            : `${socket.user.username} won the game!`;
          
          if (session.channel) {
            io.to(session.channel.toString()).emit('new_channel_message', {
              channel: session.channel,
              author: { username: 'Game Bot', profile: { displayName: 'Nexora Games', avatar: 'https://ui-avatars.com/api/?name=Game+Bot&background=f59e0b&color=fff' } },
              content: resultMessage,
              createdAt: new Date()
            });
          }
        }
      } else if (session.gameType === 'ludo') {
        const state = session.gameState || {};
        const currentUserId = socket.user._id.toString();
        if (session.gameState.nextTurn.toString() !== currentUserId) {
          return socket.emit('error', 'Not your turn');
        }

        const cfg = state.config || {};
        const boardSize = cfg.boardSize || 52;
        const homeSize = cfg.homeSize || 6;
        const startIndex = cfg.startIndex?.[currentUserId] ?? 0;
        const homeEntry = cfg.homeEntry?.[currentUserId] ?? ((startIndex + 50) % 52);
        const safe = new Set(cfg.safe || []);

        if (move.action === 'roll') {
          const roll = Math.floor(Math.random() * 6) + 1;
          state.dice = roll;
          session.gameState = state;
          await session.save();
          io.to(sessionId).emit('game_update', session);
          return;
        }

        if (move.action === 'move') {
          const tokenIndex = Number(move.tokenIndex || 0);
          if (!Number.isInteger(tokenIndex)) return socket.emit('error', 'Invalid token');
          const tokens = state.tokens?.[currentUserId];
          if (!tokens) return socket.emit('error', 'Token state missing');
          const token = tokens[tokenIndex];
          const roll = state.dice;
          if (!roll) return socket.emit('error', 'Roll the dice first');

          const isHomeLane = (p) => p >= 100 && p <= 100 + (homeSize - 1);

          let capture = false;
          let finishedNow = false;
          let moved = false;

          if (token.pos === -1) {
            if (roll === 6) {
              token.pos = startIndex;
              moved = true;
            }
          } else if (isHomeLane(token.pos)) {
            const dest = token.pos + roll;
            if (dest < 100 + homeSize) {
              token.pos = dest;
              moved = true;
              if (dest === 100 + homeSize - 1) {
                state.finished[currentUserId] = (state.finished[currentUserId] || 0) + 1;
                finishedNow = true;
              }
            }
          } else if (token.pos >= 0 && token.pos < boardSize) {
            // Distance to home entry
            const distToEntry = (homeEntry - token.pos + boardSize) % boardSize;
            if (roll <= distToEntry) {
              // stay on ring
              let dest = (token.pos + roll) % boardSize;
              // Blocking: cannot land on ring cell where opponent has 2+ tokens
              const occupancy = [];
              for (const pid of Object.keys(state.tokens)) {
                const count = (state.tokens[pid] || []).filter(t => t.pos === dest).length;
                if (count > 0) occupancy.push({ pid, count });
              }
              const blocked = occupancy.some(o => o.pid !== currentUserId && o.count >= 2);
              if (blocked) {
                // invalid move
              } else {
                // Capture if not safe
                if (!safe.has(dest)) {
                  for (const pid of Object.keys(state.tokens)) {
                    if (pid !== currentUserId) {
                      (state.tokens[pid] || []).forEach(t => {
                        if (t.pos === dest) {
                          t.pos = -1;
                          capture = true;
                        }
                      });
                    }
                  }
                }
                token.pos = dest;
                moved = true;
              }
            } else {
              // Enter home lane
              const rem = roll - distToEntry - 1;
              const laneDest = 100 + rem;
              if (laneDest <= 100 + (homeSize - 1)) {
                token.pos = laneDest;
                moved = true;
                if (laneDest === 100 + (homeSize - 1)) {
                  state.finished[currentUserId] = (state.finished[currentUserId] || 0) + 1;
                  finishedNow = true;
                }
              }
            }
          }

          if (!moved) {
            // No move possible; advance turn if no move available
            const players = session.players.map(p => p.user.toString());
            const idx = players.indexOf(currentUserId);
            const nextId = players[(idx + 1) % players.length];
            state.dice = null;
            state.nextTurn = nextId;
            session.gameState = state;
            session.markModified('gameState');
            await session.save();
            io.to(sessionId).emit('game_update', session);
            return;
          }

          // Check win condition
          if (finishedNow && (state.finished[currentUserId] || 0) >= 4) {
            session.status = 'completed';
            session.winner = socket.user._id;
          }

          // Next turn logic
          if (session.status !== 'completed') {
            const players = session.players.map(p => p.user.toString());
            const idx = players.indexOf(currentUserId);
            const nextId = (roll === 6 || capture || finishedNow) ? currentUserId : players[(idx + 1) % players.length];
            state.nextTurn = nextId;
          }

          state.dice = null;
          session.gameState = state;
          session.markModified('gameState');
          await session.save();
          io.to(sessionId).emit('game_update', session);
        }
      }
    } catch (error) {
      console.error('Game move error:', error);
      socket.emit('error', 'Failed to process move');
    }
  });

  socket.on('game_rematch', async (sessionId) => {
    try {
      const session = await GameSession.findById(sessionId);
      if (!session) return;

      const otherPlayer = session.players.find(p => p.user.toString() !== socket.user._id.toString());
      if (otherPlayer) {
        io.to(otherPlayer.user.toString()).emit('rematch_request', {
          sessionId,
          senderName: socket.user.username
        });
      }
    } catch (error) {
      console.error('Rematch error:', error);
    }
  });
};

function checkTicTacToeWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}
