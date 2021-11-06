import englandIcon from '../media/england.png';
import germanyIcon from '../media/germany.png';
import japanIcon from '../media/japan.png';
import {blobToBase64, wrapPromise} from './utils';

const fetchNodeState = origin => {
  return fetch(new Request(origin))
    .then(response => response.json())
    .then(state => state);
};

const fetchNodeProfile = origin => {
  return fetch(
    new Request(`${origin}/profile`, {
      credentials: 'include',
      redirect: 'manual',
    }),
  )
    .then(response => response.json())
    .then(profile => profile);
};

const fetchPlaylists = node => {
  return fetch(node.origin + '/content/playlists/', {
    importance: 'high',
    credentials: 'include',
  });
};

function fetchPlaylist(node, key) {
  return fetch(node.origin + '/content/playlist/' + key, {
    importance: 'high',
    credentials: 'include',
  });
}

function fetchThumbnail(node, key) {
  return wrapPromise(
    fetch(
      new Request(node.origin + '/content/thumbnail/' + key, {
        importance: 'low',
        redirect: 'manual',
        credentials: 'include',
      }),
    )
      .then(response => response.blob())
      .then(blob => blobToBase64(blob))
      .then(image => image)
      .catch(() => {}),
  );
}

function logout(node) {
  return fetch(
    new Request(`${node.origin}/profile/logout`, {
      method: 'DELETE',
      credentials: 'include',
      redirect: 'manual',
    }),
  )
    .then(() => {})
    .catch(() => {});
}

function nodeStateIcon(node) {
  return node && node.state
    ? node.state === 'maintenance'
      ? 'wrench-clock'
      : node.profile
      ? node.profile.authorized
        ? 'check'
        : 'account-lock'
      : 'account-off'
    : 'alert-circle-outline';
}

function nodeStateColor(node) {
  return node && node.state
    ? node.state === 'maintenance'
      ? 'skyblue'
      : node.profile
      ? node.profile.authorized
        ? 'green'
        : 'red'
      : 'yellow'
    : '#222222';
}

function nodeStateText(node) {
  return node && node.state
    ? node.state === 'maintenance'
      ? 'Maintenance'
      : node.profile
      ? node.profile.authorized
        ? 'Available'
        : 'Unauthorized'
      : 'Unauthenticated'
    : 'Unavailable';
}

function languageIcon(language) {
  return `${language}`.split('-').length === 1
    ? [languageIndexImage(`${language}`.split('-')[0])]
    : `${language}`.split('-').length === 2
    ? [
        languageIndexImage(`${language}`.split('-')[0]),
        languageIndexImage(`${language}`.split('-')[1]),
      ]
    : undefined;
}

function languageIndexImage(language) {
  return `${language}` === '0'
    ? germanyIcon
    : `${language}` === '1'
    ? japanIcon
    : `${language}` === '2'
    ? englandIcon
    : undefined;
}

function seasonName(season) {
  return season === -1
    ? undefined
    : season === 0
    ? 'Specials'
    : `Season ${season}`;
}

export {
  fetchNodeState,
  fetchNodeProfile,
  fetchPlaylists,
  fetchThumbnail,
  fetchPlaylist,
  logout,
};
export {nodeStateIcon, nodeStateColor, nodeStateText};
export {languageIcon, seasonName};
