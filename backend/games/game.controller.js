// Game Controller
import GameSession from './game-session.model.js';

export const startGame = async (req, res) => {
  try {
    res.json({ message: 'Start game endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinGame = async (req, res) => {
  try {
    res.json({ message: 'Join game endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const makeMove = async (req, res) => {
  try {
    res.json({ message: 'Make move endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGameState = async (req, res) => {
  try {
    res.json({ message: 'Get game state endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
