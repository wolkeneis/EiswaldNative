import React, {useEffect, useState} from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {Menu, TouchableRipple, withTheme} from 'react-native-paper';

const IconSelector = ({
  mode,
  visible,
  showSelector,
  onDismiss,
  value,
  setValue,
  list,
  theme,
}) => {
  const [selectedItem, setSelectedItem] = useState();
  const [inputLayout, setInputLayout] = useState({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });

  const onLayout = event => {
    setInputLayout(event.nativeEvent.layout);
  };

  useEffect(() => {
    for (const listItem of list) {
      if (listItem.value === value) {
        setSelectedItem(listItem);
      }
    }
  }, [value, list]);

  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      style={{
        maxWidth: inputLayout?.width,
        marginTop: inputLayout?.height,
      }}
      anchor={
        <TouchableRipple
          style={{
            ...styles.selector,
            borderColor:
              list.length < 2 ? theme.colors.disabled : theme.colors.primary,
          }}
          mode={mode}
          onPress={showSelector}
          onLayout={onLayout}
          disabled={list.length < 2}>
          <View>
            {selectedItem ? (
              <>
                {selectedItem.icons.length === 1 ? (
                  <View style={styles.languageIconFull}>
                    <Image
                      resizeMode="contain"
                      style={styles.icon}
                      source={selectedItem.icons[0]}
                    />
                  </View>
                ) : (
                  <View style={styles.languageIconFull}>
                    <View style={styles.languageIconLeft}>
                      <Image
                        resizeMode="contain"
                        style={styles.icon}
                        source={selectedItem.icons[0]}
                      />
                    </View>
                    <View style={styles.languageIconRight}>
                      <Image
                        resizeMode="contain"
                        style={styles.icon}
                        source={selectedItem.icons[1]}
                      />
                    </View>
                  </View>
                )}
              </>
            ) : (
              <></>
            )}
          </View>
        </TouchableRipple>
      }>
      <ScrollView bounces={false}>
        {list.map(listItem => (
          <TouchableRipple
            key={listItem.value}
            onPress={() => {
              setValue(listItem.value);
              onDismiss();
            }}>
            <>
              {listItem.icons.length === 1 ? (
                <View style={styles.languageIconFull}>
                  <Image style={styles.icon} source={listItem.icons[0]} />
                </View>
              ) : (
                <View style={styles.languageIconFull}>
                  <View style={styles.languageIconLeft}>
                    <Image
                      resizeMode="contain"
                      style={styles.icon}
                      source={listItem.icons[0]}
                    />
                  </View>
                  <View style={styles.languageIconRight}>
                    <Image
                      resizeMode="contain"
                      style={styles.icon}
                      source={listItem.icons[1]}
                    />
                  </View>
                </View>
              )}
            </>
          </TouchableRipple>
        ))}
      </ScrollView>
    </Menu>
  );
};

export default withTheme(IconSelector);

const styles = StyleSheet.create({
  selector: {
    borderWidth: 1,
    borderRadius: 10,
    width: 64,
    height: 64,
  },
  languageIconFull: {
    width: 32,
    height: 32,
    margin: 16,
  },
  languageIconLeft: {
    width: 16,
    height: 32,
    marginRight: 16,
    position: 'absolute',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  languageIconRight: {
    width: 16,
    height: 32,
    marginLeft: 16,
    position: 'absolute',
    flexDirection: 'row-reverse',
    overflow: 'hidden',
  },
  icon: {
    width: 32,
    height: 32,
  },
});
