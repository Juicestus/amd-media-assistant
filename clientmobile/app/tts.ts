
import Tts, { Options } from 'react-native-tts';

export const ttsInit = () =>
    Tts.getInitStatus().then(() => {
});

let currentReading: string = ""

export const ttsSpeak = (text: string) => {
    currentReading = text;
    console.log("Prepping to read: " + text);

    Tts.speak(text, {
        androidParams: {
            KEY_PARAM_PAN: -1,
            KEY_PARAM_VOLUME: 0.5,
            KEY_PARAM_STREAM: 'STREAM_MUSIC',
        }
    } as Options);
}

export const ttsEvent = (f: (textLeft:string)=>void) => {
    Tts.addEventListener('tts-progress', (event) => {
        const start = (event as any).start;
        const end = (event as any).end;
        console.log(currentReading.substring(start, end));
        f(currentReading.substring(end));
    });
}

export const ttsStop = () => {
    Tts.stop();
}