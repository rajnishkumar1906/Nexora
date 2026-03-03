// Chat Controller
import ChatRoom from './chat-room.model.js';

export const getChatList = async (req, res) => {
  try {
    res.json({ message: 'Get chat list endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    res.json({ message: 'Get chat messages endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    res.json({ message: 'Send message endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
