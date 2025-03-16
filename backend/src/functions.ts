import { Room,User } from "./interface";
import WebSocket, { WebSocket as WsSocket } from "ws";
import { users,rooms } from "./globel";
import { socketMap } from "./globel";
import { WORDS } from "./globel";


export function handlecreate(
  user: string,
  avatar: number,
  roomid: number,
  secret: string,
  socket: WsSocket
) {
  console.log("createing room");
  
  if (!user || !Number.isInteger(avatar) || !Number.isInteger(roomid) || !secret) {
    socket.send(JSON.stringify({
      type: "invaid",
      message: "Invalid creation parameters"
    }));
    socket.close();
    cleanupDisconnectedUser(socket)
    return;
  }

  // Check for existing room
  const existingRoom = rooms.find(r => r.id === roomid);
  if (existingRoom) {
    socket.send(JSON.stringify({
      type: "exist",
      message: "Room ID already exists"
    }));
    return;
  }


  // Create new user with socket reference
  const newUser: User = {
    name: user,
    avatar: avatar,
    socket: socket // Fixed socket reference
  };

  // Create new room with initial user
  const newRoom: Room = {
    id: roomid,
    secret: secret,
    users: [newUser],
    count: 1,
    currentDrawerIndex: undefined,  
    currentDrawer: undefined, 
    currentWord: undefined,
    isGameStarted: false,
    scoreBoard: {
      scores: {
        [newUser.name]: {
          points: 0,
          correctGuesses: 0,
          drawingsMade: 0,
          lastActivity: new Date()
        }
      },
      currentStreak: undefined,
      roundScores: []
    },
    currentRound: 1,        // Start at round 1
    maxRounds: 4            // Fixed 4-round game
  };
  
  // Update data stores
  rooms.push(newRoom);
  socketMap.set(roomid, [socket]);

  // Send success response with room details
  socket.send(JSON.stringify({
    type: "create_success",
    room: {
      id: newRoom.id,
      userCount: newRoom.count,
      users: newRoom.users.map(u => ({
        name: u.name,
        avatar: u.avatar
      })),
      currentGame: "not_started"
    }
  }));

  console.log(`New room created: ${roomid} by ${user}`);
}

export function handleJoin(
  user: string,
  avatar: number,
  roomid: number,
  secret: string,
  socket: WsSocket
) {
  const room = rooms.find((r) => r.id === roomid);

  // Validate room and secret first
  if (!room || room.secret !== secret) {
    socket.send(
      JSON.stringify({ type: "incorrect", message: "Invalid room or secret" })
    );
    return;
  }

  // Check for existing user in the room
  const existingUser = room.users.find((u) => u.name === user);

  if (existingUser) {
    // Check if it's the same socket connection
    if (existingUser.socket === socket) {
      socket.send(
        JSON.stringify({
          type: "error",
          message: "You are already connected with this socket",
        })
      );
      return;
    }

    // Update to new socket connection
    const oldSocket = existingUser.socket;
    existingUser.socket = socket;

    // Update socket map
    if (socketMap.has(roomid)) {
      const sockets = socketMap.get(roomid)!;
      const oldIndex = oldSocket ? sockets.indexOf(oldSocket) : -1;
      if (oldIndex > -1) {
        sockets.splice(oldIndex, 1);
      }
      // Add new socket if not already present
      if (!sockets.includes(socket)) {
        sockets.push(socket);
      }
    }

    // Close old connection if still open
    if (oldSocket && oldSocket.readyState === WebSocket.OPEN) {
      oldSocket.close();
      cleanupDisconnectedUser(socket);
    }

    socket.send(
      JSON.stringify({
        type: "connection_updated",
        message: "Socket connection refreshed",
      })
    );
    return;
  }

  // If new user
  const newUser = {
    name: user,
    avatar: avatar,
    socket: socket,
  };

  room.users.push(newUser);
  room.count++;

  // Update scoreBoard for new user
  if (!room.scoreBoard.scores[newUser.name]) {
    room.scoreBoard.scores[newUser.name] = {
      points: 0,
      correctGuesses: 0,
      drawingsMade: 0,
      lastActivity: new Date(),
    };
    console.log("new user",newUser.name);
    console.log(room.scoreBoard);
    
    
  }

  // Update socket map
  if (socketMap.has(roomid)) {
    socketMap.get(roomid)!.push(socket);
  } else {
    socketMap.set(roomid, [socket]);
  }

  // Send success response
  socket.send(
    JSON.stringify({
      type: "join_success",
      room: {
        id: room.id,
        userCount: room.count,
        users: room.users.map((u) => ({
          name: u.name,
          avatar: u.avatar,
        })),
        currentGame:
          room.currentDrawerIndex !== undefined
            ? {
                status: "in_progress",
                currentDrawer: room.currentDrawer?.name,
              }
            : "not_started",
        scoreBoard: room.scoreBoard, // Include the updated scoreBoard
      },
    })
  );

  // Notify other users in the room
  broadcastToRoom(
    roomid,
    {
      type: "user_joined",
      users: room.users.map((u) => ({
        name: u.name,
        avatar: u.avatar,
      })),
      userCount: room.count,
      scoreBoard: room.scoreBoard, // Broadcast updated scoreBoard
    }
  );
}

