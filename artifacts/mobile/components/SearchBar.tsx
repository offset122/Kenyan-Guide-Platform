import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";

interface SearchBarProps {
  onPress?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onChangeText?: (text: string) => void;
  value?: string;
}

export function SearchBar({ onPress, placeholder = "Search services, jobs, properties...", autoFocus, onChangeText, value }: SearchBarProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.inner}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        {onChangeText ? (
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
            autoFocus={autoFocus}
            onChangeText={onChangeText}
            value={value}
            returnKeyType="search"
          />
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
        {!onChangeText && (
          <View style={styles.shortcut}>
            <Ionicons name="options-outline" size={16} color={Colors.gold} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  placeholder: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textMuted,
  },
  shortcut: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(201,168,76,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
