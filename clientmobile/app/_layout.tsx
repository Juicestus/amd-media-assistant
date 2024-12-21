
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import Tts, { Options } from 'react-native-tts';



const TriButton = ({ text, color }: { text: string, color: string }) => (
  <View style={{ width: '30%', height: 100 }}>
    <Button
      title={"\n\n" + text + "\n\n\n"}
      color={color}
      onPress={() => {
        Tts.speak('Pressed ' + text, {
          androidParams: {
            KEY_PARAM_PAN: -1,
            KEY_PARAM_VOLUME: 0.5,
            KEY_PARAM_STREAM: 'STREAM_MUSIC',
          }
        } as Options);
      }}
    />
  </View>
)

export default function RootLayout() {

Tts.getInitStatus().then(() => {
  Tts.speak("Bruh");
  console.log("Init good!");
});

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.inLine}>

          <TriButton text="Cancel" color="red" />
          <TriButton text="Pause" color="orange" />
          <TriButton text="Play" color="green" />

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
  },
  inLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
