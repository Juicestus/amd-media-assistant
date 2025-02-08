
import { Alert, Button, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
  {/* <Button
      title={"\n\n\n" + text + "\n\n\n\n"}
      color={color}
      onPress={() => {
        onclick();
      }}
    /> */}
export const UIButton = ({ text, color, width, onclick }:
  { text: string, color: string, width: number, onclick: () => void }) => (
  

  <View style={{ width: `${width}%`, }}>
    <Pressable style={{ height: 350, marginTop: 15, marginBottom: 15, backgroundColor: color }} onPress={() => onclick()}>
        <Text style={{fontWeight: "bold", fontSize: 24, color: "white", textAlign: 'center', marginTop: "27%"}}>{text}</Text>
    </Pressable>
  </View>
)