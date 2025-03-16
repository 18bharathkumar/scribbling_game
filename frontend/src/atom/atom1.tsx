import { ScoreBoardType,RoomUser } from '../types/type';
import { atom } from 'jotai';

const defaultScoreBoard: ScoreBoardType = {
    scores: {},
    roundScores: [],
    currentStreak: undefined
  };

// Atom for WebSocket connection
export const ws = atom<WebSocket | null>(null);

// Atom to store the username
export const usernameAtom = atom<string | null>(null);

// Atom to store the room ID
export const roomidAtom = atom<number | null>(null);

// Atom to track if the user is in a room
export const isInRoom = atom<boolean>(false);


export const isGameStarted = atom<boolean>(false);

export const isMyTurn = atom<boolean>(false);

export const guess = atom<string | null>(null);

export const popUpmssg = atom<string |null>(null);

export const currentRound = atom<number>(1);

export const scoreBoard = atom<ScoreBoardType>(defaultScoreBoard);

export const drawer = atom<string>("");

export const word = atom<string>("")

export const isGameOver = atom<boolean>(false);

export const roomUser = atom<RoomUser []>([]);

