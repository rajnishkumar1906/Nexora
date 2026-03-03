import axios from './axiosConfig'

export const gameApi = {
  startGame: (channelId, gameType) => axios.post(`/games/start/${channelId}`, { gameType }),
  joinGame: (gameId) => axios.post(`/games/join/${gameId}`),
  makeMove: (gameId, position, move) => axios.post(`/games/move/${gameId}`, { position, move }),
  getGameState: (gameId) => axios.get(`/games/${gameId}`),
  getGameHistory: (channelId) => axios.get(`/games/history/${channelId}`),
  rematch: (gameId) => axios.post(`/games/rematch/${gameId}`),
}