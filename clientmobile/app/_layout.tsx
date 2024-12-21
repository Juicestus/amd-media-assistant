
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import Tts, { Options } from 'react-native-tts';

const Speak = (text: string) => {
  Tts.speak(text, {
    androidParams: {
      KEY_PARAM_PAN: -1,
      KEY_PARAM_VOLUME: 0.5,
      KEY_PARAM_STREAM: 'STREAM_MUSIC',
    }
  } as Options);
}


const UIButton = ({ text, color, width, onclick }:
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

export default function RootLayout() {

  Tts.getInitStatus().then(() => {
  });

  return (
    <View style={styles.container}>
      <View>
        {/* <Text style={styles.title}>AMD Assistant</Text> */}
        {/* <View style={styles.separator} /> */}

        <View style={styles.inLine}>
          <UIButton text="I forgot" color="blue" width={47.5}
            onclick={() => { }} />
          <UIButton text="Category" color="blue" width={47.5}
            onclick={() => { }} />
        </View>
        <View style={styles.separator} />
        <View style={styles.inLine}>
          <UIButton text="Cancel" color="red" width={30}
            onclick={() => { }} />
          <UIButton text="Pause" color="orange" width={30}
            onclick={() => { }} />
          <UIButton text="Play" color="green" width={30}
            onclick={() => { }} />

        </View>
      </View>
      {/* <StatusBar style="auto" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  inLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 32,
    borderBottomColor: '#737373',
  },
});
