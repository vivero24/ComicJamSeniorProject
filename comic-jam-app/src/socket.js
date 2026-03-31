import { io } from 'socket.io-client';
const URL = 'http://localhost:5000';

export const socket = io(URL, { 
    autoConnect: false, // Do not autoconnect to work with Flask sessions, may change if server-side sessions
                        // are successful
    withCredentials: true
});
