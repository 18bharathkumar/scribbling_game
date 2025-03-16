import { User,Room } from "./interface";
import { WebSocket as WsSocket } from "ws";
export const WORDS = [
    "apple",
    "banana",
    "cherry",
    "dog",
    "cat",
    "house",
    "car", 
    "tree",
  ];

  export const users: User[] = [];
  export const rooms: Room[] = [];
  export const socketMap = new Map<number, WsSocket[]>();
``



  