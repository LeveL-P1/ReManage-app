import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

export function AuthBrand() {
  return (
    <View accessibilityLabel="ReManage logo" accessibilityRole="image" accessible style={styles.brand}>
      <View style={styles.markSurface}>
        <Image contentFit="contain" source={require("../../../assets/images/remanage-mark.svg")} style={styles.mark} />
      </View>
      <Image accessible={false} contentFit="contain" source={require("../../../assets/images/remanage-wordmark.svg")} style={styles.wordmark} />
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: "center", flexDirection: "row", gap: 11, marginBottom: 8 },
  markSurface: { alignItems: "center", backgroundColor: "#E6F4F1", borderRadius: 14, height: 52, justifyContent: "center", width: 52 },
  mark: { height: 31, width: 31 },
  wordmark: { height: 34, width: 142 },
});
