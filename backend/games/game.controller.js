// games/game.controller.js
import GameSession from './game-session.model.js';
import { createAndEmitNotification } from '../notifications/notification.controller.js';

// ========== GAME CONTROLLERS ==========

// @desc    Invite friend to game
// @route   POST /api/games/invite/:friendId
// @access  Private
export const inviteToGame = async (req, res) => {
  try {
    const { friendId } = req.params;
    const { gameType, channelId, serverId, chatRoomId } = req.body;
    const senderId = req.user._id;

    // Create game session
    const session = await GameSession.create({
      gameType: gameType || 'tic-tac-toe',
      players: [{ user: senderId, role: 'X' }],
      channel: channelId || null,
      server: serverId || null,
      chatRoom: chatRoomId || null,
      status: 'waiting'
    });

    // Create and emit notification for recipient
    await createAndEmitNotification(req.app, {
      recipient: friendId,
      sender: senderId,
      type: 'game_invite',
      content: `${req.user.username} invited you to play ${gameType || 'Tic-Tac-Toe'}`,
      extraData: { sessionId: session._id, gameType: gameType || 'tic-tac-toe' }
    });

    res.status(200).json({
      success: true,
      message: 'Game invitation sent',
      sessionId: session._id
    });

  } catch (error) {
    console.error('Game invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send game invitation'
    });
  }
};

// @desc    Join game session
// @route   POST /api/games/join/:sessionId
// @access  Private
export const joinGame = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await GameSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found'
      });
    }

    // If user is already a player, return current session as success
    if (session.players.some(p => p.user.toString() === userId.toString())) {
      return res.status(200).json({
        success: true,
        message: 'Already in game',
        session
      });
    }

    // Only allow joining when game is waiting
    if (session.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Game already started or finished'
      });
    }

    // Add player
    if (session.gameType === 'tic-tac-toe') {
      // Tic-Tac-Toe: second player joins, start immediately
      session.players.push({ user: userId, role: 'O' });
      session.status = 'in_progress';
      session.gameState = {
        board: Array(9).fill(null),
        nextTurn: session.players[0].user // X starts
      };
    } else if (session.gameType === 'ludo') {
      // Ludo: allow up to 4 players before starting
      const colors = ['red', 'blue', 'green', 'yellow'];
      const assigned = session.players.map(p => p.role);
      const nextColor = colors.find(c => !assigned.includes(c)) || 'red';
      session.players.push({ user: userId, role: nextColor });
      // Stay in waiting state; host will start via socket once 2..4 present
    }

    await session.save();

    // Notify room that game started and provide full session state
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(sessionId.toString()).emit('game_update', session);
      }
    } catch (emitErr) {
      // Non-critical: do not fail the request if socket emit fails
      console.error('Emit player_joined error (non-critical):', emitErr);
    }

    res.status(200).json({
      success: true,
      message: 'Joined game successfully',
      session
    });

  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join game'
    });
  }
};

// @desc    Get game session details
// @route   GET /api/games/:sessionId
// @access  Private
export const getGameSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await GameSession.findById(sessionId)
      .populate('players.user', 'username profile.displayName profile.avatar')
      .populate('winner', 'username profile.displayName profile.avatar');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found'
      });
    }

    res.status(200).json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Get game session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get game session'
    });
  }
};
