import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { residentTheme } from "@/platform/theme/tokens";

const tabs = [
  { name: "index", title: "Home", icon: "home-outline", activeIcon: "home" },
  { name: "visitors", title: "Visitors", icon: "people-outline", activeIcon: "people" },
  { name: "community", title: "Community", icon: "chatbubbles-outline", activeIcon: "chatbubbles" },
  { name: "bills", title: "Bills", icon: "card-outline", activeIcon: "card" },
  { name: "more", title: "More", icon: "grid-outline", activeIcon: "grid" },
] as const;

export default function ResidentTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: residentTheme.accent,
        tabBarInactiveTintColor: residentTheme.muted,
        tabBarLabelStyle: { fontSize: 9, lineHeight: 12, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: residentTheme.surface,
          borderTopColor: residentTheme.border,
          height: 62,
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons color={color} name={focused ? tab.activeIcon : tab.icon} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
