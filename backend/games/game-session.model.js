// games/game-session.model.js
import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
  gameType: {
    type: String,
    enum: ['tic-tac-toe', 'rock-paper-scissors', 'chess', 'ludo'],
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed', 'cancelled'],
    default: 'waiting'
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: String, // 'X', 'O' for Tic-Tac-Toe
    score: {
      type: Number,
      default: 0
    }
  }],
  gameState: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  moves: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    move: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isDraw: {
    type: Boolean,
    default: false
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    default: null
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    default: null
  },
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    default: null
  }
}, {
  timestamps: true
});

// Index for active games
gameSessionSchema.index({ status: 1, players: 1 });
gameSessionSchema.index({ channel: 1, status: 1 });
gameSessionSchema.index({ chatRoom: 1, status: 1 });

const GameSession = mongoose.model('GameSession', gameSessionSchema);

export default GameSession;
