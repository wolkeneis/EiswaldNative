import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import CookieManager from '@react-native-cookies/cookies';
import RNFS from 'react-native-fs';
import {
  addTask,
  finishTask,
  processTask,
  removeDownload,
  removeTask,
  setCurentTask,
  setDownloads,
  setLength,
  setProgress,
  setTasks,
} from '../redux/downloadSlice';
import store from '../redux/store';

function loadTasks() {
  AsyncStorage.getItem('download_tasks')
    .then(tasks => JSON.parse(tasks))
    .catch(() => null)
    .then(tasks => store.dispatch(setTasks(tasks ? tasks : {})));
  AsyncStorage.getItem('download_finished')
    .then(downloads => JSON.parse(downloads))
    .catch(() => null)
    .then(downloads => {
      downloads = downloads || {};
      Object.keys(downloads).forEach(key => {
        if (!downloads[key].successful) {
          delete downloads[key];
        }
      });
      return downloads;
    })
    .then(downloads => store.dispatch(setDownloads(downloads)));
  AsyncStorage.getItem('download_current_task')
    .then(task => JSON.parse(task))
    .catch(() => null)
    .then(task => {
      store.dispatch(setCurentTask(task));
      NetInfo.fetch().then(state => {
        if (
          state.isConnected &&
          state.details &&
          !state.details.isConnectionExpensive
        ) {
          if (task) {
            downloadFile(task);
          }
        }
      });
    });
}

function saveTasks() {
  const state = store.getState();
  AsyncStorage.setItem('download_tasks', JSON.stringify(state.download.tasks));
  AsyncStorage.setItem(
    'download_current_task',
    JSON.stringify(state.download.currentTask),
  );
  AsyncStorage.setItem(
    'download_finished',
    JSON.stringify(state.download.downloads),
  );
}

function episodeSource(playlist, episode) {
  const currentDownloadState = downloadState(episode);
  if (currentDownloadState === 'downloaded') {
    return `${RNFS.DocumentDirectoryPath}/${playlist.key}.${episode.key}`;
  } else {
    return `${playlist.node}/content/source/${playlist.key}/${episode.key}`;
  }
}

function stopDownloading() {
  const state = store.getState();
  const currentTask = state.download.currentTask;
  if (currentTask) {
    store.dispatch(
      addTask({
        ...currentTask,
        jobId: null,
      }),
    );
    RNFS.stopDownload(currentTask.jobId);
    saveTasks();
  }
}

function clearTasks() {
  store.dispatch(setTasks({}));
  saveTasks();
}

function removeEpisode(episode) {
  const state = store.getState();
  if (state.download.tasks[episode.key]) {
    const currentTask = state.download.tasks[episode.key];
    store.dispatch(removeTask(currentTask));
  } else if (
    state.download.currentTask &&
    state.download.currentTask.key === episode.key
  ) {
    const currentTask = state.download.currentTask;
    if (currentTask) {
      RNFS.stopDownload(currentTask.jobId);
      store.dispatch(setCurentTask(null));
      RNFS.unlink(
        `${RNFS.DocumentDirectoryPath}/${currentTask.playlist}.${currentTask.key}`,
      )
        .then(() => {})
        .catch(() => {});
    }
  } else if (state.download.downloads[episode.key]) {
    const currentTask = state.download.downloads[episode.key];
    store.dispatch(removeDownload(currentTask));
    RNFS.unlink(
      `${RNFS.DocumentDirectoryPath}/${currentTask.playlist}.${currentTask.key}`,
    )
      .then(() => {})
      .catch(() => {});
  }
  saveTasks();
}

function startTaskIfNotDownloading() {
  const state = store.getState();
  if (
    !state.download.currentTask &&
    Object.keys(state.download.tasks).length > 0
  ) {
    const task = state.download.tasks[Object.keys(state.download.tasks)[0]];
    downloadFile(task);
  }
}

function downloadEpisode(playlist, episode) {
  const task = {
    ...episode,
    playlist: playlist.key,
    playlistName: playlist.name,
    node: playlist.node,
  };
  store.dispatch(addTask(task));
  saveTasks();
  startTaskIfNotDownloading();
}

function downloadFile(task) {
  const url = `${task.node}/content/source/${task.playlist}/${task.key}`;
  const filePath = `${RNFS.DocumentDirectoryPath}/${task.playlist}.${task.key}`;
  const onBegin = ({jobId, statusCode, contentLength, headers}) => {
    const state = store.getState();
    if (
      state.download.currentTask &&
      state.download.currentTask.jobId === jobId
    ) {
      store.dispatch(setLength(contentLength));
      saveTasks();
    }
  };
  const onProgress = ({jobId, contentLength, bytesWritten}) => {
    const state = store.getState();
    if (
      state.download.currentTask &&
      state.download.currentTask.jobId === jobId
    ) {
      store.dispatch(setProgress(bytesWritten));
      saveTasks();
    }
  };
  const onEnd = ({jobId, statusCode, bytesWritten}) => {
    const state = store.getState();
    if (state.download.currentTask) {
      store.dispatch(
        finishTask({
          ...task,
          successful: bytesWritten ? true : false,
        }),
      );
      saveTasks();
      startTaskIfNotDownloading();
    }
  };
  const onPause = () => {};
  CookieManager.get(task.node).then(cookies => {
    const cookieString = Object.keys(cookies)
      .map(cookie => `${cookies[cookie].name}=${cookies[cookie].value}`)
      .join('; ');
    const download = RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
      headers: {
        Cookie: cookieString,
      },
      background: true,
      discretionary: true,
      cacheable: false,
      progressInterval: 1000,
      progressDivider: 0,
      begin: onBegin,
      progress: onProgress,
      resumable: onPause,
      backgroundTimeout: 3600000,
    });
    download.promise.then(onEnd).catch(() => {
      store.dispatch(
        finishTask({
          ...task,
          successful: false,
        }),
      );
      saveTasks();
    });
    store.dispatch(
      processTask({
        ...task,
        jobId: download.jobId,
      }),
    );
    saveTasks();
  });
}

function downloadState(episode) {
  const state = store.getState();
  if (!episode.available) {
    return 'unavailable';
  }
  if (state.download.downloads[episode.key]) {
    if (state.download.downloads[episode.key].successful) {
      return 'downloaded';
    } else {
      return 'error';
    }
  } else if (
    state.download.tasks[episode.key] ||
    (state.download.currentTask &&
      state.download.currentTask.key === episode.key)
  ) {
    return 'downloading';
  } else {
    return 'downloadable';
  }
}

function downloadStateIcon(episode) {
  const currentDownloadState = downloadState(episode);
  return currentDownloadState === 'unavailable'
    ? 'cloud-off-outline'
    : currentDownloadState === 'downloadable'
    ? 'download-circle-outline'
    : currentDownloadState === 'downloaded'
    ? 'cloud-check'
    : currentDownloadState === 'downloading'
    ? 'progress-download'
    : 'alert-circle-outline';
}

export {
  loadTasks,
  episodeSource,
  downloadEpisode,
  startTaskIfNotDownloading,
  stopDownloading,
  clearTasks,
  removeEpisode,
  downloadState,
  downloadStateIcon,
};
