import { ws, isGameStarted, isMyTurn, roomidAtom, popUpmssg, word, drawer, scoreBoard, roomUser } from "../atom/atom1";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import { RoomUser } from "../types/type";
import { useEffect } from "react";
import { useState } from "react";

const Game = () => {
  const roomid = useAtomValue(roomidAtom);
  const socket = useAtomValue(ws);
  const setGame = useSetAtom(isGameStarted);
  const setMyTurn = useSetAtom(isMyTurn);
  const setPopUpMssg = useSetAtom(popUpmssg);
  const setWord = useSetAtom(word);
  const setDrawer = useSetAtom(drawer);
  const setScoreBoard = useSetAtom(scoreBoard);
  const [RoomUser, setRoomUser] = useAtom(roomUser);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (e: MessageEvent) => {
      try {
        const mssg = JSON.parse(e.data);
        
        switch(mssg.type) {
          case "error":
            setError(mssg.message);
            break;
          case "started":
          case "game_started":
            setGame(true);
            setScoreBoard(mssg.scoreBoard);
            break;
          case "your_turn":
            setMyTurn(true);
            setPopUpMssg(`It's your turn! The word is ${mssg.word}`);
            setWord(mssg.word);
            setDrawer("me");
            break;
          case "new_round":
            setPopUpMssg(`Drawer: ${mssg.drawer}`);
            setDrawer(mssg.drawer);
            setWord("You have to guess");
            break;
          case "less":
            setError("Only you are in this room. Please wait for others to join.");
            break;
          case "user_joined":
            setRoomUser(mssg.users);
            setScoreBoard(mssg.scoreBoard);
            setPopUpMssg(`${mssg.user.name} joined the game!`);
            break;
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, setGame, setMyTurn, setPopUpMssg, setWord, setDrawer, setScoreBoard, setRoomUser]);

  function startGame() {
    if (!socket) return;
    
    const payload = { roomid };
    socket.send(JSON.stringify({
      type: "game",
      payload
    }));
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Game Room</h2>
          <p className="text-gray-600 mt-1">Room ID: {roomid}</p>
        </div>
        <button
          onClick={startGame}
          disabled={!socket}
          className={`px-6 py-3 rounded-lg bg-blue-600 text-white font-medium ${
            !socket ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          } transition-colors`}
        >
          Start Game
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="border-2 border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Players ({RoomUser?.length || 0})</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RoomUser?.map((user: RoomUser, index: number) => (
            <div 
              key={index}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <img
                src={`https://api.adorable.io/avatars/285/${user.avatar}.png`}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-blue-200"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-800">{user.name}</p>
              </div>
            </div>
          ))}
        </div>

        {!socket && (
          <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg">
            WebSocket connection is not available. Please refresh the page.
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        Click "Start Game" when all players are ready to begin
      </div>
    </div>
  );
};

export default Game;