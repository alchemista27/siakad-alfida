import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { getTodayAttendance, nextAttendanceAction, submitAttendance, type AttendanceContext } from "./src/lib/attendance-api";
import { SIMPEG_API_URL } from "./src/lib/config";
import { clearMobileAccessToken, getMobileAccessToken, startMobileLogin } from "./src/lib/mobile-auth";

type MobileUser = { id: string; fullName: string; email: string };

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<MobileUser | null>(null);
  const [context, setContext] = useState<AttendanceContext | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  const loadContext = useCallback(async (accessToken: string) => {
    setBusy(true);
    setMessage(null);
    try {
      setContext(await getTodayAttendance(SIMPEG_API_URL, accessToken));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat status absensi.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    getMobileAccessToken().then((stored) => {
      setToken(stored);
      if (stored) void loadContext(stored);
      else setBusy(false);
    });
  }, [loadContext]);

  const handleLogin = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const session = await startMobileLogin();
      setToken(session.token);
      setUser(session.user);
      await loadContext(session.token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tidak dapat masuk ke SIMPEG.");
      setBusy(false);
    }
  };

  const handleAttendance = async () => {
    if (!token || !context) return;
    const action = nextAttendanceAction(context);
    if (!action) return;
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") throw new Error("Izin lokasi diperlukan untuk absensi.");
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      await submitAttendance(SIMPEG_API_URL, token, action, { latitude: position.coords.latitude, longitude: position.coords.longitude });
      await loadContext(token);
      setMessage(action === "check-in" ? "Check-in berhasil dicatat." : "Check-out berhasil dicatat.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Absensi gagal dikirim.");
      setBusy(false);
    }
  };

  const logout = async () => {
    await clearMobileAccessToken();
    setToken(null);
    setUser(null);
    setContext(null);
    setMessage(null);
  };

  if (!token) return <SafeAreaView style={styles.safeArea}><StatusBar style="dark" /><View style={styles.container}><Brand /><View style={styles.hero}><Text style={styles.kicker}>ABSENSI PEGAWAI</Text><Text style={styles.title}>Masuk aman ke absensi SIMPEG.</Text><Text style={styles.copy}>Login dibuka melalui Auth Alfida dengan PKCE. Aplikasi tidak pernah menerima atau menyimpan kredensial Anda.</Text></View>{message ? <Notice text={message} /> : null}<Pressable accessibilityRole="button" style={styles.button} onPress={() => void handleLogin()} disabled={busy}><Text style={styles.buttonText}>{busy ? "Memuat…" : "Masuk dengan Auth Alfida"}</Text></Pressable></View></SafeAreaView>;

  const action = context ? nextAttendanceAction(context) : null;
  return <SafeAreaView style={styles.safeArea}><StatusBar style="dark" /><ScrollView contentContainerStyle={styles.container}><Brand /><View style={styles.header}><Text style={styles.kicker}>ABSENSI HARI INI</Text><Text style={styles.title}>Selamat datang{user?.fullName ? `, ${user.fullName}` : ""}.</Text><Text style={styles.copy}>{context ? `${context.unitName} · ${context.date}` : "Memuat konteks kerja…"}</Text></View>{message ? <Notice text={message} /> : null}<View style={styles.card}>{busy ? <ActivityIndicator color="#0f7f6d" /> : context ? <><Text style={styles.cardLabel}>Status kerja</Text><Text style={styles.cardTitle}>{context.workday.required ? "Hari kerja aktif" : "Tidak wajib presensi"}</Text><Text style={styles.copy}>{context.workday.reason}</Text><Text style={styles.detail}>Check-in: {context.attendance?.checkInTime ? new Date(context.attendance.checkInTime).toLocaleTimeString("id-ID") : "Belum ada"}</Text><Text style={styles.detail}>Check-out: {context.attendance?.checkOutTime ? new Date(context.attendance.checkOutTime).toLocaleTimeString("id-ID") : "Belum ada"}</Text>{action ? <Pressable accessibilityRole="button" style={styles.button} onPress={() => void handleAttendance()}><Text style={styles.buttonText}>{action === "check-in" ? "Check-in dengan lokasi" : "Check-out dengan lokasi"}</Text></Pressable> : null}</> : <Text style={styles.copy}>Konteks absensi belum tersedia.</Text>}</View><Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => void logout()}><Text style={styles.secondaryText}>Keluar dari perangkat ini</Text></Pressable></ScrollView></SafeAreaView>;
}

function Brand() { return <View style={styles.brandRow}><View style={styles.mark}><Text style={styles.markText}>A</Text></View><View><Text style={styles.eyebrow}>YAYASAN ALFIDA</Text><Text style={styles.brand}>SIMPEG</Text></View></View>; }
function Notice({ text }: { text: string }) { return <View style={styles.notice}><Text style={styles.noticeText}>{text}</Text></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F8F8" }, container: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 28, justifyContent: "center", gap: 18 }, brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 22 }, mark: { width: 38, height: 38, alignItems: "center", justifyContent: "center", backgroundColor: "#0f7f6d", borderRadius: 6 }, markText: { color: "#fff", fontWeight: "700", fontSize: 20 }, eyebrow: { fontSize: 10, color: "#0f7f6d", fontWeight: "700", letterSpacing: 1.4 }, brand: { fontSize: 17, color: "#454545", fontWeight: "700" }, hero: { gap: 12 }, header: { gap: 7 }, kicker: { color: "#0f7f6d", fontSize: 11, letterSpacing: 1.5, fontWeight: "700" }, title: { color: "#454545", fontSize: 30, lineHeight: 39, fontFamily: "serif", fontWeight: "700" }, copy: { color: "#565F60", fontSize: 15, lineHeight: 23 }, card: { borderWidth: 1, borderColor: "#E3E8E7", backgroundColor: "#FFFFFF", padding: 18, borderRadius: 8, gap: 10 }, cardLabel: { color: "#0f7f6d", fontSize: 11, letterSpacing: 1.2, fontWeight: "700" }, cardTitle: { color: "#454545", fontSize: 21, fontFamily: "serif", fontWeight: "700" }, detail: { color: "#454545", fontSize: 14 }, notice: { borderWidth: 1, borderColor: "#E3E8E7", backgroundColor: "#FFFFFF", padding: 14, borderRadius: 6 }, noticeText: { color: "#454545", fontSize: 14, lineHeight: 20 }, button: { alignItems: "center", marginTop: 8, paddingVertical: 14, backgroundColor: "#0f7f6d", borderRadius: 6 }, buttonText: { color: "#fff", fontWeight: "700" }, secondaryButton: { alignItems: "center", paddingVertical: 12 }, secondaryText: { color: "#0f7f6d", fontWeight: "700" },
});
