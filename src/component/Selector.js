import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {Menu, TextInput, TouchableRipple, withTheme} from 'react-native-paper';

const Selector = ({
  label,
  placeholder,
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
        width: inputLayout?.width,
        marginTop: inputLayout?.height,
      }}
      anchor={
        <Pressable onPress={showSelector} onLayout={onLayout}>
          <View pointerEvents="none">
            <TextInput
              value={selectedItem ? selectedItem.label : null}
              mode={mode}
              label={label}
              placeholder={placeholder}
              pointerEvents="none"
              right={
                <TextInput.Icon name={visible ? 'menu-up' : 'menu-down'} />
              }
            />
          </View>
        </Pressable>
      }>
      <ScrollView bounces={false}>
        {list.map(listItem => (
          <TouchableRipple
            key={listItem.value}
            onPress={() => {
              setValue(listItem.value);
              onDismiss();
            }}>
            <Menu.Item
              title={listItem.label}
              titleStyle={{
                color:
                  selectedItem && selectedItem.value === listItem.value
                    ? theme.colors.primary
                    : theme.colors.text,
              }}
            />
          </TouchableRipple>
        ))}
      </ScrollView>
    </Menu>
  );
};

export default withTheme(Selector);
