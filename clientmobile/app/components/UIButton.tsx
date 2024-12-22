
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { Speak } from '../tts';

export const UIButton = ({ text, color, width, onclick }:
  { text: string, color: string, width: number, onclick: () => void }) => (
  <View style={{ width: `${width}%`, height: 150 }}>
    <Button
      title={"\n\n\n" + text + "\n\n\n\n"}
      color={color}
      onPress={() => {
        Speak('Button ' + text + ' pressed');
        onclick();
      }}
    />
  </View>
)