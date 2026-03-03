import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema(
  {
    gameType: { type: String, enum: ['tictactoe'], required: true },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    players: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      symbol: String,
    }],
    board: { type: [String], default: ['', '', '', '', '', '', '', '', ''] },
    status: {
      type: String,
      enum: ['waiting', 'active', 'completed'],
      default: 'waiting',
    },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export default mongoose.model('GameSession', gameSessionSchema);
