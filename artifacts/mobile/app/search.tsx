import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  TextInput,
  Keyboard,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { CATEGORIES, KENYAN_COUNTIES } from "@/constants/data";
import { useAppContext } from "@/context/AppContext";
import { ListingCard } from "@/components/ListingCard";

const HISTORY_KEY = "@mkg:search_history";
const MAX_HISTORY = 8;

const POPULAR_SEARCHES = ["Plumber", "Electrician", "Jobs Nairobi", "Rooms for rent", "Carpenters", "Lawyers", "Mechanic", "Android developer", "House cleaner", "Tutor"];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const { listings } = useAppContext();

  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [showCountyPicker, setShowCountyPicker] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
      if (raw) setHistory(JSON.parse(raw));
    });
  }, []);

  const saveToHistory = useCallback(async (term: string) => {
    if (!term.trim()) return;
    setHistory((prev) => {
      const updated = [term, ...prev.filter((h) => h.toLowerCase() !== term.toLowerCase())].slice(0, MAX_HISTORY);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  const removeHistoryItem = useCallback(async (term: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h !== term);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const results = useMemo(() => {
    if (!query.trim() && !selectedCat && !selectedCounty) return [];
    const q = query.toLowerCase().trim();
    return listings.filter((l) => {
      const catMatch = !selectedCat || l.categoryId === selectedCat;
      const countyMatch = !selectedCounty || l.location.toLowerCase().includes(selectedCounty.toLowerCase());
      const textMatch = !q ||
        l.title.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q));
      return catMatch && countyMatch && textMatch;
    });
  }, [query, selectedCat, selectedCounty, listings]);

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
    saveToHistory(s);
    Keyboard.dismiss();
  };

  const handleSubmit = () => {
    if (query.trim()) {
      saveToHistory(query.trim());
      setHasSearched(true);
      Keyboard.dismiss();
    }
  };

  const showSuggestions = !hasSearched && !query.trim() && !selectedCat && !selectedCounty;

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
            onSubmitEditing={handleSubmit}
            placeholder="Search services, businesses, jobs..."
            placeholderTextColor={Colors.textMuted}
            autoFocus
            returnKeyType="search"
            selectTextOnFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catRow}>
        {[{ id: null, title: "All" }, ...CATEGORIES.map((c) => ({ id: c.id, title: c.title }))].map((cat) => (
          <TouchableOpacity
            key={cat.id ?? "all"}
            style={[styles.catChip, selectedCat === cat.id && styles.catChipActive]}
            onPress={() => { setSelectedCat(cat.id); if (cat.id) setHasSearched(true); }}
          >
            <Text style={[styles.catChipText, selectedCat === cat.id && styles.catChipTextActive]}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Location filter row */}
      <View style={styles.locationFilterRow}>
        <TouchableOpacity
          style={[styles.countyBtn, selectedCounty && styles.countyBtnActive]}
          onPress={() => setShowCountyPicker((v) => !v)}
        >
          <Ionicons name="location-outline" size={14} color={selectedCounty ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.countyBtnText, selectedCounty && styles.countyBtnTextActive]}>
            {selectedCounty ?? "All Counties"}
          </Text>
          <Ionicons name={showCountyPicker ? "chevron-up" : "chevron-down"} size={14} color={selectedCounty ? Colors.gold : Colors.textMuted} />
        </TouchableOpacity>
        {selectedCounty && (
          <TouchableOpacity style={styles.clearCountyBtn} onPress={() => { setSelectedCounty(null); setShowCountyPicker(false); }}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {showCountyPicker && (
        <View style={styles.countyDropdown}>
          <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
            {KENYAN_COUNTIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.countyOption, selectedCounty === c && styles.countyOptionActive]}
                onPress={() => { setSelectedCounty(c); setShowCountyPicker(false); setHasSearched(true); }}
              >
                <Text style={[styles.countyOptionText, selectedCounty === c && styles.countyOptionTextActive]}>{c}</Text>
                {selectedCounty === c && <Ionicons name="checkmark" size={14} color={Colors.gold} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Suggestions / History / Results */}
      {showSuggestions ? (
        <ScrollView contentContainerStyle={styles.suggestionsContent} showsVerticalScrollIndicator={false}>
          {history.length > 0 && (
            <Animated.View entering={FadeIn.duration(300)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearText}>Clear all</Text>
                </TouchableOpacity>
              </View>
              {history.map((h) => (
                <View key={h} style={styles.historyRow}>
                  <TouchableOpacity style={styles.historyItem} onPress={() => handleSuggestion(h)}>
                    <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.historyText}>{h}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeHistoryItem(h)} hitSlop={8}>
                    <Ionicons name="close" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </Animated.View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
          </View>
          <View style={styles.tagsWrap}>
            {POPULAR_SEARCHES.map((s) => (
              <TouchableOpacity key={s} style={styles.popTag} onPress={() => handleSuggestion(s)}>
                <Ionicons name="trending-up-outline" size={12} color={Colors.gold} />
                <Text style={styles.popTagText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
          </View>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catGridItem, { backgroundColor: cat.color + "60" }]}
                onPress={() => { setSelectedCat(cat.id); setHasSearched(true); }}
              >
                <Text style={styles.catGridText}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
              <ListingCard listing={item} />
            </Animated.View>
          )}
          contentContainerStyle={[styles.results, { paddingBottom: isWeb ? 120 : 100 }]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.resultCount}>{results.length} result{results.length !== 1 ? "s" : ""}</Text>
            ) : null
          }
          ListEmptyComponent={
            <Animated.View entering={FadeIn.duration(400)} style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={52} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>Try a different search term or browse by category</Text>
            </Animated.View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: { flexDirection: "row", gap: 10, alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.gold + "30", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11 },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary, padding: 0 },
  catScroll: { maxHeight: 48 },
  catRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border },
  catChipActive: { backgroundColor: Colors.green + "40", borderColor: Colors.gold + "50" },
  catChipText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary },
  catChipTextActive: { color: Colors.gold },
  locationFilterRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  countyBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  countyBtnActive: { borderColor: Colors.gold + "50", backgroundColor: Colors.green + "30" },
  countyBtnText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textMuted },
  countyBtnTextActive: { color: Colors.gold },
  clearCountyBtn: { padding: 4 },
  countyDropdown: { marginHorizontal: 16, marginBottom: 8, backgroundColor: Colors.darkCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  countyOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  countyOptionActive: { backgroundColor: Colors.green + "30" },
  countyOptionText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textSecondary },
  countyOptionTextActive: { color: Colors.gold },
  suggestionsContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 80 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.7 },
  clearText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textMuted },
  historyRow: { flexDirection: "row", alignItems: "center", paddingVertical: 2 },
  historyItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  historyText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary, flex: 1 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  popTag: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  popTagText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catGridItem: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  catGridText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textPrimary },
  results: { paddingHorizontal: 16, paddingTop: 4 },
  resultCount: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textMuted, paddingBottom: 10 },
  emptyWrap: { alignItems: "center", paddingVertical: 60, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
});
