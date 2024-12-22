
import Tts, { Options } from 'react-native-tts';

export const TTSInit = () => 
    Tts.getInitStatus().then(() => {
    });

export const Speak = (text: string) => {
  Tts.speak(text, {
    androidParams: {
      KEY_PARAM_PAN: -1,
      KEY_PARAM_VOLUME: 0.5,
      KEY_PARAM_STREAM: 'STREAM_MUSIC',
    }
  } as Options);
}

