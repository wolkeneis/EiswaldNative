import {createSlice} from '@reduxjs/toolkit';

export const roomSlice = createSlice({
  name: 'room',
  initialState: {
    roomId: undefined,
    mode: 'strict',
    host: false,
    users: {},
  },
  reducers: {
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },

    setMode: (state, action) => {
      state.mode = action.payload;
    },

    setHost: (state, action) => {
      state.host = action.payload;
    },

    setUsers: (state, action) => {
      state.users = action.payload;
    },

    clearRoom: state => {
      state.roomId = undefined;
      state.mode = 'strict';
      state.host = false;
      state.users = {};
    },
  },
});

export const {setRoomId, setMode, setHost, setUsers, clearRoom} =
  roomSlice.actions;

export default roomSlice.reducer;
