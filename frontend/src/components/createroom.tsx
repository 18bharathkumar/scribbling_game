import { ws, isInRoom, usernameAtom, roomidAtom } from "../atom/atom1";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const CreateRoom = () => {
  const setIsInRoom = useSetAtom(isInRoom);
  const [user, setUser] = useAtom(usernameAtom);
  const [avatar, setAvatar] = useState<number>(0);
  const [roomid, setRoomid] = useAtom(roomidAtom);
  const [secret, setSecret] = useState<string | null>(null);

  const socket = useAtomValue(ws); // WebSocket atom

  // Function to handle room creation
  function handleRoomCreate() {
    console.log("room creation");

    const payload = {
      user,
      avatar,
      roomid,
      secret,
    };

    const data = {
      type: "create",
      payload: payload,
    };

    // Sending the room creation request via WebSocket
    socket?.send(JSON.stringify(data));
    console.log("Room creation data sent:", data);
  }

  if (socket) {
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      console.log(message);

      if (message.type === "create_success") {
        const room = message.room;
        setIsInRoom(true);

        console.log("Room creation successful:", room);
      }
      if (message.type === "error") {
        setRoomid(null);
        setUser(null);
      }

      if (message.type === "invaid") {
        alert("Invalid data");
      }

      if (message.type === "exist") {
        alert("Room already exists, change the room ID");
      }
    };
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-lg border border-gray-200">
        <h2 className="text-4xl font-semibold text-center mb-8 text-gray-700">
          Create Room
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Username:
            </label>
            <input
              type="text"
              onChange={(e) => setUser(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Avatar Number:
            </label>
            <input
              type="number"
              onChange={(e) => setAvatar(parseInt(e.target.value))}
              placeholder="Enter avatar number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Room ID:
            </label>
            <input
              type="number"
              onChange={(e) => setRoomid(parseInt(e.target.value))}
              placeholder="Enter room ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Room Secret:
            </label>
            <input
              type="text"
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter room secret"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <button
            onClick={handleRoomCreate}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 shadow-lg mt-4"
          >
            Create Room
          </button>

          {/* Link to navigate to the Join Room page */}
          <p className="text-center mt-6 text-gray-600">
            Already have a room?{" "}
            <Link
              to="/join"
              className="text-indigo-600 font-semibold hover:text-indigo-800 transition-all"
            >
              Join a Room
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
