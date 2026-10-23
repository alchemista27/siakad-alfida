import { Platform } from "react-native";

export const SIMPEG_API_URL = Platform.select({
  web: process.env.EXPO_PUBLIC_SIMPEG_API_URL || "https://simpeg.alfida.or.id/api",
  default: process.env.EXPO_PUBLIC_SIMPEG_API_URL || "https://simpeg.alfida.or.id/api",
}) as string;
