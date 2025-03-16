import { word, drawer } from "../atom/atom1";
import { useAtomValue } from "jotai";

const PreMssg = () => {
  const Word = useAtomValue(word);
  const Drawer = useAtomValue(drawer);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="text-lg font-medium p-3 bg-gray-100 rounded-lg border-l-4 border-blue-500 shadow-sm">word : {Word}</div>
      <div className="text-lg font-medium p-3 bg-gray-100 rounded-lg border-l-4 border-blue-500 shadow-sm">Drawer : {Drawer}</div>
    </div>
  );
};

export default PreMssg;
