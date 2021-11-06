import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {Suspense} from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  List,
  ProgressBar,
  TouchableRipple,
  withTheme,
} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {
  clearTasks,
  removeEpisode,
  startTaskIfNotDownloading,
  stopDownloading,
} from '../../logic/download';
import {languageIcon} from '../../logic/node';
import Playlist from './Playlist';

const Stack = createNativeStackNavigator();

const Downloads = () => {
  return (
    <Stack.Navigator initialRouteName="Downloads">
      <Stack.Screen name="Downloads" component={DownloadScreen} />
      <Stack.Screen name="Playlist" component={PlaylistScreen} />
    </Stack.Navigator>
  );
};

const DownloadScreen = ({navigation}) => {
  return (
    <ScrollView>
      <DownloadQueue />
      <Playlists navigation={navigation} />
    </ScrollView>
  );
};

const PlaylistScreen = ({navigation, route}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <Playlist
        navigation={navigation}
        playlistKey={route.params.playlistKey}
        playlistName={route.params.playlistName}
      />
    </Suspense>
  );
};

const DownloadQueue = withTheme(({theme}) => {
  const tasks = useSelector(state => state.download.tasks);
  const currentTask = useSelector(state => state.download.currentTask);

  return (
    <>
      {currentTask && currentTask.length && currentTask.progress && (
        <Card style={styles.downloadQueue}>
          <Card.Title
            title={currentTask.playlistName}
            subtitle={currentTask.name}
            left={() => {
              const icons = languageIcon(currentTask.language);

              return (
                <View style={styles.iconContainer}>
                  {icons.length === 1 ? (
                    <View style={styles.languageIconFull}>
                      <Image
                        resizeMode="contain"
                        style={styles.icon}
                        source={icons[0]}
                      />
                    </View>
                  ) : (
                    <View style={styles.languageIconFull}>
                      <View style={styles.languageIconLeft}>
                        <Image
                          resizeMode="contain"
                          style={styles.icon}
                          source={icons[0]}
                        />
                      </View>
                      <View style={styles.languageIconRight}>
                        <Image
                          resizeMode="contain"
                          style={styles.icon}
                          source={icons[1]}
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            }}
          />
          <Card.Content>
            <ProgressBar
              style={styles.progressBar}
              indeterminate={!currentTask.length || !currentTask.progress}
              progress={
                currentTask.length && currentTask.progress
                  ? currentTask.progress / currentTask.length
                  : 0
              }
              color={theme.colors.primary}
            />
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => stopDownloading()}>Stop Downloading</Button>
          </Card.Actions>
        </Card>
      )}
      {Object.keys(tasks).length > 0 && (
        <Card style={styles.downloadQueue}>
          <Card.Content>
            <List.Section title="Download Queue">
              {Object.keys(tasks).map(taskKey => (
                <List.Item
                  key={taskKey}
                  title={tasks[taskKey].playlistName}
                  description={`${tasks[taskKey].index}. ${tasks[taskKey].name}`}
                  descriptionNumberOfLines={3}
                  left={() => {
                    const icons = languageIcon(tasks[taskKey].language);

                    return (
                      <View style={styles.iconContainer}>
                        {icons.length === 1 ? (
                          <View style={styles.languageIconFull}>
                            <Image
                              resizeMode="contain"
                              style={styles.icon}
                              source={icons[0]}
                            />
                          </View>
                        ) : (
                          <View style={styles.languageIconFull}>
                            <View style={styles.languageIconLeft}>
                              <Image
                                resizeMode="contain"
                                style={styles.icon}
                                source={icons[0]}
                              />
                            </View>
                            <View style={styles.languageIconRight}>
                              <Image
                                resizeMode="contain"
                                style={styles.icon}
                                source={icons[1]}
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  }}
                  right={() => (
                    <TouchableRipple
                      onPress={() => removeEpisode(tasks[taskKey])}>
                      <List.Icon icon="delete" />
                    </TouchableRipple>
                  )}
                />
              ))}
            </List.Section>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => clearTasks()}>Clear Queue</Button>
            {currentTask === null && (
              <Button onPress={() => startTaskIfNotDownloading()}>
                Download
              </Button>
            )}
          </Card.Actions>
        </Card>
      )}
    </>
  );
});

const Playlists = ({navigation}) => {
  const downloads = useSelector(state => state.download.downloads);

  const playlists = [
    ...new Set(
      Object.keys(downloads)
        .map(download => downloads[download])
        .map(download => download.playlist),
    ),
  ]
    .sort()
    .map(playlist =>
      Object.keys(downloads)
        .map(download => downloads[download])
        .find(download => download.playlist === playlist),
    )
    .map(download => {
      const episodes = Object.keys(downloads)
        .map(download => downloads[download])
        .filter(episode => download.playlist === episode.playlist)
        .sort((first, second) => {
          if (first.season !== second.season) {
            return first.season - second.season;
          } else {
            return first.index - second.index;
          }
        });

      return {
        key: download.playlist,
        name: download.playlistName,
        episodeCount: episodes.length,
        episodes: episodes,
      };
    });

  return (
    <>
      {Object.keys(playlists).length > 0 && (
        <Card style={styles.downloads}>
          <Card.Cover source={{uri: 'https://picsum.photos/800'}} />
          <Card.Title title="Offline Playlists" />
          <Card.Content>
            <List.Section>
              {Object.keys(playlists)
                .map(playlist => playlists[playlist])
                .map(playlist => (
                  <TouchableRipple
                    key={playlist.key}
                    onPress={() =>
                      navigation.navigate('Playlist', {
                        playlistKey: playlist.key,
                        playlistName: playlist.name,
                      })
                    }>
                    <List.Item
                      title={playlist.name}
                      description={`${playlist.episodeCount} Episodes`}
                    />
                  </TouchableRipple>
                ))}
            </List.Section>
          </Card.Content>
        </Card>
      )}
    </>
  );
};

export default Downloads;

const styles = StyleSheet.create({
  downloads: {
    margin: 16,
  },
  downloadQueue: {
    margin: 16,
  },
  progressBar: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageIconFull: {
    width: 24,
    height: 24,
  },
  languageIconLeft: {
    width: 12,
    height: 24,
    marginRight: 12,
    position: 'absolute',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  languageIconRight: {
    width: 12,
    height: 24,
    marginLeft: 12,
    position: 'absolute',
    flexDirection: 'row-reverse',
    overflow: 'hidden',
  },
  icon: {
    width: 24,
    height: 24,
  },
});
