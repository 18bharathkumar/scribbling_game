import { guess } from "../atom/atom1";
import { useAtomValue } from "jotai";

const DisplayMssg = () => {
  const mssg = useAtomValue(guess);
  
  return (
   
      <div className="text-gray-800 text-sm font-medium overflow-hidden break-words ">
        {mssg ? mssg : "No guesses yet"}
      </div>
   
  )
}

export default DisplayMssg;