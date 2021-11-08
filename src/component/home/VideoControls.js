import React, {useEffect, useRef, useState} from 'react';
import {Animated, PanResponder, StyleSheet, View} from 'react-native';
import {Colors, Text, TouchableRipple, withTheme} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {clamp} from '../../logic/utils';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

const VideoControls = ({
  visible,
  onShow,
  onHide,
  playing,
  onNext,
  onPrevious,
  onPause,
  onPlay,
  time,
  buffered,
  duration,
  onSeek,
  onSeekSync,
  fullscreen,
  onFullscreen,
  onExitFullscreen,
  title,
}) => {
  const [gestureActive, setGestureActive] = useState(false);
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const orientation = useDeviceOrientation();
  const timeout = useRef();

  const fullscreenRef = useRef(onFullscreen ? onFullscreen : () => {});
  const exitFullscreenRef = useRef(
    onExitFullscreen ? onExitFullscreen : () => {},
  );

  useEffect(() => {
    if (orientation === 'landscape') {
      fullscreenRef.current();
    } else if (orientation === 'portrait') {
      exitFullscreenRef.current();
    }
  }, [orientation]);

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: visible ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [fadeAnimation, visible]);

  useEffect(() => {
    if (visible && !gestureActive) {
      timeout.current = setTimeout(() => {
        if (onHide) {
          onHide();
        }
      }, 3500);
    } else {
      clearTimeout(timeout.current);
    }
    return () => {
      clearTimeout(timeout.current);
    };
  }, [visible, gestureActive, onHide]);

  return (
    <Animated.View
      style={{
        ...styles.videoControls,
        opacity: fadeAnimation,
      }}>
      <ControlButtons
        playing={playing}
        onNext={visible ? onNext : onNext ? onShow : undefined}
        onPrevious={visible ? onPrevious : onPrevious ? onShow : undefined}
        onPause={visible ? onPause : onShow}
        onPlay={visible ? onPlay : onShow}
        onBackgroundPress={visible ? onHide : onShow}
      />
      <Timeline
        time={time}
        buffered={buffered}
        duration={duration}
        onSeek={visible ? onSeek : onShow}
        onSeekSync={visible ? onSeekSync : onShow}
        gestureActive={gestureActive}
        setGestureActive={setGestureActive}
      />
      <FullscreenButton
        fullscreen={fullscreen}
        onFullscreen={visible ? onFullscreen : onShow}
        onExitFullscreen={visible ? onExitFullscreen : onShow}
      />
      <CurrentTime time={time} duration={duration} />
      <Title title={title} />
    </Animated.View>
  );
};

const Title = ({title}) => {
  return <Text style={styles.title}>{title}</Text>;
};

const ControlButtons = ({
  playing,
  onNext,
  onPrevious,
  onPause,
  onPlay,
  onBackgroundPress,
}) => {
  const onPress = () => {
    if (playing) {
      if (onPause) {
        onPause();
      }
    } else {
      if (onPlay) {
        onPlay();
      }
    }
  };

  return (
    <TouchableRipple style={styles.controlButtons} onPress={onBackgroundPress}>
      <View style={styles.controlButtons}>
        <TouchableRipple style={styles.controlButton} onPress={onPrevious}>
          <MaterialCommunityIcons
            name={onPrevious ? 'skip-previous' : undefined}
            size={28}
            color={Colors.white}
          />
        </TouchableRipple>
        <TouchableRipple style={styles.controlButton} onPress={onPress}>
          <MaterialCommunityIcons
            name={playing ? 'pause' : 'play'}
            size={28}
            color={Colors.white}
          />
        </TouchableRipple>
        <TouchableRipple style={styles.controlButton} onPress={onNext}>
          <MaterialCommunityIcons
            name={onNext ? 'skip-next' : undefined}
            size={28}
            color={Colors.white}
          />
        </TouchableRipple>
      </View>
    </TouchableRipple>
  );
};

