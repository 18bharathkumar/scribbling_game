
  
  // ScoreBoard Interface
  export interface ScoreBoardType {
    scores: {
      [username: string]: {     // Key: username
        points: number;         // Total accumulated points
        correctGuesses: number; // Number of correct guesses made
        drawingsMade: number;   // Number of drawings created
        lastActivity: Date;     // Last interaction timestamp
      }
    };
    currentStreak?: {           // Current correct guess streak
      user: string;             // Username with streak
      streak: number;           // Consecutive correct guesses
    };
    roundScores: Array<{        // Historical round data
      round: number;            // Round number (1-4)
      scores: {                 // Points earned in this round
        [username: string]: number 
      }
    }>;
  }

  export interface RoomUser{
    name:string,
    avatar:number
  }