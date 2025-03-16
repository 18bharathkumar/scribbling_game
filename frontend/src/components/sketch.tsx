import { isMyTurn, ws, roomidAtom, usernameAtom } from "../atom/atom1";
import { useAtomValue } from "jotai";
import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

interface LineData {
  points: number[];
  color: string;
  strokeWidth: number;
}

const Sketch = () => {
  const Myturn = useAtomValue(isMyTurn);
  const socket = useAtomValue(ws);
  const roomid = useAtomValue(roomidAtom);
  const user = useAtomValue(usernameAtom);
  const [lines, setLines] = useState<LineData[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [lastSent, setLastSent] = useState(Date.now());
  const [error, setError] = useState("");
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const { clientWidth, clientHeight } = container;
      setStageSize({ width: clientWidth, height: clientHeight });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    setColor(tool === "eraser" ? "#ffffff" : "#000000");
    setStrokeWidth(tool === "eraser" ? eraserSize : 5);
  }, [tool, eraserSize]);

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setCursorPos({
      x: pos.x,
      y: pos.y,
      visible: tool === "eraser"
    });
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!Myturn || !socket) return;
    
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!stage || !pos) return;

    setDrawing(true);
    const relativeX = pos.x / stage.width();
    const relativeY = pos.y / stage.height();
    
    setLines([...lines, { 
      points: [relativeX, relativeY], 
      color, 
      strokeWidth 
    }]);
  };

  const handleDrawingMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!drawing || !Myturn || !socket) return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!stage || !pos) return;

    const relativeX = pos.x / stage.width();
    const relativeY = pos.y / stage.height();

    setLines(lines => {
      const lastLine = lines[lines.length - 1];
      if (!lastLine) return lines;
      
      const newPoints = [...lastLine.points, relativeX, relativeY];
      const newLines = [...lines.slice(0, -1), { ...lastLine, points: newPoints }];
      
      if (Date.now() - lastSent > 50) {
        sendDrawingData(newLines, "drawing");
        setLastSent(Date.now());
      }
      
      return newLines;
    });
  };

  const handleMouseUp = () => {
    if (!Myturn || !socket) return;
    setDrawing(false);
    sendDrawingData(lines, "finish");
  };

  const sendDrawingData = (lines: LineData[], type: string) => {
    socket?.send(JSON.stringify({
      type: "gamedraw",
      payload: {
        roomid,
        user,
        data: { lines, type, tool, strokeWidth }
      }
    }));
  };

  const handleClear = () => {
    if (!Myturn || !socket) return;
    socket.send(JSON.stringify({
      type: "gamedraw",
      payload: { roomid, user, data: { type: "clear" } }
    }));
    setLines([]);
  };

  const toggleEraser = () => setTool(prev => prev === "pen" ? "eraser" : "pen");
  const increaseEraserSize = () => setEraserSize(prev => Math.min(prev + 5, 50));
  const decreaseEraserSize = () => setEraserSize(prev => Math.max(prev - 5, 5));

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "draw_data") {
          if (message.data.type === "clear") {
            setLines([]);
          } else if (message.drawer !== user) {
            setLines(message.data.lines);
          }
        } else if (message.type === "error") {
          setError(message.message);
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, user]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {Myturn ? "Your Turn - Start Drawing!" : "Waiting for Artist..."}
        </h2>
        <div className="flex gap-2">
          {tool === "pen" ? (
            <button
              onClick={toggleEraser}
              disabled={!Myturn}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              ✖ Eraser
            </button>
          ) : (
            <>
              <button
                onClick={toggleEraser}
                disabled={!Myturn}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                ✎ Pen
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={decreaseEraserSize}
                  disabled={!Myturn}
                  className="px-2 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  -
                </button>
                <span>{eraserSize}</span>
                <button
                  onClick={increaseEraserSize}
                  disabled={!Myturn}
                  className="px-2 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </>
          )}
          <button
            onClick={handleClear}
            disabled={!Myturn}
            className={`px-4 py-2 rounded-lg bg-green-500 text-white ${
              !Myturn ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
            }`}
          >
            Clear
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div 
        className="border-2 border-gray-200 rounded-lg overflow-hidden relative w-full"
        ref={containerRef}
        style={{ touchAction: 'none' }}
      >
        {tool === "eraser" && cursorPos.visible && (
          <div
            className="absolute pointer-events-none rounded-full border-2 border-black"
            style={{
              left: cursorPos.x - eraserSize / 2,
              top: cursorPos.y - eraserSize / 2,
              width: eraserSize + 4,
              height: eraserSize + 4,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              className="w-full h-full rounded-full border-2 border-red-500"
              style={{ backgroundColor: "rgba(255, 0, 0, 0.2)" }}
            />
          </div>
        )}

        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={handleMouseDown}
          onMousemove={(e: KonvaEventObject<MouseEvent>) => {
            handleMouseMove(e);
            handleDrawingMove(e);
          }}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleDrawingMove}
          onTouchEnd={handleMouseUp}
          style={{ cursor: tool === "eraser" ? "none" : "crosshair" }}
        >
          <Layer>
            <Rect 
              width={stageSize.width} 
              height={stageSize.height} 
              fill="#ffffff" 
              listening={false} 
            />
            {lines.map((line: LineData, i: number) => (
              <Line
          key={i}
          points={line.points.flatMap((p: number, index: number) => 
            index % 2 === 0 ? p * stageSize.width : p * stageSize.height
          )}
          stroke={line.color}
          strokeWidth={line.strokeWidth}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          listening={false}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {!socket && (
        <div className="mt-4 text-red-500">
          WebSocket connection is not available.
        </div>
      )}
    </div>
  );
};

export default Sketch;