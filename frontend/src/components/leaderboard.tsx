import { scoreBoard,currentRound } from "../atom/atom1";
import { useAtomValue,useAtom } from "jotai";
import { ScoreBoardType } from '../types/type';
const Leaderboard = () => {
  const defaultScoreBoard: ScoreBoardType = {
    scores: {},
    roundScores: [],
    currentStreak: undefined
  };
  const [ScoreBoard,setScoreBoard] = useAtom(scoreBoard);
  const CurrentRound = useAtomValue(currentRound);

  
  // Add a check to ensure ScoreBoard is defined before proceeding
  if (!ScoreBoard || !ScoreBoard.scores) {
    setScoreBoard(defaultScoreBoard);
    return <div>Loading Leaderboard...</div>; // Handle loading or undefined state
  }

  // Sort players by points descending
  const sortedPlayers = Object.entries(ScoreBoard.scores).sort(
    ([, a], [, b]) => b.points - a.points
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl mx-auto">
      {/* Current Round & Streak */}
      <div className="mb-6 flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
          {currentRound && (
            <p className="text-gray-600">
              Round {CurrentRound} of {4}
            </p>
          )}
        </div>
        {ScoreBoard.currentStreak && (
          <div className="bg-yellow-100 p-3 rounded-lg">
            <span className="font-semibold text-yellow-800">
              🔥 {ScoreBoard.currentStreak.user} is on a {ScoreBoard.currentStreak.streak}-guess streak!
            </span>
          </div>
        )}
      </div>

      {/* Main Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left pb-3">Player</th>
              <th className="text-right pb-3">Points</th>
              <th className="text-right pb-3">Correct</th>
              <th className="text-right pb-3">Drawings</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map(([username, stats]) => (
              <tr key={username} className="border-b border-gray-100">
                <td className="py-3 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">
                      {stats.points}
                    </span>
                  </div>
                  {username}
                </td>
                <td className="text-right py-3 font-medium">{stats.points}</td>
                <td className="text-right py-3 text-green-600">
                  {stats.correctGuesses}
                </td>
                <td className="text-right py-3">{stats.drawingsMade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Round Breakdown */}
      {ScoreBoard.roundScores.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Round Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {ScoreBoard.roundScores.map((round: { round: number; scores: Record<string, number> }) => (
              <div key={round.round} className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium mb-2">Round {round.round}</div>
                {Object.entries(round.scores).map(([user, points]: [string, number]) => (
                  <div key={user} className="flex justify-between text-sm">
                    <span>{user}</span>
                    <span className="font-medium">+{points}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;