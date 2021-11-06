import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {AppRegistry, SafeAreaView, useColorScheme} from 'react-native';
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import {Provider as ReduxProvider} from 'react-redux';
import {name as appName} from './app.json';
import App from './src/App';
import {loadTasks} from './src/logic/download';
import store from './src/redux/store';

const Main = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const paperTheme = isDarkMode ? PaperDarkTheme : PaperDefaultTheme;
  const navigationTheme = isDarkMode
    ? NavigationDarkTheme
    : NavigationDefaultTheme;

  useEffect(() => {
    loadTasks();
  }, []);

  const backgroundStyle = {
    flex: 1,
  };

  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={paperTheme}>
        <SafeAreaView style={backgroundStyle}>
          <NavigationContainer theme={navigationTheme}>
            <App />
          </NavigationContainer>
        </SafeAreaView>
      </PaperProvider>
    </ReduxProvider>
  );
};

export default Main;

AppRegistry.registerComponent(appName, () => Main);
