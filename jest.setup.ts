process.env.EXPO_PUBLIC_API_BASE_URL ??= "http://localhost:4000";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));
