import {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';

export const ORIENTATION = {
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait',
};

function getWindowOrientation() {
  const {width, height} = Dimensions.get('window');
  return height >= width ? ORIENTATION.PORTRAIT : ORIENTATION.LANDSCAPE;
}

const useDeviceOrientation = () => {
  const [deviceOrientation, setDeviceOrientation] =
    useState(getWindowOrientation);

  useEffect(() => {
    function updateState() {
      setDeviceOrientation(getWindowOrientation());
    }
    const subscription = Dimensions.addEventListener('change', updateState);
    return () => subscription.remove();
  }, []);

  return deviceOrientation;
};

export default useDeviceOrientation;
