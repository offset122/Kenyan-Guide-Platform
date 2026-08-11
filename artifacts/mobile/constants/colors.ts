const gold = "#C9A84C";
const goldLight = "#E8C87A";
const goldDark = "#A07830";
const green = "#1A5C38";
const greenLight = "#236B44";
const greenDark = "#0E3D24";
const red = "#BB1919";

// Backgrounds — deep layered darks with a green tint
const darkBg = "#080F0A";
const darkCard = "rgba(15, 30, 20, 0.75)";
const darkCardElevated = "rgba(22, 42, 28, 0.85)";
const darkCardSolid = "#0F1E14";

// Glass surfaces
const glassBg = "rgba(15, 37, 24, 0.6)";
const glassBorder = "rgba(201, 168, 76, 0.18)";
const glassBorderStrong = "rgba(201, 168, 76, 0.35)";
const glassHighlight = "rgba(201, 168, 76, 0.07)";

// Text
const textPrimary = "#F5F0E8";
const textSecondary = "#A89C7E";
const textMuted = "#5A6B58";

// Legacy aliases kept for compatibility
const border = glassBorder;
const borderLight = "rgba(201, 168, 76, 0.09)";

export const Colors = {
  gold,
  goldLight,
  goldDark,
  green,
  greenLight,
  greenDark,
  red,
  darkBg,
  darkCard,
  darkCardElevated,
  darkCardSolid,
  glassBg,
  glassBorder,
  glassBorderStrong,
  glassHighlight,
  textPrimary,
  textSecondary,
  textMuted,
  border,
  borderLight,
};

export default {
  light: {
    text: textPrimary,
    background: darkBg,
    tint: gold,
    tabIconDefault: textMuted,
    tabIconSelected: gold,
  },
};
