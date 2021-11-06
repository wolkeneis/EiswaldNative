import {useIsFocused} from '@react-navigation/core';
import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import RNFS from 'react-native-fs';
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
import {useSelector} from 'react-redux';
import {removeEpisode} from '../../logic/download';
import VideoControls from '../home/VideoControls';

const Playlist = ({playlistKey, playlistName}) => {
  const [source, setSource] = useState();
  const [selectedEpisode, setSelectedEpisode] = useState();
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [title, setTitle] = useState('Unknown');
  const [containerLayout, setContainerLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const videoPlayer = useRef();

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      setPlaying(false);
    }
  }, [isFocused]);

  const downloads = useSelector(state => state.download.downloads);

  const episodes = Object.keys(downloads)
    .map(download => downloads[download])
    .filter(download => download.playlist === playlistKey)
    .sort((first, second) => {
      if (first.season !== second.season) {
        return first.season - second.season;
      } else {
        return first.index - second.index;
      }
    });

  const playlist = {
    key: playlistKey,
    name: playlistName,
    episodeCount: episodes.length,
    episodes: episodes,
  };

  const selectEpisode = key => {
    setSelectedEpisode(key);
    setTitle(episodes.find(episode => episode.key === key)?.name);
    setSource(`${RNFS.DocumentDirectoryPath}/${playlist.key}.${key}`);
    setPlaying(true);
  };

  const seek = seekTime => {
    if (seekTime > time + 0.25 || seekTime < time - 0.25) {
      videoPlayer.current.seek(seekTime);
    }
    setTime(seekTime);
  };

  const onLoad = event => {
    setDuration(event.duration);
    setTime(event.currentTime);
  };

  const onProgress = event => {
    if (event.currentTime < time + 0.5 && event.currentTime > time - 0.5) {
      setTime(event.currentTime);
    }
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
    <>
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
                  style={styles.fullscreenVideoPlayer}
                  resizeMode="contain"
                  source={{uri: source}}
                  paused={!playing}
                  progressUpdateInterval={250}
                  fullscreen={fullscreen}
                  onProgress={onProgress}
                  onLoad={onLoad}
                  onAudioBecomingNoisy={() => setPlaying(false)}
                  controls={false}
                />
                <VideoControls
                  visible={controlsVisible}
                  onShow={() => setControlsVisible(true)}
                  onHide={() => setControlsVisible(false)}
                  playing={playing}
                  onPause={() => setPlaying(false)}
                  onPlay={() => setPlaying(true)}
                  time={time}
                  buffered={0}
                  duration={duration}
                  onSeek={seek}
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
      <ScrollView>
        <List.Section style={styles.episodeList} title="Episodes">
          {playlist.episodes.map(episode => (
            <Episode
              key={episode.key}
              episode={episode}
              selected={selectedEpisode && episode.key === selectedEpisode}
              select={() => selectEpisode(episode.key)}
            />
          ))}
        </List.Section>
      </ScrollView>
    </>
  );
};

const Episode = ({episode, selected, select}) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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
            <Card.Cover source={{uri: 'https://picsum.photos/800'}} />
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
      <TouchableRipple onPress={select} onLongPress={() => {}}>
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
          left={() => <List.Icon icon="play" />}
          right={() => (
            <TouchableRipple
              disabled={!episode.available}
              onPress={() => setDeleteModalVisible(true)}>
              <List.Icon icon="delete" />
            </TouchableRipple>
          )}
        />
      </TouchableRipple>
    </>
  );
};

export default Playlist;

const styles = StyleSheet.create({
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
  deleteModal: {
    margin: 32,
  },
});
