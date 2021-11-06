import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Suspense, useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  TextInput,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchNodeProfile,
  fetchNodeState,
  logout,
  nodeStateColor,
  nodeStateIcon,
  nodeStateText,
} from '../../logic/node';
import {
  addNode,
  removeNode,
  setNodes,
  setNodeState,
} from '../../redux/contentSlice';

const NodeSettings = ({navigation}) => {
  const nodes = useSelector(state => state.content.nodes);
  const dispatch = useDispatch();

  useEffect(() => {
    AsyncStorage.getItem('nodes')
      .then(nodes => JSON.parse(nodes))
      .catch(() => {})
      .then(nodes => dispatch(setNodes(nodes ? nodes : {})));
  }, [dispatch]);

  useEffect(() => {
    AsyncStorage.setItem('nodes', JSON.stringify(nodes));
    for (const origin in nodes) {
      if (Object.hasOwnProperty.call(nodes, origin)) {
        const node = nodes[origin];
        try {
          fetchNodeState(node.origin)
            .then(nodeInfo => {
              fetchNodeProfile(node.origin)
                .then(profile => {
                  const patchedNode = {
                    origin: node.origin,
                    state: nodeInfo.state,
                    name: nodeInfo.name,
                    profile: profile,
                  };
                  if (nodeStateText(node) !== nodeStateText(patchedNode)) {
                    dispatch(setNodeState(patchedNode));
                  }
                })
                .catch(() => {
                  dispatch(
                    setNodeState({
                      origin: node.origin,
                      state: nodeInfo.state,
                      name: nodeInfo.name,
                      profile: null,
                    }),
                  );
                });
            })
            .catch(() => {
              dispatch(
                setNodeState({
                  origin: node.origin,
                  state: null,
                  name: null,
                  profile: null,
                }),
              );
            });
        } catch {
          dispatch(
            setNodeState({
              origin: node.origin,
              state: null,
              name: null,
              profile: null,
            }),
          );
        }
      }
    }
  }, [dispatch, nodes]);

  return (
    <ScrollView>
      <NodePreview />
      {nodes !== undefined ? (
        <Suspense fallback={<ActivityIndicator size="large" />}>
          {nodes !== null ? (
            <>
              {Object.values(nodes).map(node => (
                <Node key={node.origin} navigation={navigation} node={node} />
              ))}
            </>
          ) : (
            <></>
          )}
        </Suspense>
      ) : (
        <ActivityIndicator size="large" />
      )}
    </ScrollView>
  );
};

const NodePreview = () => {
  const [originText, setOriginText] = useState();
  const [origin, setOrigin] = useState('');
  const [node, setNode] = useState();
  const dispatch = useDispatch();
  const timeout = useRef();

  useEffect(() => {
    try {
      fetchNodeState(origin)
        .then(nodeInfo => {
          fetchNodeProfile(origin)
            .then(profile => {
              const patchedNode = {
                origin: origin,
                state: nodeInfo.state,
                name: nodeInfo.name,
                profile: profile,
              };
              setNode(patchedNode);
            })
            .catch(() => {
              setNode({
                origin: origin,
                state: nodeInfo.state,
                name: nodeInfo.name,
                profile: null,
              });
            });
        })
        .catch(() => {});
    } catch {}
    return () => {
      setNode();
    };
  }, [origin]);

  const onTextChange = text => {
    setOriginText(originText);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setOrigin(text.toLowerCase());
    }, 750);
  };

  const add = () => {
    if (node) {
      setOriginText('');
      setOrigin('');
      dispatch(addNode(node));
    }
  };

  return (
    <Card style={styles.nodeCard}>
      <Card.Cover
        source={{
          uri: node
            ? `https://picsum.photos/seed/${
                node.name ? node.name.toLowerCase() : 'yeet'
              }/800`
            : 'https://picsum.photos/800',
        }}
      />
      <Card.Title
        title={node ? node.name : 'Unknown'}
        subtitle={nodeStateText(node)}
        left={() => (
          <Avatar.Icon
            style={{
              backgroundColor: nodeStateColor(node),
              ...styles.statusAvatar,
            }}
            size={40}
            icon={nodeStateIcon(node)}
          />
        )}
      />
      <Card.Content style={styles.cardContent}>
        <TextInput
          label="Origin"
          value={originText}
          onChangeText={onTextChange}
        />
      </Card.Content>
      <Card.Actions>
        <Button onPress={add}>Add</Button>
      </Card.Actions>
    </Card>
  );
};

const Node = ({navigation, node}) => {
  const dispatch = useDispatch();

  return (
    <Card style={styles.nodeCard}>
      <Card.Cover
        source={{
          uri: node
            ? `https://picsum.photos/seed/${
                node.name ? node.name.toLowerCase() : 'yeet'
              }/800`
            : 'https://picsum.photos/800',
        }}
      />
      <Card.Title
        title={node.name}
        subtitle={nodeStateText(node)}
        left={() => (
          <Avatar.Icon
            style={{
              backgroundColor: nodeStateColor(node),
              ...styles.statusAvatar,
            }}
            size={40}
            icon={nodeStateIcon(node)}
          />
        )}
      />
      <Card.Actions>
        <Button onPress={() => dispatch(removeNode(node))}>Remove</Button>
        {node.profile ? (
          <Button
            onPress={() => logout(node).then(() => navigation.popToTop())}>
            Log out
          </Button>
        ) : (
          <Button
            onPress={() => navigation.navigate('Node Login', {node: node})}>
            Log in
          </Button>
        )}
      </Card.Actions>
    </Card>
  );
};

export default NodeSettings;

const styles = StyleSheet.create({
  nodeCard: {
    margin: 8,
  },
  cardContent: {
    margin: 8,
  },
  nodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusAvatar: {
    margin: 8,
  },
});
