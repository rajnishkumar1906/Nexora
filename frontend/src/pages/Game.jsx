import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiX, FiCircle, FiRotateCcw, FiChevronLeft, FiAward, FiMessageSquare } from 'react-icons/fi';
import LudoBoard from '../components/LudoBoard';
import { useNexora } from '../context/NexoraContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const Game = () => {
  const { sessionId } = useParams();
  const { user } = useNexora();
  const { socket } = useSocket();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const joinAttemptedRef = useRef(false);
  const [pendingMove, setPendingMove] = useState(false);
  const navigate = useNavigate();

  // Fetch game session on mount
  useEffect(() => {
    fetchGameSession();
  }, [sessionId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !sessionId) return;

    console.log('Setting up game socket listeners for session:', sessionId);
    
    // Join the game room
    socket.emit('join_game_session', sessionId);

    // Listen for game updates
    socket.on('game_update', (updatedSession) => {
      console.log('Game update received:', updatedSession);
      setSession(updatedSession);
      setPendingMove(false);
      
      if (updatedSession.status === 'completed') {
        if (updatedSession.isDraw) {
          toast('Game ended in a draw!', { icon: '🤝' });
        } else {
          const winnerIdStr = updatedSession.winner ? (updatedSession.winner._id || updatedSession.winner.id || updatedSession.winner).toString() : null;
          const currentUserIdStr = user?._id?.toString() || user?.id?.toString();
          const isWinner = winnerIdStr === currentUserIdStr;
          
          toast(isWinner ? 'You won the game!' : 'Better luck next time!', { 
            icon: isWinner ? '🏆' : '💀' 
          });
        }
      }
    });

    // Listen for player joined events
    socket.on('player_joined', (data) => {
      console.log('Player joined:', data);
      setSession(prev => ({
        ...prev,
        players: data.players,
        status: data.status
      }));
    });

    socket.on('error', (message) => {
      console.error('Socket error:', message);
      toast.error(message);
      setPendingMove(false);
    });

    socket.on('rematch_request', ({ senderName }) => {
      toast((t) => (
        <div className="flex flex-col space-y-2">
          <span className="font-bold">{senderName} wants a rematch!</span>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                handleAcceptRematch();
              }}
              className="bg-primary-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
            >
              Accept
            </button>
            <button 
              onClick={() => toast.dismiss(t.id)} 
              className="bg-primary-100 text-primary-700 px-3 py-1 rounded-lg text-xs font-bold"
            >
              Decline
            </button>
          </div>
        </div>
      ), { duration: 6000 });
    });

    // Cleanup
    return () => {
      socket.off('game_update');
      socket.off('player_joined');
      socket.off('error');
      socket.off('rematch_request');
    };
  }, [sessionId, socket, user._id]);

  // Auto-join if needed (but only once)
  useEffect(() => {
    const joinIfNeeded = async () => {
      // Don't try to join if:
      // - No session loaded
      // - Already attempted to join
      // - Currently joining
      // - No user
      if (!session || joinAttemptedRef.current || joining || !user?._id) return;

      // Check if user is already a player
      const amPlayer = session.players?.some(p => {
        const playerId = p.user?._id || p.user;
        return playerId?.toString() === user._id.toString();
      });

      // Only try to join if game is waiting and user is not a player
      if (session.status === 'waiting' && !amPlayer) {
        joinAttemptedRef.current = true;
        await handleJoinGame();
      }
    };

    joinIfNeeded();
  }, [session, user?._id, joining]);

  const fetchGameSession = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/games/${sessionId}`, { 
        withCredentials: true 
      });
      
      if (data.success) {
        setSession(data.session);
      }
    } catch (error) {
      console.error('Fetch game session error:', error);
      const message = error.response?.data?.message || 'Failed to load game';
      toast.error(message);
      
      // If game not found, redirect after a delay
      if (error.response?.status === 404) {
        setTimeout(() => navigate('/'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (joining) return;
    
    setJoining(true);
    try {
      const { data } = await axios.post(`/api/games/join/${sessionId}`, {}, { 
        withCredentials: true 
      });
      
      if (data.success) {
        setSession(data.session);
        if (socket) {
          socket.emit('join_game_session', sessionId);
        }
        toast.success('Joined game successfully!');
      }
    } catch (error) {
      console.error('Join game error:', error);
      const message = error.response?.data?.message || 'Failed to join game';
      
      // Don't show error for expected states
      if (message !== 'Game already started or finished' && 
          message !== 'You are already in this game') {
        toast.error(message);
      }
    } finally {
      setJoining(false);
    }
  };

  const handleAcceptRematch = async () => {
    try {
      // Create new game session
      const { data } = await axios.post('/api/games/create', {
        gameType: 'tic-tac-toe'
      }, { withCredentials: true });
      
      if (data.success) {
        // Navigate to new game
        navigate(`/game/${data.session._id}`);
      }
    } catch (error) {
      toast.error('Failed to create rematch');
    }
  };

  const handleMove = (index) => {
    if (session?.gameType === 'ludo') {
      if (pendingMove) {
        toast.error('Waiting for server');
        return;
      }
      if (!socket) {
        toast.error('Real-time connection not ready');
        return;
      }
      if (!session || session.status !== 'in_progress') {
        toast.error('Game not active');
        return;
      }
      setPendingMove(true);
      socket.emit('game_move', { sessionId, move: { action: 'move', tokenIndex: index } });
      return;
    }
    if (pendingMove) {
      toast.error('Waiting for server');
      return;
    }
    if (!socket) {
      toast.error('Real-time connection not ready');
      return;
    }
    if (!session) {
      toast.error('Game not loaded yet');
      return;
    }
    if (session.status !== 'in_progress') {
      toast.error('Game has not started yet');
      return;
    }
    
    const board = session.gameState?.board || [];
    if (board[index] !== null) {
      toast.error('Cell already taken');
      return;
    }
    
    const userIdLocal = user?._id || user?.id;
    const userIdLocalStr = userIdLocal ? userIdLocal.toString() : null;
    const nextTurnIdStr = session.gameState?.nextTurn ? (session.gameState.nextTurn._id || session.gameState.nextTurn.id || session.gameState.nextTurn).toString() : null;
    
    const myTurn = nextTurnIdStr && userIdLocalStr && nextTurnIdStr === userIdLocalStr;
    if (!myTurn) {
      toast.error("It's not your turn");
      return;
    }

    const role = myPlayer?.role;
    if (!role) {
      toast.error('Role not determined');
      return;
    }

    setSession(prev => {
      const currentBoard = prev.gameState?.board || Array(9).fill(null);
      const newBoard = [...currentBoard];
      newBoard[index] = role;
      const opponent = prev.players?.find(p => {
        const pid = p.user?._id ?? p.user;
        return pid && String(pid) !== String(userIdLocal);
      });
      const nextTurnLocal = opponent?.user?._id ?? opponent?.user;
      return {
        ...prev,
        gameState: {
          ...prev.gameState,
          board: newBoard,
          nextTurn: nextTurnLocal
        }
      };
    });

    setPendingMove(true);
    socket.emit('game_move', { sessionId, move: { index } });
  };

  const handleRematch = () => {
    if (socket) {
      socket.emit('game_rematch', sessionId);
      toast.success('Rematch request sent!');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 glass flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 glass flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4 border border-primary-200">
          <FiX className="text-primary-600 text-4xl" />
        </div>
        <h1 className="text-3xl font-black text-dark-600 mb-2">Game Not Found</h1>
        <p className="text-dark-400">The game session you are looking for doesn't exist or has expired.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-6 bg-primary-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-primary-600/20"
        >
          GO HOME
        </button>
      </div>
    );
  }

  const board = session.gameState?.board || Array(9).fill(null);
  const nextTurn = session.gameState?.nextTurn;
  const userId = user?._id || user?.id;
  
  // Normalize IDs to strings for comparison
  const nextTurnIdStr = nextTurn ? (nextTurn._id || nextTurn.id || nextTurn).toString() : null;
  const userIdStr = userId ? userId.toString() : null;
  const isMyTurn = nextTurnIdStr && userIdStr && nextTurnIdStr === userIdStr;
  
  // Safely find players
  const myPlayer = userId 
    ? session.players?.find(p => {
        const playerId = p.user?._id ?? p.user;
        return playerId && String(playerId) === String(userId);
      }) 
    : null;
  
  const otherPlayer = userId 
    ? session.players?.find(p => {
        const playerId = p.user?._id ?? p.user;
        return playerId && String(playerId) !== String(userId);
      }) 
    : null;

  return (
    <div className="flex-1 glass flex flex-col overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30 animate-pulse-gentle"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-primary-300 rounded-full blur-3xl opacity-30 animate-pulse-gentle animation-delay-2000"></div>

      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between glass border-b border-primary-200/70 relative z-10 shadow-2xl">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-primary-100 hover:bg-primary-200 rounded-xl text-dark-400 hover:text-primary-600 transition-all"
          >
            <FiChevronLeft size={20} />
          </button>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-dark-600 tracking-tighter italic">
              {session.gameType === 'ludo' ? 'LUDO' : 'TIC-TAC-TOE'}
            </h1>
            <span className="text-[10px] font-black text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full border border-primary-200">
              {session.status === 'waiting' ? 'WAITING' : 'LIVE'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center -space-x-2">
            {myPlayer?.user?.profile?.avatar ? (
              <img 
                src={myPlayer.user.profile.avatar} 
                alt="You"
                className="w-8 h-8 rounded-full border-2 border-white ring-2 ring-primary-500/50" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white ring-2 ring-primary-500/50 flex items-center justify-center text-xs font-bold">
                You
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-[10px] font-bold text-primary-700 relative z-10 border-2 border-white">
              VS
            </div>
            {otherPlayer?.user?.profile?.avatar ? (
              <img 
                src={otherPlayer.user.profile.avatar} 
                alt={otherPlayer.user.username}
                className="w-8 h-8 rounded-full border-2 border-white" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-bold">
                ?
              </div>
            )}
          </div>
          <button className="p-2 text-dark-400 hover:text-primary-600 transition-colors bg-primary-100 rounded-xl hover:bg-primary-200 shadow-lg">
            <FiMessageSquare size={20} />
          </button>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-lg">
          {session.status === 'waiting' && !myPlayer && (
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-dark-600 mb-3">Waiting for opponent to join</h2>
              <button
                onClick={handleJoinGame}
                disabled={joining}
                className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-primary-600/20"
              >
                {joining ? 'JOINING...' : 'JOIN GAME'}
              </button>
            </div>
          )}
          
          {session.gameType === 'ludo' && session.status === 'waiting' && myPlayer && session.players?.length >= 2 && (
            <div className="text-center mb-10">
              <h3 className="text-sm text-dark-400 mb-2">
                Players joined: {session.players?.length}/4
              </h3>
              <button
                onClick={() => socket?.emit('ludo_start', { sessionId })}
                className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-primary-600/20"
              >
                START LUDO
              </button>
            </div>
          )}
          
          {/* Turn/Status Banner */}
          <div className="text-center mb-10">
            {session.status === 'completed' ? (
              <div className="animate-bounce">
                <FiAward className="text-primary-600 text-5xl mx-auto mb-2" />
                <h2 className="text-3xl font-black text-dark-600 tracking-tight uppercase italic">
                  {session.isDraw ? "It's a Draw!" : (() => {
                    const winnerId = session.winner?._id || session.winner?.id || session.winner;
                    const userId = user?._id || user?.id;
                    return (winnerId && userId && String(winnerId) === String(userId)) ? "Victory!" : "Defeat!";
                  })()}
                </h2>
              </div>
            ) : session.status === 'waiting' ? (
              <div className="p-4 rounded-3xl border bg-primary-50 border-primary-200 text-dark-400">
                <h2 className="text-2xl font-black tracking-widest uppercase italic">
                  Waiting for Players
                </h2>
                <p className="text-xs font-bold opacity-60 tracking-widest mt-1">
                  {session.players?.length || 0}/2 players joined
                </p>
              </div>
            ) : (
              <div className={`p-4 rounded-3xl border transition-all duration-500 ${
                isMyTurn 
                  ? 'bg-primary-100 border-primary-300 text-primary-700' 
                  : 'bg-primary-50 border-primary-200 text-dark-400'
              }`}>
                <h2 className="text-2xl font-black tracking-widest uppercase italic animate-pulse">
                  {isMyTurn ? "Your Turn" : "Opponent's Turn"}
                </h2>
                <p className="text-xs font-bold opacity-60 tracking-widest mt-1">
                  Playing as <span className="text-primary-600">{myPlayer?.role || '?'}</span>
                </p>
              </div>
            )}
          </div>

          {session.gameType === 'ludo' ? (
            <LudoBoard
              session={session}
              userId={user}
              pendingMove={pendingMove}
              onRoll={() => {
                if (!socket || pendingMove) return;
                setPendingMove(true);
                socket.emit('game_move', { sessionId, move: { action: 'roll' } });
              }}
              onMoveToken={(idx) => {
                if (!socket || pendingMove) return;
                setPendingMove(true);
                socket.emit('game_move', { sessionId, move: { action: 'move', tokenIndex: idx } });
              }}
            />
          ) : (
            <div className="grid grid-cols-3 gap-4 bg-primary-50 p-4 rounded-[40px] border border-primary-200 shadow-2xl backdrop-blur-sm">
              {board.map((cell, index) => (
                <button
                  key={index}
                  disabled={cell !== null || !isMyTurn || session.status !== 'in_progress' || !myPlayer}
                  onClick={() => handleMove(index)}
                  className={`aspect-square rounded-[32px] flex items-center justify-center text-5xl transition-all duration-300 relative group overflow-hidden
                    ${cell === null && isMyTurn && session.status === 'in_progress' ? 'hover:bg-primary-100 cursor-pointer' : 'cursor-default'}
                    ${cell === 'X' ? 'bg-primary-100 text-primary-600' : ''}
                    ${cell === 'O' ? 'bg-primary-200 text-primary-700' : ''}
                    ${cell === null ? 'bg-white' : ''}
                  `}
                >
                  {cell === 'X' && <FiX className="animate-in zoom-in duration-300" />}
                  {cell === 'O' && <FiCircle className="animate-in zoom-in duration-300" />}
                  {cell === null && isMyTurn && session.status === 'in_progress' && myPlayer && (
                    <span className="opacity-0 group-hover:opacity-20 text-primary-600 transition-opacity">
                      {myPlayer.role}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Footer Controls */}
          {session.status === 'completed' && (
            <div className="mt-12 flex justify-center space-x-4">
              <button 
                onClick={handleRematch}
                className="bg-primary-100 hover:bg-primary-200 text-dark-600 px-8 py-4 rounded-2xl font-black text-xs border border-primary-200 transition-all flex items-center space-x-2 shadow-xl"
              >
                <FiRotateCcw size={18} />
                <span>REMATCH</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Game;
