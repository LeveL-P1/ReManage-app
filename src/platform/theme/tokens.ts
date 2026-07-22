export const colors = {
  cream: "#FEFDDF",
  orange: "#FF5400",
  yellow: "#FFBE00",
  charcoal: "#333333",
  white: "#FFFFFF",
  danger: "#B42318",
} as const;

export const residentTheme = {
  background: colors.cream,
  surface: colors.white,
  text: colors.charcoal,
  accent: colors.orange,
  highlight: colors.yellow,
  canvas: "#EEEAE3",
  header: "#F4F1EC",
  muted: "#697071",
  border: "#DEDAD3",
  ink: "#1F2324",
  icon: "#123D41",
} as const;

export const guardTheme = {
  background: colors.charcoal,
  surface: "#242424",
  text: colors.cream,
  accent: colors.orange,
  highlight: colors.yellow,
} as const;
