import AsyncStorage from '@react-native-async-storage/async-storage';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {Suspense, useEffect, useRef, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Searchbar, Surface, Title} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {fetchPlaylists} from '../../logic/node';
import {
  addPlaylistPreviews,
  clearPlaylistPreviews,
  setNodes,
} from '../../redux/contentSlice';
import Watch from './Watch';

const Stack = createNativeStackNavigator();

const Home = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Watch" component={WatchScreen} />
    </Stack.Navigator>
  );
};

const HomeScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryText, setSearchQueryText] = useState('');
  const nodes = useSelector(state => state.content.nodes);
  const playlistPreviews = useSelector(state => state.content.playlistPreviews);
  const dispatch = useDispatch();
  const timeout = useRef();

  useEffect(() => {
    AsyncStorage.getItem('nodes')
      .then(nodes => JSON.parse(nodes))
      .catch(() => {})
      .then(nodes => dispatch(setNodes(nodes ? nodes : {})));
  }, [dispatch]);

  useEffect(() => {
    for (const host in nodes) {
      if (Object.hasOwnProperty.call(nodes, host)) {
        const node = nodes[host];
        if (node.state !== 'maintenance') {
          try {
            fetchPlaylists(node)
              .then(response => response.json())
              .then(fetchedPreviews => {
                fetchedPreviews.forEach(
                  fetchedPreview => (fetchedPreview.node = node.origin),
                );
                dispatch(addPlaylistPreviews(fetchedPreviews));
              })
              .catch(() => {});
          } catch {}
        }
      }
    }
    return () => {
      dispatch(clearPlaylistPreviews());
    };
  }, [dispatch, nodes]);

  const onChangeSearch = query => {
    setSearchQueryText(query);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setSearchQuery(query);
    }, 500);
  };

  return (
    <ScrollView style={styles.homeScreen}>
      <Searchbar
        style={styles.searchBar}
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQueryText}
      />
      {playlistPreviews
        .filter(playlistPreview =>
          playlistPreview.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        )
        .map(playlistPreview => (
          <Suspense key={playlistPreview.key} fallback={<ActivityIndicator />}>
            {nodes[playlistPreview.node] && (
              <PlaylistPreview
                navigation={navigation}
                node={nodes[playlistPreview.node]}
                playlistPreview={playlistPreview}
              />
            )}
          </Suspense>
        ))}
    </ScrollView>
  );
};

const WatchScreen = ({navigation, route}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <Watch
        navigation={navigation}
        node={route.params.node}
        playlistKey={route.params.playlistKey}
      />
    </Suspense>
  );
};

const PlaylistPreview = ({navigation, node, playlistPreview}) => {
  return (
    <Surface style={styles.playlistCard}>
      <Pressable
        onPress={() =>
          navigation.navigate('Watch', {
            node: node,
            playlistKey: playlistPreview.key,
          })
        }>
        <View>
          <Image
            style={styles.coverImage}
            resizeMode="contain"
            source={{
              uri: `${node.origin}/content/thumbnail/${playlistPreview.key}`,
            }}
          />
        </View>
        <Title style={styles.title}>{playlistPreview.name}</Title>
      </Pressable>
    </Surface>
  );
};

export default Home;

const styles = StyleSheet.create({
  searchBar: {
    margin: 8,
  },
  homeScreen: {
    marginTop: 4,
  },
  playlistCard: {
    borderRadius: 16,
    margin: 16,
    padding: 16,
  },
  title: {
    alignSelf: 'center',
    margin: 16,
  },
  coverImage: {
    borderRadius: 8,
    height: 295,
    margin: 16,
  },
});
