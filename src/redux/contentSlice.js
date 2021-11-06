import {createSlice} from '@reduxjs/toolkit';

export const contentSlice = createSlice({
  name: 'content',
  initialState: {
    nodes: {},
    playlistPreviews: [],
    playlists: {},
    playlist: undefined,
    seasons: undefined,
    availabilities: undefined,
    language: undefined,
    season: undefined,
    episode: undefined,
    title: '',
  },
  reducers: {
    setNodes: (state, action) => {
      state.nodes = action.payload;
    },
    addNode: (state, action) => {
      state.nodes[action.payload.origin] = action.payload;
    },
    removeNode: (state, action) => {
      const {[action.payload.origin]: _, ...newNodes} = state.nodes;
      state.nodes = newNodes;
    },
    setNodeState: (state, action) => {
      state.nodes[action.payload.origin].state = action.payload.state;
      state.nodes[action.payload.origin].name = action.payload.name;
      state.nodes[action.payload.origin].profile = action.payload.profile;
    },

    setPlaylistPreviews: (state, action) => {
      state.playlistPreviews = action.payload;
    },
    addPlaylistPreviews: (state, action) => {
      state.playlistPreviews =
        state.playlistPreviews !== undefined
          ? state.playlistPreviews.concat(action.payload)
          : action.payload;
    },
    clearPlaylistPreviews: state => {
      state.playlistPreviews = [];
    },

    setPlaylist: (state, action) => {
      state.playlists[action.payload.key] = action.payload;
    },

    selectPlaylist: (state, action) => {
      state.playlist = action.payload;
    },
    deselectPlaylist: state => {
      state.playlist = undefined;
    },

    setSeasons: (state, action) => {
      state.seasons = action.payload;
    },

    setDefaults: (state, action) => {
      state.availabilities = action.payload.availabilities;
      state.language = action.payload.language;
      state.season = action.payload.season;
    },

    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setSeason: (state, action) => {
      state.season = action.payload;
    },

    setEpisode: (state, action) => {
      state.episode = action.payload;
    },

    setTitle: (state, action) => {
      state.title = action.payload;
    },
  },
});

export const {setNodes, addNode, removeNode, setNodeState} =
  contentSlice.actions;
export const {setPlaylistPreviews, addPlaylistPreviews, clearPlaylistPreviews} =
  contentSlice.actions;
export const {setPlaylist} = contentSlice.actions;
export const {selectPlaylist, deselectPlaylist} = contentSlice.actions;
export const {setSeasons} = contentSlice.actions;
export const {setDefaults} = contentSlice.actions;
export const {setLanguage, setSeason} = contentSlice.actions;
export const {setEpisode} = contentSlice.actions;

export default contentSlice.reducer;