export function handleGameStart(roomid: number, socket: WsSocket) { 
  
  const room = rooms.find((r) => r.id === roomid);
  
  if (!room) {

    socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
    return;
  }

  // Check if game is already running
  if (room.currentDrawerIndex !== undefined) {
    socket.send(
      JSON.stringify({
        type: "started",
        message: "Game is already in progress",
      })
    );
    return;
  }
   
  if (room.count < 2) {
    
    socket.send(
      JSON.stringify({
        type: "less",
        message: "Need at least 2 players to start",
      })
    );
    return;
  }



  // Initialize game state
  room.currentDrawerIndex = 0;
  room.isGameStarted = true;
  startNewRound(room);

  // Notify all players
  broadcastToRoom(roomid, {
    type: "game_started",
    message: "New game has begun!",
    scoreBoard:room.scoreBoard,
  });
}

export function handleGuess(roomid: number, user: string, guess: string, socket: WsSocket) {
  const room = rooms.find((r) => r.id === roomid);
  if (!room || !room.currentWord || !room.currentDrawer) return;

  // Initialize scoreboard if not exists
  if (!room.scoreBoard) {
    room.scoreBoard = {
      scores: {},
      currentStreak: undefined,
      roundScores: []
    };
  }

  if (user === room.currentDrawer.name) {
    sendToSocket(socket, {
      type: "error",
      message: "Drawer cannot guess",
    });
    return;
  }

  if (guess.toLowerCase() === room.currentWord.toLowerCase()) {
    // Update score for guessing user
    if (!room.scoreBoard.scores[user]) {
      room.scoreBoard.scores[user] = {
        points: 0,
        correctGuesses: 0,
        drawingsMade: 0,
        lastActivity: new Date()
      };
    }
    room.scoreBoard.scores[user].points += 100;
    room.scoreBoard.scores[user].correctGuesses++;
    room.scoreBoard.scores[user].lastActivity = new Date();

    // Update current streak
    room.scoreBoard.currentStreak = {
      user,
      streak: (room.scoreBoard.currentStreak?.streak || 0) + 1
    };

    // Store round score
    const currentRound = room.currentRound || 1;
    if (!room.scoreBoard.roundScores[currentRound - 1]) {
      room.scoreBoard.roundScores[currentRound - 1] = {
        round: currentRound,
        scores: {}
      };
    }
    room.scoreBoard.roundScores[currentRound - 1].scores[user] = 
      (room.scoreBoard.roundScores[currentRound - 1].scores[user] || 0) + 100;

    // Round management logic
    room.currentDrawerIndex = (room.currentDrawerIndex || 0) + 1;
    const maxRounds = 4;
    
    broadcastToRoom(roomid, {
      type: "guess_correct",
      user,
      word: room.currentWord,
      points: 100,
      scoreBoard:room.scoreBoard,
      currentRound:room.currentRound
    });

    // Check if all players have drawn in this round
    if (room.currentDrawerIndex >= room.users.length) {
      room.currentRound = (room.currentRound || 0) + 1;
      
      if ((room.currentRound || 0) > maxRounds) {
        endGame(room);
      } else {
        room.currentDrawerIndex = 0;
        setTimeout(() => startNewRound(room), 2000);
      }
    } else {
      setTimeout(() => startNewRound(room), 2000);
    }
  } else {
    broadcastToRoom(roomid, {
      type: "guess_incorrect",
      user,
      guess,
    });
  }
}

function startNewRound(room: Room) {
 
  
  // Reset game state for new round
  room.currentWord = undefined;
  
  // Get next drawer
  const nextDrawerIndex = room.currentDrawerIndex || 0;
  const nextDrawer = room.users[nextDrawerIndex];
 
  // Update drawer information
  room.currentDrawer = nextDrawer;
  
  // Update scoreboard for drawer
  if(nextDrawer){
  if (!room.scoreBoard.scores[nextDrawer.name]) {
    room.scoreBoard.scores[nextDrawer.name] = {
      points: 0,
      correctGuesses: 0,
      drawingsMade: 0,
      lastActivity: new Date()
    };
  }
}
else{
  return;
}
  room.scoreBoard.scores[nextDrawer.name].drawingsMade++;
  room.scoreBoard.scores[nextDrawer.name].lastActivity = new Date();

  // Select new word (implement your word selection logic)
  const newWord = selectRandomWord();
  room.currentWord = newWord;

  broadcastToRoom(room.id, {
    type: "new_round",
    drawer: nextDrawer.name,
    round: room.currentRound || 1,
    maxRounds: 4
  });
  
    handleTimeOut(room, room.currentDrawerIndex??0);
   
  // Send private word to drawer
  sendToSocket(nextDrawer.socket, {
    type: "your_turn",
    word: newWord
  });

 

}

