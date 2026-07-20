import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";

export function ReactNativeQueryLifecycle(): null {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((networkState) => {
      onlineManager.setOnline(Boolean(networkState.isConnected));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      focusManager.setFocused(nextState === "active");
    });
    return () => subscription.remove();
  }, []);

  return null;
}
