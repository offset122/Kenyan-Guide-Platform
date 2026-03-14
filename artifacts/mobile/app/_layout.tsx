import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Colors } from "@/constants/colors";
import { AppContextProvider } from "@/context/AppContext";
import { MessagingProvider } from "@/context/MessagingContext";
import { LocationProvider } from "@/context/LocationContext";
import { ToastProvider, useToast } from "@/context/ToastContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function ToastOutlet() {
  const { Outlet } = useToast();
  return <Outlet />;
}

function RootLayoutNav() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.darkBg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/index" options={{ headerShown: false, animation: "slide_from_bottom" }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="category/[id]" options={{ headerShown: false, animation: "slide_from_bottom" }} />
        <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="my-listings" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="messages/index" options={{ headerShown: false, animation: "slide_from_bottom" }} />
        <Stack.Screen name="messages/[id]" options={{ headerShown: false }} />
      </Stack>
      <ToastOutlet />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppContextProvider>
          <MessagingProvider>
            <LocationProvider>
              <ToastProvider>
                <QueryClientProvider client={queryClient}>
                  <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
                    <KeyboardProvider>
                      <RootLayoutNav />
                    </KeyboardProvider>
                  </GestureHandlerRootView>
                </QueryClientProvider>
              </ToastProvider>
            </LocationProvider>
          </MessagingProvider>
        </AppContextProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