const CurrentTime = ({time, duration}) => {
  const parseTime = time => {
    return `${Math.floor(time / 60)}:${time % 60 < 10 ? '0' : ''}${Math.floor(
      time % 60,
    )}`;
  };

  return (
    <Text style={styles.currentTime}>{`${parseTime(time)} / ${parseTime(
      duration,
    )}`}</Text>
  );
};

const FullscreenButton = ({fullscreen, onFullscreen, onExitFullscreen}) => {
  const onPress = () => {
    if (fullscreen) {
      if (onExitFullscreen) {
        onExitFullscreen();
      }
    } else {
      if (onFullscreen) {
        onFullscreen();
      }
    }
  };

  return (
    <TouchableRipple style={styles.fullscreenButton} onPress={onPress}>
      <MaterialCommunityIcons
        name={fullscreen ? 'fullscreen-exit' : 'fullscreen'}
        size={24}
        color={Colors.white}
      />
    </TouchableRipple>
  );
};

const Timeline = withTheme(
  ({
    theme,
    time,
    buffered,
    duration,
    onSeek,
    onSeekSync,
    gestureActive,
    setGestureActive,
  }) => {
    const [timelineLayout, setTimelineLayout] = useState({
      height: 0,
      width: 0,
      x: 0,
      y: 0,
    });

    const playedTime = time / duration;
    const bufferedTime = buffered / duration;

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        const relativeTime = clamp(
          (gestureState.x0 - timelineLayout.x) / timelineLayout.width,
          0,
          1,
        );
        setGestureActive(true);
        if (onSeek) {
          onSeek(relativeTime * duration);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const relativeTime = clamp(
          (gestureState.moveX - timelineLayout.x) / timelineLayout.width,
          0,
          1,
        );
        if (onSeek) {
          onSeek(relativeTime * duration);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        setGestureActive(false);
        if (onSeekSync) {
          onSeekSync();
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {
        setGestureActive(false);
        if (onSeekSync) {
          onSeekSync();
        }
      },
    });

    const onLayout = event => {
      event.target.measure((fx, fy, width, height, px, py) =>
        setTimelineLayout({
          width: width,
          height: height,
          x: px,
          y: py,
        }),
      );
    };

    return (
      <View
        style={styles.timelineContainer}
        {...panResponder.panHandlers}
        onLayout={onLayout}>
        <View
          style={{
            ...styles.timeline,
            backgroundColor: Colors.grey500,
          }}>
          <View
            style={{
              ...styles.timelineBuffered,
              backgroundColor: Colors.grey300,
              width: `${bufferedTime * 100}%`,
            }}
          />
          <View
            style={{
              ...styles.timelinePlayed,
              backgroundColor: theme.colors.primary,
              width: `${playedTime * 100}%`,
            }}
          />
          <View
            style={{
              ...styles.timelineThumb,
              backgroundColor: theme.colors.primary,
              borderRadius:
                (styles.timelineThumb.width * (gestureActive ? 1.4 : 1)) / 2,
              width: styles.timelineThumb.width * (gestureActive ? 1.4 : 1),
              height: styles.timelineThumb.height * (gestureActive ? 1.4 : 1),
              marginTop:
                (styles.timelineThumb.height * (gestureActive ? -1.4 : -1)) /
                  2 +
                3,
              marginLeft:
                (styles.timelineThumb.width * (gestureActive ? -1.4 : -1)) / 2,
              left: `${playedTime * 100}%`,
            }}
          />
        </View>
      </View>
    );
  },
);

export default VideoControls;

const styles = StyleSheet.create({
  videoControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  title: {
    color: Colors.white,
    position: 'absolute',
    top: 16,
    left: 16,
  },
  fullscreenButton: {
    position: 'absolute',
    bottom: 12 * 2 + 10,
    right: 16,
  },
  currentTime: {
    color: Colors.white,
    fontSize: 15,
    position: 'absolute',
    bottom: 12 * 2 + 10,
    left: 16,
  },
  controlButtons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    margin: 16,
  },
  timelineContainer: {
    position: 'absolute',
    height: 12 * 2 + 6,
    bottom: 4,
    left: 16,
    right: 16,
  },
  timeline: {
    position: 'absolute',
    height: 6,
    top: 12,
    bottom: 12,
    left: 0,
    right: 0,
  },
  timelinePlayed: {
    position: 'absolute',
    height: '100%',
    width: '0%',
  },
  timelineBuffered: {
    position: 'absolute',
    height: '100%',
    width: '0%',
  },
  timelineThumb: {
    position: 'absolute',
    borderRadius: 8,
    width: 12,
    height: 12,
    marginLeft: -8,
    marginTop: -4,
    left: '0%',
  },
});

