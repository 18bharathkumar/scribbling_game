import { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { popUpmssg } from "../atom/atom1";
import Sketch from "./sketch";
import Mssg from "./mssg";
import DisplayMssg from "./displaymssg";
import Leaderboard from "./leaderboard";
import PreMssg from "./parmenentcard";

const Secound = () => {
  const popUp = useAtomValue(popUpmssg);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('sketch');

  useEffect(() => {
    if (popUp) {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [popUp]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      {/* Notification Popup */}
      {showPopup && popUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" onClick={() => setShowPopup(false)} />
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative z-10 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Game Update</h3>
              <button onClick={() => setShowPopup(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600">{popUp}</p>
            <button onClick={() => setShowPopup(false)} className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 font-medium">
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-7xl h-screen flex flex-col">
        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:flex-col lg:gap-4 h-full">
          {/* Top Section - PreMssg */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-sm mb-2 h-[15%] border border-gray-200">
            <PreMssg />
          </div>

          {/* Main Content - 70% height with Toggle */}
          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
            <div className="flex justify-center space-x-6 mb-4">
              <button
                onClick={() => setActiveTab('sketch')}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'sketch' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sketch
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'leaderboard' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Leaderboard
              </button>
            </div>
            <div className="h-[calc(100%-49px)]">
              {activeTab === 'sketch' ? <Sketch /> : <Leaderboard />}
            </div>
          </div>

          {/* Bottom Section - Messages */}
          <div className="sticky bottom-0 z-30 grid grid-cols-2 gap-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-sm h-[15%] border border-gray-200">
            
              <Mssg />

              <DisplayMssg />
            </div>
            
              
            
          
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col h-screen">
          {/* Top Section - PreMssg */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-sm mb-2 h-[15%] border border-gray-200">
            <PreMssg />
          </div>

          {/* Tabs and Content */}
          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 mb-2 h-[70%] overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('sketch')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'sketch' ? 'text-gray-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sketch
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'leaderboard' ? 'text-gray-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Leaderboard
              </button>
            </div>
            <div className="h-[calc(100%-49px)] overflow-auto">
              {activeTab === 'sketch' ? <Sketch /> : <Leaderboard />}
            </div>
          </div>

          {/* Bottom Section - Messages */}
          <div className="grid grid-cols-2 gap-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-sm h-[15%] border border-gray-200">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow border border-gray-200">
              <Mssg />
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow border border-gray-200">
              <DisplayMssg />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Secound;
