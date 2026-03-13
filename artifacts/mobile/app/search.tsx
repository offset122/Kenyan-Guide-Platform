import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  TextInput,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/colors";
import { CATEGORIES } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { ListingCard } from "@/components/ListingCard";

const POPULAR_SEARCHES = ["Plumber", "Electrician", "Jobs Nairobi", "Rooms for rent", "Carpenters", "Lawyers", "Maids", "Android developer"];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { listings } = useAppContext();

  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const results = useMemo(() => {
    if (!query.trim() && !selectedCat) return [];
    const q = query.toLowerCase().trim();
    return listings.filter((l) => {
      const catMatch = !selectedCat || l.categoryId === selectedCat;
      const textMatch = !q ||
        l.title.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q));
      return catMatch && textMatch;
    });
  }, [query, selectedCat, listings]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim()) setHasSearched(true);
  };

  const handleClear = () => {
    setQuery("");
    setHasSearched(false);
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    setHasSearched(true);
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search services, businesses, jobs..."
            placeholderTextColor={Colors.textMuted}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => { setHasSearched(true); Keyboard.dismiss(); }}
          />
          {query ? (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={[{ id: null, title: "All" } as any, ...CATEGORIES.map((c) => ({ id: c.id, title: c.title.replace("Service ", "").replace("Real Estate", "Properties") }))]}
        keyExtractor={(item) => item.id ?? "all"}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
        renderItem={({ item }) => {
          const isActive = selectedCat === item.id;
          return (
            <TouchableOpacity
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => { setSelectedCat(item.id); setHasSearched(true); }}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{item.title}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Content */}
      {!hasSearched ? (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Popular Searches</Text>
          <View style={styles.suggestionsGrid}>
            {POPULAR_SEARCHES.map((s) => (
              <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => handleSuggestion(s)}>
                <Ionicons name="trending-up-outline" size={14} color={Colors.gold} />
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.suggestionsTitle} style={{ marginTop: 24, fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textMuted }}>Browse by Category</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catCard}
                onPress={() => { setSelectedCat(cat.id); setHasSearched(true); }}
              >
                <View style={[styles.catCardIcon, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.icon as any} size={20} color={cat.accentColor} />
                </View>
                <Text style={styles.catCardText}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
          contentContainerStyle={[styles.resultsList, { paddingBottom: isWeb ? 120 : 80 }]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.resultsCount}>{results.length} result{results.length !== 1 ? "s" : ""} found</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptyText}>
                Try a different search term or browse by category
              </Text>
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <Text style={styles.clearBtnText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12,
  },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary, padding: 0 },
  filterScroll: { maxHeight: 54 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  filterChip: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  filterChipActive: { backgroundColor: Colors.green + "40", borderColor: Colors.gold + "60" },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textMuted },
  filterTextActive: { color: Colors.gold },
  suggestionsContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  suggestionsTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textMuted, marginBottom: 12 },
  suggestionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestionChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  suggestionText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  catCard: { width: "47%", backgroundColor: Colors.darkCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  catCardIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  catCardText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary, flex: 1 },
  resultsList: { paddingHorizontal: 16 },
  resultsCount: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textMuted, marginBottom: 12 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  clearBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, marginTop: 8 },
  clearBtnText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textPrimary },
});
