import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {Suspense} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button} from 'react-native-paper';
import Login from './Login';
import NodeLogin from './NodeLogin';
import NodeSettings from './NodeSettings';
import ProfileSettings from './ProfileSettings';

const Stack = createNativeStackNavigator();

const Settings = () => {
  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Nodes" component={NodeScreen} />
      <Stack.Screen name="Node Login" component={NodeLoginScreen} />
    </Stack.Navigator>
  );
};

const SettingsScreen = ({navigation}) => {
  return (
    <View style={styles.settingsScreen}>
      <Button
        style={styles.settingButton}
        icon="account-circle"
        mode="contained"
        onPress={() => navigation.navigate('Profile')}>
        Profile
      </Button>
      <Button
        style={styles.settingButton}
        icon="source-branch"
        mode="contained"
        onPress={() => navigation.navigate('Nodes')}>
        Nodes
      </Button>
    </View>
  );
};

const ProfileScreen = ({navigation}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <ProfileSettings navigation={navigation} />
    </Suspense>
  );
};

const LoginScreen = ({navigation, route}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <Login
        navigation={navigation}
        provider={
          route.params && route.params.provider
            ? route.params.provider
            : undefined
        }
      />
    </Suspense>
  );
};

const NodeScreen = ({navigation}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <NodeSettings navigation={navigation} />
    </Suspense>
  );
};

const NodeLoginScreen = ({navigation, route}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <NodeLogin navigation={navigation} node={route.params.node} />
    </Suspense>
  );
};

export default Settings;

const styles = StyleSheet.create({
  settingsScreen: {
    paddingVertical: 8,
  },
  settingButton: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
  },
});
