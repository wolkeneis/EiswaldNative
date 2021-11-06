import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import 'react-native-get-random-values';
import {
  Button,
  Card,
  Colors,
  List,
  Modal,
  Portal,
  TouchableRipple,
} from 'react-native-paper';
import Video from 'react-native-video';
import {useDispatch, useSelector} from 'react-redux';
import {v4 as uuidv4} from 'uuid';
import {requestSync, sync} from '../../logic/connection';
import {
  downloadEpisode,
  downloadState,
  downloadStateIcon,
  episodeSource,
  removeEpisode,
} from '../../logic/download';
import {fetchPlaylist, languageIcon, seasonName} from '../../logic/node';
import {
  deselectPlaylist,
  selectPlaylist,
  setDefaults,
  setEpisode,
  setLanguage,
  setPlaylist,
  setSeason,
  setSeasons,
} from '../../redux/contentSlice';
import {
  pause,
  play,
  setDuration,
  setLoaded,
  setSeekTime,
  setSource,
  setTime,
  setTitle,
} from '../../redux/playerSlice';
import IconSelector from '../IconSelector';
import Selector from '../Selector';
import VideoControls from './VideoControls';

const Watch = ({node, playlistKey}) => {
  const playlists = useSelector(state => state.content.playlists);
  const playlist = useSelector(state => state.content.playlist);
  const dispatch = useDispatch();

  useEffect(() => {
    if (playlistKey) {
      if (playlists[playlistKey]) {
        dispatch(selectPlaylist(playlists[playlistKey]));
      } else {
        fetchPlaylist(node, playlistKey)
          .then(response => response.json())
          .then(fetchedPlaylist => {
            fetchedPlaylist.node = node.origin;
            dispatch(setPlaylist(fetchedPlaylist));
            dispatch(selectPlaylist(fetchedPlaylist));
          });
      }
    }
    return () => {
      deselectPlaylist();
    };
  }, [dispatch, node, playlists, playlistKey]);

  useEffect(() => {
    if (playlist) {
      const seasonList = playlist.seasons;
      const availableLanguage = [
        ...new Set(playlist.seasons.map(season => season.language)),
      ].sort();
      const availableSeasons = [
        ...new Set(seasonList.map(season => season.index)),
      ]
        .sort((first, second) => {
          if (1 / first > 1 / second && first >= 1 / first) {
            return 1;
          } else if (1 / first < 1 / second && second >= 1 / second) {
            return -1;
          } else {
            return 0;
          }
        })
        .reverse();
      const seasons = [[]];
      playlist.seasons.forEach(season => {
        if (!seasons[season.language]) {
          seasons[season.language] = [];
        }
        seasons[season.language][season.index] = season;
      });
      dispatch(setSeasons(seasons));

      const defaultLanguage = playlist.seasons
        .filter(season => season.index === availableSeasons[0])
        .map(season => season.language)
        .sort()[0];
      const defaultSeason = availableSeasons[0];
      dispatch(
        setDefaults({
          availabilities: {
            languages: availableLanguage,
            seasons: availableSeasons,
          },
          language: defaultLanguage,
          season: defaultSeason,
        }),
      );
    }
  }, [dispatch, playlist]);

  return (
    <View style={styles.watchScreen}>
      <Player />
      <EpisodeList />
    </View>
  );
};