/*const VideoControls = ({ visible, muted, unmute }) => {
  return (
    <div className='VideoControls' style={visible || muted ? {} : { opacity: '0' }}>
      {muted &&
        <div className='AboveTimeline'>
          <button aria-label='Unmute Button' className='UnmuteButton' onClick={unmute} style={{ opacity: '1' }}>Unmute Audio</button>
        </div>}
      <div className='AboveTimeline'>
        <LeftControlContainer previousEpisode={previousEpisode} nextEpisode={nextEpisode} />
        <RightControlContainer />
      </div>
      <Timeline />
    </div>
  );
}

const LeftControlContainer = ({ previousEpisode, nextEpisode }) => {

  const parseTime = (time) => {
    return `${Math.floor(time / 60)}:${time % 60 < 10 ? '0' : ''}${Math.floor(time % 60)}`
  }

  return (
    <div className='ControlContainer'>
      {(!roomId || (host || mode !== 'strict')) && previousEpisode &&
        <IconButton buttonName='Previous' imageAlt='Previous Icon' imageSource={previousIcon} onClick={playPrevious} ></IconButton>
      }
      {playing
        ? <IconButton buttonName='Pause' imageAlt='Pause Icon' imageSource={pauseIcon} onClick={() => {
          dispatch(pause());
          sync();
        }} ></IconButton>
        : <IconButton buttonName='Play' imageAlt='Play Icon' imageSource={playIcon} onClick={() => {
          dispatch(play());
          sync();
        }} ></IconButton>
      }
      {(!roomId || (host || mode !== 'strict')) && nextEpisode &&
        <IconButton buttonName='Next' imageAlt='Next Icon' imageSource={nextIcon} onClick={playNext} ></IconButton>
      }
      <p className='Time'>{parseTime(time)} / {parseTime(duration)}</p>
    </div>
  )
}

const RightControlContainer = () => {
  return (
    <div className='ControlContainer'>
      <VolumeChanger />
      {document.fullscreenElement === document.getElementById('video-wrapper')
        ? <IconButton buttonName='Exit Fullscreen' imageAlt='Exit Fullscreen Icon' imageSource={exitFullscreenIcon} onClick={() => document.exitFullscreen()} ></IconButton>
        : <IconButton buttonName='Fullscreen' imageAlt='Fullscreen Icon' imageSource={fullscreenIcon} onClick={() => document.getElementById('video-wrapper').requestFullscreen()} ></IconButton>
      }
    </div>
  )
}


const Timeline = () => {

  const bind = useDrag(state => {
    if (timeline.current && state.type !== 'pointerup') {
      const rect = timeline.current.getBoundingClientRect();
      const relativeTime = clamp((state.xy[0] - rect.x) / rect.width, 0, 1);
      dispatch(setPlayed(relativeTime));
      dispatch(setTime(relativeTime * duration));
    } else {
      sync();
    }
  }, {});

  return (
    <>
      <div {...bind()} ref={timeline} className='Timeline'>
        <div className='Buffered' style={{ backgroundSize: `${loaded * 100}% 100%` }}></div>
        <div className='Played' style={{ backgroundSize: `${played * 100}% 100%` }}></div>
        <div className='Thumb' style={{ left: `${played * 100}%` }}></div>
      </div>
    </>
  );
}*/
