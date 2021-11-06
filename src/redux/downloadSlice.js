import {createSlice} from '@reduxjs/toolkit';

export const downloadSlice = createSlice({
  name: 'download',
  initialState: {
    currentTask: undefined,
    tasks: undefined,
    downloads: undefined,
  },
  reducers: {
    addTask: (state, action) => {
      state.tasks[action.payload.key] = action.payload;
    },
    removeTask: (state, action) => {
      const {[action.payload.key]: _, ...newTasks} = state.tasks;
      state.tasks = newTasks;
    },
    processTask: (state, action) => {
      state.currentTask = action.payload;
      delete state.tasks[action.payload.key];
    },
    setLength: (state, action) => {
      state.currentTask.length = action.payload;
    },
    setProgress: (state, action) => {
      state.currentTask.progress = action.payload;
    },
    finishTask: (state, action) => {
      state.downloads[action.payload.key] = action.payload;
      state.currentTask = null;
    },
    removeDownload: (state, action) => {
      const {[action.payload.key]: _, ...newDownloads} = state.downloads;
      state.downloads = newDownloads;
    },

    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setCurentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    setDownloads: (state, action) => {
      state.downloads = action.payload;
    },
  },
});

export const {
  addTask,
  removeTask,
  processTask,
  setLength,
  setProgress,
  finishTask,
  removeDownload,
} = downloadSlice.actions;
export const {setTasks, setCurentTask, setDownloads} = downloadSlice.actions;

export default downloadSlice.reducer;