const Player = () => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [containerLayout, setContainerLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const playlistPreviews = useSelector(state => state.content.playlistPreviews);
  const playlist = useSelector(state => state.content.playlist);
  const selectedEpisode = useSelector(state => state.content.episode);
  const source = useSelector(state => state.player.source);
  const time = useSelector(state => state.player.time);
  const loaded = useSelector(state => state.player.loaded);
  const duration = useSelector(state => state.player.duration);
  const seekTime = useSelector(state => state.player.seekTime);
  const playing = useSelector(state => state.player.playing);
  const title = useSelector(state => state.player.title);
  const roomId = useSelector(state => state.room.roomId);
  const host = useSelector(state => state.room.host);
  const videoPlayer = useRef();
  const dispatch = useDispatch();

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      dispatch(pause());
      sync();
    }
  }, [dispatch, isFocused]);

  useEffect(() => {
    if (seekTime !== -1) {
      if (videoPlayer.current) {
        videoPlayer.current.seek(seekTime);
      }
      dispatch(setSeekTime(-1));
    }
  }, [dispatch, seekTime]);

  useEffect(() => {
    if ((playlist || playlistPreviews) && selectedEpisode) {
      if (playlist && playlist.key === selectedEpisode.playlist) {
        dispatch(setSource(episodeSource(playlist, selectedEpisode)));
        dispatch(setTitle(selectedEpisode.name));
      } else {
        const foundPlaylist = playlistPreviews.find(
          playlist => playlist.key === selectedEpisode.playlist,
        );
        if (foundPlaylist !== undefined) {
          dispatch(setSource(episodeSource(foundPlaylist, selectedEpisode)));
          dispatch(setTitle(selectedEpisode.name));
        }
      }
    }
  }, [dispatch, playlistPreviews, playlist, selectedEpisode]);

  const findEpisode = offset => {
    const season = playlist.seasons.find(
      season =>
        season.language === selectedEpisode.language &&
        season.index === selectedEpisode.season,
    );
    if (!season) {
      return false;
    }
    const foundEpisode = season.episodes.find(
      episode => episode.key === selectedEpisode.key,
    );
    if (!foundEpisode) {
      return false;
    }
    return season.episodes.find(
      episode => episode.index === foundEpisode.index + offset,
    );
  };

  const playOtherEpisode = episode => {
    dispatch(
      setEpisode({
        playlist: selectedEpisode.playlist,
        language: selectedEpisode.language,
        season: selectedEpisode.season,
        key: episode.key,
        index: episode.index,
        name: episode.name,
        available: episode.available,
      }),
    );
    dispatch(play());
    sync();
  };

  const previousEpisode = selectedEpisode && playlist && findEpisode(-1);
  const nextEpisode = selectedEpisode && playlist && findEpisode(1);
  const playPrevious = () => playOtherEpisode(previousEpisode);
  const playNext = () => playOtherEpisode(nextEpisode);

  const onLoad = event => {
    dispatch(setTime(event.currentTime));
    dispatch(setLoaded(0));
    dispatch(setDuration(event.duration));
    if (roomId && !host) {
      setTimeout(() => {
        requestSync();
      }, 1000);
    }
  };

  const onProgress = event => {
    dispatch(setTime(event.currentTime));
    dispatch(setLoaded(event.playableDuration / event.seekableDuration));
  };

  const onSeek = event => {
    dispatch(setTime(event.currentTime));
  };

  const onEnd = () => {
    dispatch(pause());
  };

  const onError = () => {
    dispatch(setTime(0));
    dispatch(setLoaded(0));
    dispatch(setDuration(0));
    dispatch(setSeekTime(0));
    dispatch(pause());
  };

  const onLayout = event => {
    event.persist();
    setTimeout(() => {
      event.target.measure((fx, fy, width, height, px, py) =>
        setContainerLayout({
          width: width,
          height: height,
          x: px,
          y: py,
        }),
      );
    }, 150);
  };

  return (
    <View style={styles.videoContainer}>
      {source ? (
        <View style={styles.videoPlaceholder} onLayout={onLayout}>
          <Portal>
            <View
              style={
                isFocused
                  ? fullscreen
                    ? {
                        ...styles.fullscrenVideoContainer,
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                      }
                    : {
                        ...styles.fullscrenVideoContainer,
                        top: containerLayout.y,
                        left: containerLayout.x,
                        width: containerLayout.width,
                        height: containerLayout.height,
                      }
                  : {
                      ...styles.fullscrenVideoContainer,
                      top: 0,
                      left: 0,
                      width: 0,
                      height: 0,
                    }
              }>
              <Video
                ref={videoPlayer}
                resizeMode="contain"
                style={styles.fullscreenVideoPlayer}
                source={{uri: source}}
                paused={!playing}
                fullscreen={fullscreen}
                progressUpdateInterval={250}
                onLoad={onLoad}
                onProgress={onProgress}
                onSeek={onSeek}
                onEnd={onEnd}
                onError={onError}
                onAudioBecomingNoisy={() => dispatch(pause())}
                controls={false}
              />
              <VideoControls
                visible={controlsVisible}
                onShow={() => setControlsVisible(true)}
                onHide={() => setControlsVisible(false)}
                playing={playing}
                onNext={nextEpisode ? playNext : undefined}
                onPrevious={previousEpisode ? playPrevious : undefined}
                onPause={() => {
                  dispatch(pause());
                  sync();
                }}
                onPlay={() => {
                  dispatch(play());
                  sync();
                }}
                time={time}
                buffered={loaded}
                duration={duration}
                onSeek={time => dispatch(setSeekTime(time))}
                onSeekSync={() => sync()}
                fullscreen={fullscreen}
                onFullscreen={() => setFullscreen(true)}
                onExitFullscreen={() => setFullscreen(false)}
                title={title}
              />
            </View>
          </Portal>
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

const EpisodeList = () => {
  const [showSeasonSelector, setShowSeasonSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const playlist = useSelector(state => state.content.playlist);
  const seasons = useSelector(state => state.content.seasons);
  const availabilities = useSelector(state => state.content.availabilities);
  const language = useSelector(state => state.content.language);
  const season = useSelector(state => state.content.season);
  const selectedEpisode = useSelector(state => state.content.episode);
  const dispatch = useDispatch();

  const selectSeason = season => {
    dispatch(setSeason(season));
    if (!seasons[language][season]) {
      for (const language of availabilities.languages) {
        if (seasons[language][season]) {
          dispatch(setLanguage(language));
          return;
        }
      }
    }
  };

  return (
    <View>
      {playlist &&
        seasons &&
        availabilities &&
        language !== undefined &&
        season !== undefined && (
          <View style={styles.selectors}>
            {season !== -1 && (
              <View style={styles.seasonSelector}>
                <Selector
                  label="Season"
                  mode="outlined"
                  visible={showSeasonSelector}
                  showSelector={() => setShowSeasonSelector(true)}
                  onDismiss={() => setShowSeasonSelector(false)}
                  value={season}
                  setValue={selectSeason}
                  list={availabilities.seasons.map(season => ({
                    value: season,
                    label: seasonName(season),
                  }))}
                />
              </View>
            )}
            <View style={styles.languageSelector}>
              <IconSelector
                mode="outlined"
                visible={showLanguageSelector}
                showSelector={() => setShowLanguageSelector(true)}
                onDismiss={() => setShowLanguageSelector(false)}
                value={language}
                setValue={language => dispatch(setLanguage(language))}
                list={availabilities.languages
                  .filter(language => seasons[language][season])
                  .map(language => ({
                    value: language,
                    icons: languageIcon(language),
                  }))}
              />
            </View>
          </View>
        )}
      <ScrollView>
        <List.Section style={styles.episodeList} title="Episodes">
          {playlist &&
            seasons &&
            availabilities &&
            language !== undefined &&
            season !== undefined && (
              <>
                {seasons[language][season] &&
                  seasons[language][season].episodes.map(episode => (
                    <Episode
                      key={episode.key}
                      episode={episode}
                      selected={
                        selectedEpisode && episode.key === selectedEpisode.key
                      }
                    />
                  ))}
              </>
            )}
        </List.Section>
      </ScrollView>
    </View>
  );
};

const Episode = ({episode, selected}) => {
  const [icon, setIcon] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const playlist = useSelector(state => state.content.playlist);
  const language = useSelector(state => state.content.language);
  const season = useSelector(state => state.content.season);
  const roomId = useSelector(state => state.room.roomId);
  const host = useSelector(state => state.room.host);
  const mode = useSelector(state => state.room.mode);
  const tasks = useSelector(state => state.download.tasks);
  const currentTask = useSelector(state => state.download.currentTask);
  const downloads = useSelector(state => state.download.downloads);
  const dispatch = useDispatch();

  useEffect(() => {
    setIcon(downloadStateIcon(episode));
  }, [episode, tasks, currentTask, downloads]);

  const select = () => {
    if (!roomId || host || mode !== 'strict') {
      dispatch(
        setEpisode({
          playlist: playlist.key,
          language: language,
          season: season,
          key: episode.key,
          index: episode.index,
          name: episode.name,
          available: episode.available,
        }),
      );
      dispatch(setTime(0));
      dispatch(play());
      sync();
    }
  };

  const download = () => {
    const currentDownloadState = downloadState(episode);
    if (
      currentDownloadState === 'downloadable' ||
      currentDownloadState === 'error'
    ) {
      downloadEpisode(playlist, {
        language: language,
        season: season,
        key: episode.key,
        index: episode.index,
        name: episode.name,
        available: episode.available,
      });
    } else if (
      currentDownloadState === 'downloaded' ||
      currentDownloadState === 'downloading'
    ) {
      setDeleteModalVisible(true);
    } else {
    }
  };

  const deleteDownload = () => {
    removeEpisode(episode);
  };

  return (
    <>
      <Portal>
        <Modal
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}>
          <Card style={styles.deleteModal}>
            <Card.Cover
              source={{uri: `https://picsum.photos/seed/${uuidv4()}/800`}}
            />
            <Card.Title
              title="Delete this Episode"
              subtitle="Do you really want to delete this Episode?"
            />
            <Card.Actions>
              <Button onPress={() => setDeleteModalVisible(false)}>
                Cancel
              </Button>
              <Button
                onPress={() => {
                  setDeleteModalVisible(false);
                  deleteDownload();
                }}>
                Delete Episode
              </Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
      <TouchableRipple
        disabled={!episode.available}
        onPress={select}
        onLongPress={() => {}}>
        <List.Item
          title={`${episode.index}. Episode`}
          titleStyle={
            selected
              ? {
                  color: Colors.blue300,
                }
              : {}
          }
          description={episode.name}
          descriptionNumberOfLines={3}
          left={() => (
            <List.Icon icon={episode.available ? 'play' : undefined} />
          )}
          right={() => (
            <TouchableRipple disabled={!episode.available} onPress={download}>
              {icon ? <List.Icon icon={icon} /> : <></>}
            </TouchableRipple>
          )}
        />
      </TouchableRipple>
    </>
  );
};

export default Watch;

const styles = StyleSheet.create({
  watchScreen: {
    marginTop: 4,
  },
  videoContainer: {
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholder: {
    backgroundColor: Colors.black,
    aspectRatio: 16 / 9,
    width: '100%',
    maxHeight: 480,
  },
  fullscrenVideoContainer: {
    backgroundColor: Colors.black,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  videoPlayer: {
    aspectRatio: 16 / 9,
    width: '100%',
    maxHeight: 480,
  },
  fullscreenVideoPlayer: {
    flex: 1,
  },
  selectors: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seasonSelector: {
    margin: 16,
    flex: 1,
  },
  languageSelector: {
    margin: 16,
    marginTop: 22,
  },
  episodeList: {
    margin: 16,
  },
  deleteModal: {
    margin: 32,
  },
});
