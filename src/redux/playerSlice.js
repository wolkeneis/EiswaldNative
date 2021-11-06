import {createSlice} from '@reduxjs/toolkit';

export const playerSlice = createSlice({
  name: 'player',
  initialState: {
    source: undefined,
    time: 0,
    loaded: 0,
    duration: undefined,
    seekTime: -1,
    playing: true,
    title: 'Unknown',
  },
  reducers: {
    setSource: (state, action) => {
      state.source = action.payload;
    },
    setTime: (state, action) => {
      state.time = action.payload;
    },
    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setSeekTime: (state, action) => {
      state.seekTime = action.payload;
    },
    play: (state, action) => {
      state.playing = action.payload !== undefined ? !!action.payload : true;
    },
    pause: state => {
      state.playing = false;
    },
    setTitle: (state, action) => {
      state.title = action.payload;
    },
  },
});

export const {
  setSource,
  setTime,
  setLoaded,
  setDuration,
  setSeekTime,
  play,
  pause,
  setTitle,
} = playerSlice.actions;

export default playerSlice.reducer;