function endGame(room: Room) {
  broadcastToRoom(room.id, {
    type: "game_end",
    scores: room.scoreBoard
  });
  
 
  room.isGameStarted = false;
  room.currentDrawer = undefined;
  room.currentWord = undefined;
  room.currentDrawerIndex = undefined;
  room.currentRound = undefined;

  closesocket(room.id);
}

export function handleDrawing(roomid: number, user:string, data: any,socket:WsSocket) {
    const room = rooms.find((r) => r.id === roomid);
    if (!room || !room.currentDrawer) return;
  
    if (user !== room.currentDrawer.name) {
      sendToSocket(socket, {
        type: "error",
        message: "Only drawer can draw",
      });
      return;
    }
  
    broadcastToRoom(
      roomid,
      {
        type: "draw_data",
        data,
        drawer: user,
      },
      true
    );
  }


  export function broadcastToRoom(roomid: number, message: any, excludeDrawer = false) {
    const room = rooms.find((r) => r.id === roomid);
    if (!room) return;
  
    room.users.forEach((user) => {
      if (user.socket && (!excludeDrawer || user !== room.currentDrawer)) {
        user.socket.send(JSON.stringify(message));
      }
    });
  }

  export function sendToSocket(socket: WsSocket | null, message: any) {
    if (socket) socket.send(JSON.stringify(message));
  }

  export function cleanupDisconnectedUser(socket: WsSocket) {
    let userRoom: { room: Room; userIndex: number } | undefined;
  
    // Find which room the disconnected socket belongs to
    for (const room of rooms) {
      const userIndex = room.users.findIndex(u => u.socket === socket);
      if (userIndex !== -1) {
        userRoom = { room, userIndex };
        break;
      }
    }
  
    if (!userRoom) return;
  
    // Remove user from the room
    const [disconnectedUser] = userRoom.room.users.splice(userRoom.userIndex, 1);
    userRoom.room.count--;
  
    // Update socket map for the room
    if (socketMap.has(userRoom.room.id)) {
      const roomSockets = socketMap.get(userRoom.room.id)!;
      const socketIndex = roomSockets.indexOf(socket);
      if (socketIndex !== -1) {
        roomSockets.splice(socketIndex, 1);
        if (roomSockets.length === 0) {
          socketMap.delete(userRoom.room.id);
        }
      }
    }
  
    // Check if room should be deleted
    if (userRoom.room.count === 0) {
      const roomIndex = rooms.findIndex(r => r.id === userRoom!.room.id);
      if (roomIndex !== -1) {
        rooms.splice(roomIndex, 1);
      }
      console.log(`Room ${userRoom.room.id} deleted due to being empty`);
    } else {
      // Notify remaining users about the disconnection
      broadcastToRoom(
        userRoom.room.id,
        {
          type: "user_left",
          userName: disconnectedUser.name,
          userCount: userRoom.room.count
        },
        true // Exclude the disconnected socket (which is already closed)
      );
    }
  }
  
  export function closesocket(roomid:number){
    const room = rooms.find((r) => r.id === roomid);
    if (!room) return;

    room.users.forEach((user)=>{
        user.socket?.close();
    })


}

function selectRandomWord(){
  const index = Math.floor(Math.random() * WORDS.length);
  return WORDS[index];
}

function handleTimeOut(room: Room, drawIndex: number) {
  setTimeout(() => {
   
    if (
      room.currentDrawerIndex === drawIndex) {
      // Move to next player using modulo to wrap around
      const nextIndex = (drawIndex + 1) % room.users.length;

      if(room.users.length <=1){
        endGame(room);
      }
      
     
      room.currentDrawerIndex = nextIndex;
      
      broadcastToRoom(room.id, { type: "time_out" });

      console.log("current round ",room.currentRound);

      console.log("drawer index",room.currentDrawerIndex);
      
      console.log("time out");
      
      
      
      if (room.currentDrawerIndex >= room.users.length-1) {
        room.currentRound = (room.currentRound || 0) + 1;
        
        if ((room.currentRound || 0) >= 4) {
          endGame(room);
          return;
        } 
      }
     
      startNewRound(room);
    }
   
    
  }, 60000);
}
