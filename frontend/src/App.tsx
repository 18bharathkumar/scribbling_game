// App.tsx
import { useSetAtom, useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ws, isInRoom, isGameStarted, isGameOver } from './atom/atom1';
import Game from './components/startGame';
import Second from './components/second';
import Leaderboard from './components/leaderboard';
import JoinRoom from './components/joinRoom';
import CreateRoom from './components/createroom';

const App = () => {
  const isEnd = useAtomValue(isGameOver);
  const isGame = useAtomValue(isGameStarted);
  const [inRoom, setIsInRoom] = useAtom(isInRoom);
  const setSocket = useSetAtom(ws);

  useEffect(() => {
    const socket = new WebSocket('ws://playscrubble.duckdns.org');

    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      setIsInRoom(false);
    };

    socket.onerror = (error) => {
      console.log('WebSocket error:', error);
    };

    setSocket(socket);

    return () => {
      socket.close();
    };
  }, [setSocket, setIsInRoom]);

  return (
    <Router>
      {/* Header with title */}
      <header className="bg-gray-600 text-white text-center py-4">
        <h1 className="text-3xl font-bold">Scribbling Game</h1>
      </header>

      {!inRoom ? (
        <Routes>
          <Route path="/" element={<Navigate to="/join" />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/create" element={<CreateRoom />} />
        </Routes>
      ) : !isGame ? (
        <Game />
      ) : isEnd ? (
        <Leaderboard />
      ) : (
        <div className="app-container">
          <Second />
        </div>
      )}
    </Router>
  );
};

export default App;
