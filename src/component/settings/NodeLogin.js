import {REACT_APP_EISWALD_NODE} from '@env';
import React from 'react';
import WebView from 'react-native-webview';

const NodeLogin = ({navigation, node}) => {
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
      if (url.includes('/redirect/nodes')) {
        navigation.popToTop();
        navigation.navigate('Nodes');
      } else {
        navigation.popToTop();
      }
    }
  };

  return (
    <WebView
      ref={ref => (webview = ref)}
      source={{uri: `${node.origin}/authenticate`}}
      sharedCookiesEnabled={true}
      onNavigationStateChange={handleWebViewNavigationStateChange}
    />
  );
};

export default NodeLogin;
