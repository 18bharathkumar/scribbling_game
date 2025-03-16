import { isMyTurn, ws, roomidAtom, usernameAtom, guess, popUpmssg, scoreBoard, isGameOver, word, drawer } from "../atom/atom1";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import { useState } from "react";

const Mssg = () => {
  const setEnd = useSetAtom(isGameOver);
  const setguess = useSetAtom(guess);
  const [MyTurn, setMyTurn] = useAtom(isMyTurn);
  const socket = useAtomValue(ws);
  const roomid = useAtomValue(roomidAtom);
  const [mssg, setMssg] = useState("");
  const user = useAtomValue(usernameAtom);
  const setPopUpMssg = useSetAtom(popUpmssg);
  const setScoreboard = useSetAtom(scoreBoard);
  const setWord = useSetAtom(word);
  const setDrawer = useSetAtom(drawer);

  const mssgSubmit = () => {
    if (MyTurn) {
      alert("You can't send a message, you have to draw!");
      return;
    }

    if (socket) {
      const payload = {
        roomid,
        user,
        message: mssg,
      };
      const data = {
        type: "gamechat",
        payload,
      };
      console.log("Guessing the word...");
      console.log(data);

      socket.send(JSON.stringify(data));
    }
  };

  if (socket) {
    socket.onmessage = (e) => {
      const mssg = JSON.parse(e.data);

      if (mssg.type === "error") {
        console.log("Error:", mssg.message);
      }

      if (mssg.type === "guess_incorrect") {
        const guessmssg = `${mssg.guess} by user ${mssg.user}`;
        setguess(guessmssg);
      }

      if (mssg.type === "guess_correct") {
        const guessmssg = `User ${mssg.user} guessed the correct word: ${mssg.word}`;
        if (MyTurn) {
          setMyTurn(false);
        }
        setScoreboard(mssg.scoreBoard);
        setguess(guessmssg);
        setPopUpMssg(guessmssg);
      }

      if (mssg.type === "your_turn") {
        setMyTurn(true);
        const message = `It's your turn! The word is ${mssg.word}`;
        setPopUpMssg(message);
        setWord(mssg.word);
        setDrawer("me");
      }

      if (mssg.type === "new_round") {
        const message = `New round! ${mssg.drawer} will draw now.`;
        setPopUpMssg(message);
        setDrawer(mssg.drawer);
        setWord("You need to guess.");
      }

      if (mssg.type === "game_end") {
        const message = "Game over!";
        setPopUpMssg(message);
        setEnd(true);
      }

      if (mssg.type === "time_out") {
        alert("time out");
        setPopUpMssg("Time out!");
        if (MyTurn) {
          setMyTurn(false);
        }
      }
    };
  }

  return (
    <>
    <div className="flex ">
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <input
          type="text"
          placeholder="Guess the word"
          onChange={(e) => setMssg(e.target.value)}
          className={`flex-grow px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
            MyTurn
              ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
              : 'bg-white border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
          disabled={MyTurn}
        />
        <button
          onClick={mssgSubmit}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            MyTurn
              ? 'bg-gray-400 cursor-not-allowed text-gray-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
          }`}
          disabled={MyTurn}
        >
          Guess
        </button>
      </div>

      {/* {MyTurn && (
        <div className="mt-4 text-center text-yellow-300 text-sm font-medium">
          It's your turn to draw! Others will guess your word.
        </div>
      )} */}

</div>
   
    </>
  );
};

export default Mssg;
