import {configureStore} from '@reduxjs/toolkit';
import contentReducer from './contentSlice';
import downloadReducer from './downloadSlice';
import playerReducer from './playerSlice';
import roomReducer from './roomSlice';
import socialReducer from './socialSlice';

export default configureStore({
  reducer: {
    social: socialReducer,
    content: contentReducer,
    download: downloadReducer,
    player: playerReducer,
    room: roomReducer,
  },
  middleware: [],
});
