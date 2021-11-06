import {REACT_APP_WALDERDE_NODE} from '@env';
import {io} from 'socket.io-client';
import {setEpisode} from '../redux/contentSlice';
import {play, setSeekTime, setSource, setTitle} from '../redux/playerSlice';
import {
  clearRoom,
  setHost,
  setMode,
  setRoomId,
  setUsers,
} from '../redux/roomSlice';
import store from '../redux/store';

const socket = io(REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev', {
  withCredentials: true,
});

function createRoom() {
  const state = store.getState();
  socket.emit(
    'room create',
    {
      source: state.content.episode
        ? `eiswald://${state.content.episode.language}:${state.content.episode.season}@${state.content.episode.playlist}/${state.content.episode.key}/${state.content.episode.name}`
        : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      title: state.content.episode ? state.content.episode.name : 'Unknown',
      playing: state.player.playing,
      time: state.player.time,
    },
    data => {
      store.dispatch(setRoomId(data));
    },
  );
}

function joinRoom(roomId) {
  socket.emit(
    'room join',
    {
      roomId: roomId,
    },
    roomId => {
      store.dispatch(setRoomId(roomId));
    },
  );
}

function leaveRoom() {
  socket.emit('room leave');
  store.dispatch(clearRoom());
}

function sync() {
  const state = store.getState();
  socket.emit('sync', {
    source: state.content.episode
      ? `eiswald://${state.content.episode.language}:${state.content.episode.season}@${state.content.episode.playlist}/${state.content.episode.key}/${state.content.episode.name}`
      : state.player.source,
    title: state.content.episode ? state.content.episode.name : 'Unknown',
    playing: state.player.playing,
    time: state.player.time,
  });
}

function requestSync() {
  socket.emit('sync request');
}

socket.on('sync', data => {
  store.dispatch(setHost(data.host));
  store.dispatch(setMode(data.mode));

  if (data.content.source.startsWith('eiswald://')) {
    const source = data.content.source.substring(10);
    const seasonInformation = source.split('@')[0].split(':');
    const episodeInformation = source.split('@')[1].split('/');
    const episode = {
      language: seasonInformation[0],
      season: parseInt(seasonInformation[1], 10),
      playlist: episodeInformation[0],
      key: episodeInformation[1],
      name: episodeInformation[2],
    };
    const state = store.getState();
    const currentEpisode = state.content.episode;
    if (
      !currentEpisode ||
      episode.playlist !== currentEpisode.playlist ||
      episode.key !== currentEpisode.key ||
      episode.name !== currentEpisode.name ||
      episode.language !== currentEpisode.language ||
      episode.season !== currentEpisode.season
    ) {
      store.dispatch(setEpisode(episode));
    }
  } else {
    store.dispatch(setEpisode(undefined));
    store.dispatch(setSource(data.content.source));
  }
  store.dispatch(setTitle(data.content.title));
  store.dispatch(play(data.content.playing));
  store.dispatch(setSeekTime(data.content.time));

  store.dispatch(setUsers(data.users));
});

socket.on('sync request', (data, callback) => {
  const state = store.getState();
  callback({
    source: state.content.episode
      ? `eiswald://${state.content.episode.language}:${state.content.episode.season}@${state.content.episode.playlist}/${state.content.episode.key}/${state.content.episode.name}`
      : state.player.source,
    title: state.content.episode ? state.content.episode.name : 'Unknown',
    playing: state.player.playing,
    time: state.player.time,
  });
});

export {createRoom, joinRoom, leaveRoom, sync, requestSync};
