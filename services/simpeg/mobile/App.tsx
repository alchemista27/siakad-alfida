import { useFonts } from "expo-font";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { AttendanceApiError, getTodayAttendance, nextAttendanceAction, overtimeStatus, submitAttendance, type AttendanceContext } from "./src/lib/attendance-api";
import { AlmatsuratCard } from "./src/components/almatsurat-card";
import { HijriCalendarCard } from "./src/components/hijri-calendar-card";
import { PrayerTimesCard } from "./src/components/prayer-times-card";
import { SIMPEG_API_URL } from "./src/lib/config";
import { clearMobileAccessToken, getMobileAccessToken, startMobileLogin } from "./src/lib/mobile-auth";
import { validateLocationFix } from "./src/lib/location-policy";
import { validatePrayerLocation, type PrayerLocation } from "./src/lib/prayer-location";
import { prayerTimesFor, type PrayerSlot } from "./src/lib/prayer-times";
import { colors, radius, space } from "./src/theme/tokens";

type MobileUser = { id: string; fullName: string; email: string };
type NoticeState = { text: string; kind: "error" | "success" | "info" };

function clock(value?: string | null): string {
  if (!value) return "Belum ada";
  const time = new Date(value);
  return Number.isFinite(time.getTime())
    ? new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(time) + " WIB"
    : "Tidak tersedia";
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Lora: require("./assets/fonts/Lora.ttf"),
    Inter: require("./assets/fonts/Inter.ttf"),
  });
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<MobileUser | null>(null);
  const [context, setContext] = useState<AttendanceContext | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [busy, setBusy] = useState(true);
  const [prayerLocation, setPrayerLocation] = useState<PrayerLocation | null>(null);
  const [prayerError, setPrayerError] = useState<string | null>(null);
  const [prayerBusy, setPrayerBusy] = useState(false);
  const [prayerNow, setPrayerNow] = useState(() => new Date());
  const prayerRequestVersion = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => setPrayerNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const handleError = useCallback(async (error: unknown, fallback: string) => {
    if (error instanceof AttendanceApiError && error.status === 401) {
      await clearMobileAccessToken();
      setToken(null);
      setUser(null);
      setContext(null);
      prayerRequestVersion.current += 1;
      setPrayerBusy(false);
      setPrayerLocation(null);
      setPrayerError(null);
      setNotice({ text: "Sesi berakhir. Masuk kembali melalui Auth Alfida.", kind: "error" });
      return;
    }
    setNotice({ text: error instanceof Error ? error.message : fallback, kind: "error" });
  }, []);

  const loadContext = useCallback(async (accessToken: string): Promise<boolean> => {
    setBusy(true);
    try {
      setContext(await getTodayAttendance(SIMPEG_API_URL, accessToken));
      return true;
    } catch (error) {
      await handleError(error, "Gagal memuat status absensi.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [handleError]);

  useEffect(() => {
    let active = true;
    getMobileAccessToken().then(stored => {
      if (!active) return;
      setToken(stored);
      if (stored) void loadContext(stored);
      else { setNotice({ text: "Masuk melalui Auth Alfida untuk melihat absensi.", kind: "info" }); setBusy(false); }
    }).catch(() => {
      if (active) { setNotice({ text: "Penyimpanan sesi tidak tersedia. Coba lagi.", kind: "error" }); setBusy(false); }
    });
    return () => { active = false; };
  }, [loadContext]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (state !== "active") return;
      setPrayerNow(new Date());
      prayerRequestVersion.current += 1;
      setPrayerBusy(false);
      setPrayerLocation(null);
      if (token && !busy) void loadContext(token);
    });
    return () => subscription.remove();
  }, [token, busy, loadContext]);

  const handleLogin = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const session = await startMobileLogin();
      setToken(session.token);
      setUser(session.user);
      await loadContext(session.token);
    } catch (error) {
      await handleError(error, "Tidak dapat masuk ke SIMPEG.");
      setBusy(false);
    }
  };

  const handleAttendance = async () => {
    if (!token || !context || busy || !nextAttendanceAction(context)) return;
    setBusy(true);
    setNotice(null);
    try {
      // Re-read server workday/record immediately before submitting; no backdated action.
      const current = await getTodayAttendance(SIMPEG_API_URL, token);
      setContext(current);
      const action = nextAttendanceAction(current);
      if (!action) throw new Error("Presensi hari ini sudah selesai atau tidak diwajibkan.");
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") throw new Error("Izin lokasi diperlukan untuk absensi.");
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { mockStatus, ...location } = validateLocationFix(position, Date.now(), current.config?.radiusMeters);
      await submitAttendance(SIMPEG_API_URL, token, action, location);
      if (await loadContext(token)) {
        const success = action === "check-in" ? "Check-in berhasil dicatat." : "Check-out berhasil dicatat.";
        setNotice({ text: mockStatus === "tidak dapat diverifikasi" ? `${success} Status mock GPS tidak dapat diverifikasi di perangkat ini.` : success, kind: "success" });
      }
    } catch (error) {
      await handleError(error, "Absensi gagal dikirim.");
      setBusy(false);
    }
  };

  const loadPrayerLocation = async () => {
    if (prayerBusy) return;
    const requestVersion = ++prayerRequestVersion.current;
    setPrayerBusy(true);
    setPrayerError(null);
    setPrayerLocation(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (requestVersion !== prayerRequestVersion.current) return;
      if (permission.status !== "granted") throw new Error("Izin lokasi diperlukan untuk melihat jadwal salat.");
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (requestVersion !== prayerRequestVersion.current) return;
      setPrayerLocation(validatePrayerLocation(position, Date.now()));
      setPrayerNow(new Date());
    } catch (error) {
      if (requestVersion === prayerRequestVersion.current) {
        setPrayerError(error instanceof Error ? error.message : "Jadwal salat gagal dimuat. Coba lagi.");
      }
    } finally {
      if (requestVersion === prayerRequestVersion.current) setPrayerBusy(false);
    }
  };

  const logout = async () => {
    prayerRequestVersion.current += 1;
    setPrayerBusy(false);
    await clearMobileAccessToken();
    setToken(null);
    setUser(null);
    setContext(null);
    setNotice(null);
    setPrayerLocation(null);
    setPrayerError(null);
  };

  if (!fontsLoaded && !fontError) {
    return <SafeAreaView style={styles.safeArea}><ActivityIndicator style={styles.loading} color={colors.tertiary} accessibilityLabel="Memuat aplikasi" /></SafeAreaView>;
  }

  if (!token) return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Brand />
        <View style={styles.hero}>
          <Text style={styles.kicker}>ABSENSI PEGAWAI</Text>
          <Text style={styles.title}>Hari kerja, tercatat dengan jelas.</Text>
          <Text style={styles.copy}>Masuk melalui Auth Alfida. Kredensial Anda tetap di halaman Auth; aplikasi ini hanya menyimpan token akses pada penyimpanan aman perangkat.</Text>
        </View>
        {notice ? <Notice notice={notice} /> : null}
        <Pressable accessibilityRole="button" style={[styles.button, busy && styles.disabled]} onPress={() => void handleLogin()} disabled={busy}>
          <Text style={styles.buttonText}>{busy ? "Memuat…" : "Masuk dengan Auth Alfida"}</Text>
        </Pressable>
        <Text style={styles.footnote}>SSO • PKCE • Lokasi diminta saat presensi</Text>
      </View>
    </SafeAreaView>
  );

  const action = context ? nextAttendanceAction(context) : null;
  const schedule = context?.workSchedule;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const activePrayerLocation = prayerLocation;
  let prayerSlots: PrayerSlot[] | null = null;
  let prayerCalculationError: string | null = null;
  if (activePrayerLocation) {
    try {
      prayerSlots = prayerTimesFor(activePrayerLocation, prayerNow);
    } catch (error) {
      prayerCalculationError = error instanceof Error ? error.message : "Jadwal salat belum tersedia untuk lokasi ini.";
    }
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Brand />
        <View style={styles.header}>
          <Text style={styles.kicker}>ABSENSI HARI INI</Text>
          <Text style={styles.title}>{user?.fullName ? `Selamat datang, ${user.fullName}.` : "Presensi Anda hari ini."}</Text>
          <Text style={styles.copy}>{context ? `${context.unitName} · ${context.date} (WIB)` : "Memuat konteks kerja…"}</Text>
        </View>
        {notice ? <Notice notice={notice} /> : null}
        <View style={styles.card}>
          {busy ? <ActivityIndicator color={colors.tertiary} accessibilityLabel="Memuat absensi" /> : context ? <>
            <Text style={styles.cardLabel}>STATUS KERJA</Text>
            <Text style={styles.cardTitle}>{context.workday.required ? "Hari kerja aktif" : "Tidak wajib presensi"}</Text>
            <Text style={styles.copy}>{context.workday.reason}</Text>
            <View style={styles.divider} />
            <Detail label="Masuk" value={clock(context.attendance?.checkInTime)} />
            <Detail label="Keluar" value={clock(context.attendance?.checkOutTime)} />
            <View style={styles.divider} />
            <Text style={styles.cardLabel}>JADWAL UNIT</Text>
            <Detail label="Jam kerja" value={schedule ? `${schedule.startTime ?? "—"}–${schedule.endTime ?? "—"} WIB` : "Belum dikonfigurasi"} />
            <Detail label="Toleransi masuk" value={schedule?.lateGraceMinutes == null ? "—" : `${schedule.lateGraceMinutes} menit`} />
            <Detail label="Mulai lembur" value={schedule?.overtimeStartTime ? `${schedule.overtimeStartTime} WIB` : "Belum diatur"} />
            <Text style={styles.overtime}>{overtimeStatus(context)}</Text>
            {action ? <Pressable accessibilityRole="button" style={[styles.button, busy && styles.disabled]} onPress={() => void handleAttendance()} disabled={busy}>
              <Text style={styles.buttonText}>{action === "check-in" ? "Check-in dengan lokasi" : "Check-out dengan lokasi"}</Text>
            </Pressable> : null}
          </> : <>
            <Text style={styles.copy}>Konteks absensi belum tersedia.</Text>
            <Pressable accessibilityRole="button" onPress={() => void loadContext(token)} style={styles.secondaryButton}><Text style={styles.secondaryText}>Coba lagi</Text></Pressable>
          </>}
        </View>
        <HijriCalendarCard now={prayerNow} timeZone={timezone} />
        <View style={styles.prayerSection}>
          {prayerSlots && activePrayerLocation && timezone ? <PrayerTimesCard slots={prayerSlots} timezone={timezone} accuracyMeters={activePrayerLocation.accuracyMeters} /> : null}
          {!prayerSlots && !prayerError && !prayerCalculationError ? <Text style={styles.copy}>Jadwal salat dihitung dari lokasi perangkat. Ketuk tombol untuk mengambil lokasi.</Text> : null}
          {prayerError || prayerCalculationError ? <Notice notice={{ kind: "error", text: prayerError ?? prayerCalculationError ?? "" }} /> : null}
          {!timezone ? <Text style={styles.copy}>Zona waktu perangkat tidak tersedia. Aktifkan zona waktu otomatis untuk melihat jam setempat.</Text> : null}
          <Pressable accessibilityRole="button" style={[styles.button, prayerBusy && styles.disabled]} disabled={prayerBusy} onPress={() => void loadPrayerLocation()}>
            <Text style={styles.buttonText}>{prayerBusy ? "Mengambil lokasi…" : activePrayerLocation ? "Perbarui lokasi salat" : "Tampilkan jadwal salat"}</Text>
          </Pressable>
        </View>
        <AlmatsuratCard />
        <Text style={styles.footnote}>Lokasi diambil baru setiap presensi. Deteksi lokasi mock bukan jaminan keaslian GPS.</Text>
        <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => void logout()} disabled={busy}><Text style={styles.secondaryText}>Keluar dari perangkat ini</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Brand() {
  return <View style={styles.brandRow}><View style={styles.mark}><Text style={styles.markText}>A</Text></View><View><Text style={styles.eyebrow}>YAYASAN ALFIDA</Text><Text style={styles.brand}>SIMPEG</Text></View></View>;
}
function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}
function Notice({ notice }: { notice: NoticeState }) {
  return <View accessibilityRole="alert" style={[styles.notice, notice.kind === "success" && styles.successNotice]}><Text style={styles.noticeText}>{notice.text}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral },
  loading: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: space.lg, paddingVertical: space.lg, justifyContent: "center", gap: space.md },
  brandRow: { flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.lg },
  mark: { width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: colors.tertiary, borderRadius: radius.sm },
  markText: { fontFamily: "Inter", color: colors.onTertiary, fontWeight: "700", fontSize: 20 },
  eyebrow: { fontFamily: "Inter", fontSize: 10, color: colors.tertiary, fontWeight: "700", letterSpacing: 1.4 },
  brand: { fontFamily: "Inter", fontSize: 17, color: colors.primary, fontWeight: "700" },
  hero: { gap: space.md, marginVertical: space.lg },
  header: { gap: space.sm, marginBottom: space.sm },
  kicker: { fontFamily: "Inter", color: colors.tertiary, fontSize: 11, letterSpacing: 1.5, fontWeight: "700" },
  title: { fontFamily: "Lora", color: colors.primary, fontSize: 30, lineHeight: 39, fontWeight: "700" },
  copy: { fontFamily: "Inter", color: colors.primary, fontSize: 15, lineHeight: 23 },
  card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: space.lg, borderRadius: radius.md, gap: space.sm },
  prayerSection: { gap: space.sm },
  cardLabel: { fontFamily: "Inter", color: colors.tertiary, fontSize: 11, letterSpacing: 1.2, fontWeight: "700" },
  cardTitle: { fontFamily: "Lora", color: colors.primary, fontSize: 21, fontWeight: "700" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.sm },
  detailRow: { flexDirection: "row", justifyContent: "space-between", gap: space.md, alignItems: "flex-start" },
  detailLabel: { fontFamily: "Inter", color: colors.primary, fontSize: 13, flex: 1 },
  detailValue: { fontFamily: "Inter", color: colors.primary, fontSize: 13, fontWeight: "600", textAlign: "right", flex: 2 },
  overtime: { fontFamily: "Inter", color: colors.tertiary, fontSize: 14, fontWeight: "600", marginTop: space.sm },
  notice: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: space.md, borderRadius: radius.md },
  successNotice: { borderColor: colors.tertiary },
  noticeText: { fontFamily: "Inter", color: colors.primary, fontSize: 14, lineHeight: 20 },
  button: { alignItems: "center", marginTop: space.sm, paddingVertical: 14, paddingHorizontal: space.md, backgroundColor: colors.tertiary, borderRadius: radius.sm },
  disabled: { opacity: 0.55 },
  buttonText: { fontFamily: "Inter", color: colors.onTertiary, fontWeight: "700", fontSize: 15 },
  secondaryButton: { alignItems: "center", paddingVertical: 12 },
  secondaryText: { fontFamily: "Inter", color: colors.tertiary, fontWeight: "700" },
  footnote: { fontFamily: "Inter", color: colors.primary, fontSize: 12, lineHeight: 18, textAlign: "center" },
});
