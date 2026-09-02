export const colors = {
  cream: "#fefddf",
  primary: "#ff5400",
  primarySoft: "#ffeee5",
  secondary: "#ffbe00",
  secondarySoft: "#fff9e5",
  text: "#333333",
  white: "#FFFFFF",
  cardMuted: "#f7f7f7",
  cardStrong: "#e6e6e6",
  border: "#c7c7c7",
  danger: "#B42318",
} as const;

export const residentTheme = {
  background: colors.cream,
  surface: colors.white,
  text: colors.text,
  accent: colors.primary,
  accentSoft: colors.primarySoft,
  highlight: colors.secondary,
  highlightSoft: colors.secondarySoft,
  cardMuted: colors.cardMuted,
  cardStrong: colors.cardStrong,
  border: colors.border,
  muted: colors.cardMuted,
  ink: colors.text,
  icon: colors.text,
} as const;

export const guardTheme = {
  background: colors.text,
  surface: "#242424",
  text: colors.cream,
  accent: colors.primary,
  accentSoft: colors.primarySoft,
  highlight: colors.secondary,
  highlightSoft: colors.secondarySoft,
} as const;
