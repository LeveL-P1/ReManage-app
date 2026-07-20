import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";

export function ReactNativeQueryLifecycle(): null {
  useEffect(() => {
    return onlineManager.setEventListener((setOnline) =>
      NetInfo.addEventListener((networkState) => setOnline(Boolean(networkState.isConnected))),
    );
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      focusManager.setFocused(nextState === "active");
    });
    return () => subscription.remove();
  }, []);

  return null;
}
