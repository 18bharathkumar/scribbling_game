import { WebSocket as WsSocket } from "ws"; 
export interface User {
  name: string;
  avatar: number;
  socket: WsSocket | null;
}

export interface ScoreBoard {
  scores: {
    [username: string]: {
      points: number;
      correctGuesses: number;
      drawingsMade: number;
      lastActivity: Date;
    }
  };
  currentStreak?: {
    user: string;
    streak: number;
  };
  roundScores: Array<{
    round: number;
    scores: { [username: string]: number };
  }>;
}

export interface Room {
  id: number;
  secret: string;
  count: number;
  users: User[];
  currentWord?: string;
  currentDrawer?: User;
  currentDrawerIndex?: number;
  isGameStarted: boolean;
  scoreBoard: ScoreBoard;
  currentRound?: number;
  maxRounds?: number;
  roundTimer?: NodeJS.Timeout;
}