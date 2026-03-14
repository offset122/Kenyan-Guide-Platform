import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, Text, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useMessaging } from "@/context/MessagingContext";

function ProfileTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { totalUnread } = useMessaging();
  const isIOS = Platform.OS === "ios";
  return (
    <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
      {isIOS
        ? <SymbolView name={focused ? "person.fill" : "person"} tintColor={color} size={22} />
        : <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
      }
      {totalUnread > 0 && (
        <View style={badgeStyles.dot}>
          <Text style={badgeStyles.dotText}>{totalUnread > 9 ? "9+" : totalUnread}</Text>
        </View>
      )}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  dot: {
    position: "absolute",
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.darkCard,
  },
  dotText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    color: Colors.darkBg,
  },
});

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Icon sf={{ default: "square.grid.2x2", selected: "square.grid.2x2.fill" }} />
        <Label>Explore</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="create">
        <Icon sf={{ default: "plus.circle.fill", selected: "plus.circle.fill" }} />
        <Label>Post</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="saved">
        <Icon sf={{ default: "bookmark", selected: "bookmark.fill" }} />
        <Label>Saved</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : Colors.darkCard,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 0,
          paddingBottom: isWeb ? 34 : insets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.darkCard }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) =>
            isIOS
              ? <SymbolView name={focused ? "house.fill" : "house"} tintColor={color} size={22} />
              : <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) =>
            isIOS
              ? <SymbolView name={focused ? "square.grid.2x2.fill" : "square.grid.2x2"} tintColor={color} size={22} />
              : <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Post",
          tabBarIcon: ({ color, focused }) =>
            isIOS
              ? <SymbolView name="plus.circle.fill" tintColor={color} size={28} />
              : <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) =>
            isIOS
              ? <SymbolView name={focused ? "bookmark.fill" : "bookmark"} tintColor={color} size={22} />
              : <Ionicons name={focused ? "bookmark" : "bookmark-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <ProfileTabIcon color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({});
