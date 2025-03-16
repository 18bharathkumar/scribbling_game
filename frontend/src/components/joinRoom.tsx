import { useState } from "react";
import { Link } from "react-router-dom";
import { ws, isInRoom, usernameAtom, roomidAtom, roomUser, scoreBoard } from "../atom/atom1";
import { useSetAtom, useAtomValue, useAtom } from "jotai";

const JoinRoom = () => {
  const [user, setUser] = useAtom(usernameAtom);
  const [avatar, setAvatar] = useState<number>(0);
  const [roomid, setRoomid] = useAtom(roomidAtom);
  const [secret, setSecret] = useState<string | null>(null);
  const setRoomUser = useSetAtom(roomUser);
  const setScoreBoard = useSetAtom(scoreBoard);
  const setRoom = useSetAtom(isInRoom);
  const socket = useAtomValue(ws);
  

  const payload = {
    user,
    avatar,
    roomid,
    secret,
  };

  const data = {
    type: "join",
    payload,
  };

  function joinRoom() {
    socket?.send(JSON.stringify(data));
  }

  if (socket) {
    socket.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log(message);

      if (message.type === "error") {
        console.log("error message", message.message);
        setUser("");
      }

      if (message.type === "connection_updated") {
        setRoom(true);
      }

      if (message.type === "join_success") {
        setRoom(true);
        setRoomUser(message.users);
      }

      if (message.type === "incorrect") {
        alert("Invalid room ID or secret");
      }

      if (message.type === "user_joined") {
        setScoreBoard(message.scoreBoard);
      }
    };
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
          Join Room
        </h2>
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              onChange={(e) => {
                setUser(e.target.value);
              }}
              placeholder="Enter your username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
              Avatar Number
            </label>
            <input
              type="number"
              onChange={(e) => {
                setAvatar(parseInt(e.target.value));
              }}
              placeholder="Enter avatar number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
              Room ID
            </label>
            <input
              type="number"
              onChange={(e) => {
                setRoomid(parseInt(e.target.value));
              }}
              placeholder="Enter room ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
              Room Secret
            </label>
            <input
              type="text"
              onChange={(e) => {
                setSecret(e.target.value);
              }}
              placeholder="Enter room secret"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all"
            />
          </div>

          <button
            onClick={joinRoom}
            className="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition-all"
          >
            Join Room
          </button>

          <p className="text-center mt-6 text-gray-600">
           want to create Room?{" "}
            <Link
              to="/create"
              className="text-indigo-600 font-semibold hover:text-indigo-800 transition-all"
            >
             Create Room
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
