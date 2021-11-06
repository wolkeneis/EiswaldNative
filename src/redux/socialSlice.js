import {createSlice} from '@reduxjs/toolkit';

export const socialSlice = createSlice({
  name: 'social',
  initialState: {
    profile: undefined,
    connections: undefined,
    privateProfile: undefined,
    avatar: undefined,
    privateKey: undefined,
    publicKey: undefined,
    users: {},
    packets: {},
  },
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setConnections: (state, action) => {
      state.connections = action.payload;
    },
    setPrivateProfile: (state, action) => {
      state.privateProfile = action.payload;
    },

    setPrivateKey: (state, action) => {
      state.privateKey = action.payload;
    },
    setPublicKey: (state, action) => {
      state.publicKey = action.payload;
    },

    setUser: (state, action) => {
      state.users[action.payload.id] = action.payload;
    },
    setPacket: (state, action) => {
      state.packets[action.payload.packetId] = action.payload;
    },
  },
});

export const {setProfile, setConnections, setPrivateProfile} =
  socialSlice.actions;
export const {setPrivateKey, setPublicKey} = socialSlice.actions;
export const {setUser, setPacket} = socialSlice.actions;

export default socialSlice.reducer;
