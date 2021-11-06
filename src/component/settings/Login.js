import {REACT_APP_EISWALD_NODE, REACT_APP_WALDERDE_NODE} from '@env';
import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Button, Card, List} from 'react-native-paper';
import WebView from 'react-native-webview';
import {providers} from '../../logic/profile';

const Login = ({navigation, provider}) => {
  var webview = null;
  const handleWebViewNavigationStateChange = newNavigationState => {
    const {url} = newNavigationState;
    if (!url) {
      return;
    }

    if (
      url.includes(
        `${REACT_APP_EISWALD_NODE || 'https://eiswald.wolkeneis.dev'}/redirect`,
      )
    ) {
      webview.stopLoading();
      if (url.includes('/redirect/profile')) {
        navigation.popToTop();
        navigation.navigate('Profile');
      } else {
        navigation.popToTop();
      }
    }
  };

  return (
    <>
      {provider ? (
        <WebView
          ref={ref => (webview = ref)}
          source={{
            uri: `${
              REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev'
            }/login/${provider.id}`,
          }}
          sharedCookiesEnabled={true}
          onNavigationStateChange={handleWebViewNavigationStateChange}
        />
      ) : (
        <ScrollView>
          {providers.map(provider => (
            <Connection
              key={provider.id}
              navigation={navigation}
              provider={provider}
            />
          ))}
        </ScrollView>
      )}
    </>
  );
};

const Connection = ({navigation, provider}) => {
  return (
    <Card style={styles.profileCard}>
      <Card.Title
        title={provider.name}
        left={() => <List.Icon size={32} icon={provider.icon} />}
      />
      <Card.Actions>
        <Button
          onPress={() =>
            navigation.navigate('Login', {
              provider: provider,
            })
          }>
          Log in
        </Button>
      </Card.Actions>
    </Card>
  );
};

export default Login;

const styles = StyleSheet.create({
  profileCard: {
    margin: 8,
  },
});
