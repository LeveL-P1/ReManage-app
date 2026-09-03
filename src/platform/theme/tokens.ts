export const colors = {
  cream: "#fefddf",
  primary: "#ff5400",
  primarySoft: "#ffeee5",
  secondary: "#ffbe00",
  secondarySoft: "#fff9e5",
  text: "#1a1a1a",
  textLight: "#666666",
  white: "#FFFFFF",
  cardMuted: "#f7f7f7",
  cardStrong: "#e6e6e6",
  border: "#d0d0d0",
  danger: "#B42318",
} as const;

export const residentTheme = {
  background: colors.cream,
  surface: colors.white,
  text: colors.text,
  textLight: colors.textLight,
  accent: colors.primary,
  accentSoft: colors.primarySoft,
  highlight: colors.secondary,
  highlightSoft: colors.secondarySoft,
  canvas: "#ffffff",
  header: colors.white,
  cardMuted: colors.cardMuted,
  cardStrong: colors.cardStrong,
  border: colors.border,
  muted: colors.textLight,
  ink: colors.text,
  icon: colors.text,
} as const;

export const guardTheme = {
  background: "#1a1a1a",
  surface: "#242424",
  text: colors.cream,
  textLight: "#999999",
  accent: colors.primary,
  accentSoft: colors.primarySoft,
  highlight: colors.secondary,
  highlightSoft: colors.secondarySoft,
} as const;
