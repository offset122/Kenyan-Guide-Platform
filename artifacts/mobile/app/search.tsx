import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/colors";
import { LISTINGS, CATEGORIES } from "@/constants/data";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";

const SUGGESTIONS = [
  "Plumber Nairobi",
  "Electrician Mombasa",
  "Land for sale Ruiru",
  "Software Engineer",
  "Emergency ambulance",
  "3 bedroom apartment",
  "Toyota Hilux",
  "Law firm Upper Hill",
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const results = LISTINGS.filter((l) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.subtitle.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) ||
      l.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCategory = !selectedCategory || l.categoryId === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => { Keyboard.dismiss(); router.back(); }}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <SearchBar
            onChangeText={setQuery}
            value={query}
            autoFocus
            placeholder="Search anything in Kenya..."
          />
        </View>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory((prev) => (prev === item.id ? null : item.id))}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === item.id && { color: Colors.gold },
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      {!query && !selectedCategory ? (
        // Suggestions
        <View style={styles.suggestionsWrap}>
          <Text style={styles.suggestionsTitle}>Popular Searches</Text>
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity key={s} style={styles.suggestionRow} onPress={() => setQuery(s)}>
              <Ionicons name="trending-up-outline" size={16} color={Colors.gold} />
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: isWeb ? 120 : 80 },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>Try a different search term or category</Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  cancelBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryFilter: {
    marginBottom: 8,
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipActive: {
    backgroundColor: "rgba(201,168,76,0.15)",
    borderColor: Colors.gold + "50",
  },
  categoryChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textMuted,
  },
  suggestionsWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 0,
  },
  suggestionsTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  suggestionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  resultCount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 14,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
