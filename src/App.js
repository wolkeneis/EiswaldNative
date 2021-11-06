import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Downloads from './component/download/Downloads';
import Home from './component/home/Home';
import Settings from './component/settings/Settings';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="DownloadScreen"
        component={Downloads}
        options={{
          tabBarLabel: 'Downloads',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="file-download" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsScreen"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default App;
