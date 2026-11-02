import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import type { FoundationBranding } from "../lib/foundation-branding";

const fallbackLogo = require("../../assets/icon.png");

type Props = { branding: FoundationBranding; size?: number };

export function FoundationLogo({ branding, size = 112 }: Props) {
  const [failed, setFailed] = useState(false);
  const source = branding.logoUrl && !failed ? { uri: branding.logoUrl } : fallbackLogo;
  return <View style={[styles.frame, { width: size, height: size }]}>
    <Image
      accessibilityLabel={`${branding.foundationName} logo`}
      onError={() => setFailed(true)}
      resizeMode="contain"
      source={source}
      style={styles.image}
    />
  </View>;
}

const styles = StyleSheet.create({
  frame: { alignItems: "center", justifyContent: "center" },
  image: { height: "100%", width: "100%" },
});
