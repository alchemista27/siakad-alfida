import { useFonts } from "expo-font";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StatusBar as NativeStatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { AttendanceApiError, getTodayAttendance, nextAttendanceAction, overtimeStatus, submitAttendance, type AttendanceContext } from "./src/lib/attendance-api";
import { AlmatsuratCard } from "./src/components/almatsurat-card";
import { FoundationLogo } from "./src/components/foundation-logo";
import { ProfilePage } from "./src/components/profile-page";
import { HijriCalendarCard } from "./src/components/hijri-calendar-card";
import { PrayerTimesCard } from "./src/components/prayer-times-card";
import { getAuthProfile, type AuthProfile } from "./src/lib/auth-profile";
import { SIMPEG_API_URL } from "./src/lib/config";
import { getFoundationBranding, type FoundationBranding } from "./src/lib/foundation-branding";
import { clearMobileAccessToken, getMobileAccessToken, loginWithAuthCredentials } from "./src/lib/mobile-auth";
import { validateLocationFix } from "./src/lib/location-policy";
import { validatePrayerLocation, type PrayerLocation } from "./src/lib/prayer-location";
import { prayerTimesFor, type PrayerSlot } from "./src/lib/prayer-times";
import { colors, radius, space } from "./src/theme/tokens";

type MobileUser = { id: string; fullName: string; email: string };
type NoticeState = { text: string; kind: "error" | "success" | "info" };
type MobilePage = "attendance" | "calendar" | "prayer" | "almatsurat" | "profile";

const NAVIGATION: Array<{ id: MobilePage; sidebarLabel: string; title: string }> = [
  { id: "attendance", sidebarLabel: "Absensi", title: "Absensi hari ini" },
  { id: "calendar", sidebarLabel: "Kalender Hijriyah", title: "Kalender Hijriyah" },
  { id: "prayer", sidebarLabel: "Jadwal Salat", title: "Jadwal Salat" },
  { id: "almatsurat", sidebarLabel: "Al-Ma’tsurat", title: "Al-Ma’tsurat" },
  { id: "profile", sidebarLabel: "Profil", title: "Profil Saya" },
];

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
  const [branding, setBranding] = useState<FoundationBranding>({ foundationName: "Yayasan Alfida", logoUrl: null });
  const [activePage, setActivePage] = useState<MobilePage>("attendance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const passwordInputRef = useRef<any>(null);
  const [user, setUser] = useState<MobileUser | null>(null);
  const [context, setContext] = useState<AttendanceContext | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [busy, setBusy] = useState(true);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [prayerLocation, setPrayerLocation] = useState<PrayerLocation | null>(null);
  const [prayerNotice, setPrayerNotice] = useState<NoticeState | null>(null);
  const [prayerBusy, setPrayerBusy] = useState(false);
  const [prayerNow, setPrayerNow] = useState(() => new Date());
  const prayerRequestVersion = useRef(0);
  const androidStatusBarInset = Platform.OS === "android" ? (NativeStatusBar.currentHeight ?? 0) : 0;

  useEffect(() => {
    const timer = setInterval(() => setPrayerNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    let active = true;
    void getFoundationBranding().then(next => { if (active) setBranding(next); });
    return () => { active = false; };
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
      setPrayerNotice(null);
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

  const loadProfile = useCallback(async (accessToken: string) => {
    setProfileBusy(true);
    setProfileError(null);
    try {
      const nextProfile = await getAuthProfile(accessToken);
      setProfile(nextProfile);
      setUser({ id: nextProfile.id, fullName: nextProfile.fullName, email: nextProfile.email });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Profil belum dapat dimuat.";
      if (message.startsWith("Sesi berakhir")) {
        await clearMobileAccessToken();
        setToken(null);
        setUser(null);
        setProfile(null);
        setNotice({ text: message, kind: "error" });
      } else {
        setProfileError(message);
      }
    } finally {
      setProfileBusy(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getMobileAccessToken().then(stored => {
      if (!active) return;
      setToken(stored);
      if (stored) { void loadContext(stored); void loadProfile(stored); }
      else { setBusy(false); }
    }).catch(() => {
      if (active) { setNotice({ text: "Penyimpanan sesi tidak tersedia. Coba lagi.", kind: "error" }); setBusy(false); }
    });
    return () => { active = false; };
  }, [loadContext, loadProfile]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (state !== "active") return;
      setPrayerNow(new Date());
      prayerRequestVersion.current += 1;
      setPrayerBusy(false);
      setPrayerLocation(null);
      setPrayerNotice(null);
      if (token && !busy) void loadContext(token);
    });
    return () => subscription.remove();
  }, [token, busy, loadContext]);

  const handleLogin = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const session = await loginWithAuthCredentials(emailOrUsername, password);
      setPassword("");
      setToken(session.token);
      setUser(session.user);
      await Promise.all([loadContext(session.token), loadProfile(session.token)]);
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
    setPrayerNotice(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (requestVersion !== prayerRequestVersion.current) return;
      if (permission.status !== "granted") throw new Error("Izin lokasi diperlukan untuk melihat jadwal salat.");

      let hasFallback = false;
      try {
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: 15 * 60 * 1000,
          requiredAccuracy: 5_000,
        });
        if (requestVersion !== prayerRequestVersion.current) return;
        if (lastKnown) {
          setPrayerLocation(validatePrayerLocation(lastKnown, Date.now(), 15 * 60 * 1000));
          setPrayerNow(new Date());
          setPrayerNotice({ kind: "info", text: "Menggunakan lokasi terakhir sambil memperbarui lokasi perangkat." });
          hasFallback = true;
        }
      } catch {
        // Cached location is optional; continue with a fresh location request.
      }

      try {
        const position = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            mayShowUserSettingsDialog: true,
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Waktu mengambil lokasi habis. Coba lagi.")), 15_000)),
        ]);
        if (requestVersion !== prayerRequestVersion.current) return;
        setPrayerLocation(validatePrayerLocation(position, Date.now()));
        setPrayerNow(new Date());
        setPrayerNotice(null);
      } catch (error) {
        if (requestVersion === prayerRequestVersion.current && !hasFallback) {
          setPrayerNotice({ kind: "error", text: error instanceof Error ? error.message : "Lokasi belum dapat diperoleh. Coba lagi." });
        }
      }
    } catch (error) {
      if (requestVersion === prayerRequestVersion.current) {
        setPrayerNotice({ kind: "error", text: error instanceof Error ? error.message : "Jadwal salat gagal dimuat. Coba lagi." });
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
    setPrayerNotice(null);
  };

  if (!fontsLoaded && !fontError) {
    return <SafeAreaView style={styles.safeArea}><ActivityIndicator style={styles.loading} color={colors.tertiary} accessibilityLabel="Memuat aplikasi" /></SafeAreaView>;
  }

  if (!token) return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {/* app.json applies softwareKeyboardLayoutMode: "resize" on Android. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={androidStatusBarInset}
        style={styles.loginKeyboard}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[styles.loginScrollContent, keyboardVisible && styles.loginScrollKeyboardOpen]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginCard}>
            <FoundationLogo branding={branding} size={keyboardVisible ? 72 : 112} />
            <Text style={styles.loginTitle}>Masuk ke SIMPEG</Text>
            {notice?.kind === "error" ? <Notice notice={notice} /> : null}
            <View style={styles.loginForm}>
              <Text style={styles.inputLabel}>Email atau username</Text>
              <TextInput
                accessibilityLabel="Email atau username"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                editable={!busy}
                onChangeText={setEmailOrUsername}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                placeholder="nama@alfida.or.id atau username"
                placeholderTextColor="#737373"
                returnKeyType="next"
                style={styles.input}
                value={emailOrUsername}
              />
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordField}>
                <TextInput
                  ref={passwordInputRef}
                  accessibilityLabel="Password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  editable={!busy}
                  onChangeText={setPassword}
                  onSubmitEditing={() => void handleLogin()}
                  placeholder="Masukkan password"
                  placeholderTextColor="#737373"
                  returnKeyType="go"
                  secureTextEntry={!passwordVisible}
                  style={styles.passwordInput}
                  value={password}
                />
                {passwordVisible ? <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Sembunyikan password"
                  disabled={busy}
                  onPress={() => setPasswordVisible(false)}
                  style={styles.passwordToggle}
                ><Text style={styles.passwordToggleText}>Sembunyikan</Text></Pressable> : <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tampilkan password"
                  disabled={busy}
                  onPress={() => setPasswordVisible(true)}
                  style={styles.passwordToggle}
                ><Text style={styles.passwordToggleText}>Tampilkan</Text></Pressable>}
              </View>
            </View>
            <Pressable accessibilityRole="button" style={[styles.button, busy && styles.disabled]} onPress={() => void handleLogin()} disabled={busy}>
              <Text style={styles.buttonText}>{busy ? "Memproses…" : "Masuk"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  const currentPage = NAVIGATION.find(item => item.id === activePage) ?? NAVIGATION[0];
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Modal animationType="slide" transparent visible={sidebarOpen} onRequestClose={() => setSidebarOpen(false)}>
        <View style={styles.drawerOverlay}>
          <View accessibilityRole="menu" style={styles.sidebar}>
            <FoundationLogo branding={branding} size={56} />
            <Text style={styles.sidebarUser}>{user?.fullName ?? "Pegawai Alfida"}</Text>
            {NAVIGATION.map(item => <Pressable
              key={item.id}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: activePage === item.id }}
              onPress={() => { setActivePage(item.id); setSidebarOpen(false); }}
              style={[styles.sidebarItem, activePage === item.id && styles.sidebarItemActive]}
            ><Text style={[styles.sidebarItemText, activePage === item.id && styles.sidebarItemTextActive]}>{item.sidebarLabel}</Text></Pressable>)}
            <View style={styles.sidebarDivider} />
            <Pressable accessibilityRole="button" onPress={() => { setSidebarOpen(false); void logout(); }} style={styles.sidebarItem}>
              <Text style={styles.sidebarLogout}>Keluar dari perangkat ini</Text>
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Tutup menu" style={styles.drawerScrim} onPress={() => setSidebarOpen(false)} />
        </View>
      </Modal>
      <View style={[styles.topBar, { paddingTop: space.md + androidStatusBarInset }]}>
        <Brand compact />
        <Pressable accessibilityRole="button" accessibilityLabel="Buka menu" onPress={() => setSidebarOpen(true)} style={styles.menuButton}>
          <Text style={styles.menuButtonText}>Menu</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.pageContent}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{currentPage.title.toUpperCase()}</Text>
          <Text style={styles.title}>{activePage === "attendance" && user?.fullName ? `Selamat datang, ${user.fullName}.` : currentPage.title}</Text>
          {activePage === "attendance" ? <Text style={styles.copy}>{context ? `${context.unitName} · ${context.date} (WIB)` : "Memuat konteks kerja…"}</Text> : null}
        </View>
        {notice ? <Notice notice={notice} /> : null}
        {activePage === "attendance" && <View style={styles.attendanceDashboard}>
          {busy ? <View style={styles.card}><ActivityIndicator color={colors.tertiary} accessibilityLabel="Memuat absensi" /></View> : context ? <>
            <View style={styles.attendanceHero}>
              <Text style={styles.cardLabel}>PRESENSI HARI INI</Text>
              <Text style={styles.attendanceHeroTitle}>{context.workday.required ? "Siap menjalani hari kerja." : "Tidak ada presensi wajib."}</Text>
              <Text style={styles.attendanceHeroCopy}>{context.workday.reason}</Text>
              <View style={styles.statusRing}>
                <Text style={styles.statusRingLabel}>{action ? "STATUS" : "SELESAI"}</Text>
                <Text style={styles.statusRingValue}>{action === "check-in" ? "Belum masuk" : action === "check-out" ? "Sedang bekerja" : "Tuntas"}</Text>
              </View>
              {action ? <Pressable accessibilityRole="button" style={styles.quickAction} onPress={() => void handleAttendance()}>
                <Text style={styles.quickActionText}>{action === "check-in" ? "Check-in sekarang" : "Check-out sekarang"}</Text>
              </Pressable> : null}
            </View>
            <View style={styles.attendanceMetrics}>
              <Metric label="CHECK-IN" value={clock(context.attendance?.checkInTime)} />
              <Metric label="CHECK-OUT" value={clock(context.attendance?.checkOutTime)} />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Jadwal kerja</Text>
              <Text style={styles.cardTitle}>{context.unitName}</Text>
              <Detail label="Jam kerja" value={schedule ? `${schedule.startTime ?? "—"}–${schedule.endTime ?? "—"} WIB` : "Belum dikonfigurasi"} />
              <Detail label="Toleransi masuk" value={schedule?.lateGraceMinutes == null ? "—" : `${schedule.lateGraceMinutes} menit`} />
              <Detail label="Mulai lembur" value={schedule?.overtimeStartTime ? `${schedule.overtimeStartTime} WIB` : "Belum diatur"} />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Riwayat hari ini</Text>
              <Detail label="Masuk" value={clock(context.attendance?.checkInTime)} />
              <Detail label="Keluar" value={clock(context.attendance?.checkOutTime)} />
              <Text style={styles.overtime}>{overtimeStatus(context)}</Text>
            </View>
          </> : <View style={styles.card}>
            <Text style={styles.copy}>Konteks absensi belum tersedia.</Text>
            <Pressable accessibilityRole="button" onPress={() => void loadContext(token)} style={styles.secondaryButton}><Text style={styles.secondaryText}>Coba lagi</Text></Pressable>
          </View>}
        </View>}
        {activePage === "calendar" && <HijriCalendarCard now={prayerNow} timeZone={timezone} />}
        {activePage === "prayer" && <View style={styles.prayerSection}>
          {prayerSlots && activePrayerLocation && timezone ? <PrayerTimesCard slots={prayerSlots} timezone={timezone} accuracyMeters={activePrayerLocation.accuracyMeters} /> : null}
          {!prayerSlots && !prayerNotice && !prayerCalculationError ? <Text style={styles.copy}>Jadwal salat dihitung dari lokasi perangkat. Ketuk tombol untuk mengambil lokasi.</Text> : null}
          {prayerCalculationError ? <Notice notice={{ kind: "error", text: prayerCalculationError }} /> : null}
          {prayerNotice ? <Notice notice={prayerNotice} /> : null}
          {!timezone ? <Text style={styles.copy}>Zona waktu perangkat tidak tersedia. Aktifkan zona waktu otomatis untuk melihat jam setempat.</Text> : null}
          <Pressable accessibilityRole="button" style={[styles.button, prayerBusy && styles.disabled]} disabled={prayerBusy} onPress={() => void loadPrayerLocation()}>
            <Text style={styles.buttonText}>{prayerBusy ? "Mengambil lokasi…" : activePrayerLocation ? "Perbarui lokasi salat" : "Tampilkan jadwal salat"}</Text>
          </Pressable>
        </View>}
        {activePage === "almatsurat" && <AlmatsuratCard />}
        {activePage === "profile" && <ProfilePage error={profileError} loading={profileBusy} onRetry={() => void loadProfile(token)} profile={profile} />}
        {activePage === "attendance" ? <Text style={styles.footnote}>Lokasi diambil baru setiap presensi. Deteksi lokasi mock bukan jaminan keaslian GPS.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <View style={[styles.brandRow, compact && styles.compactBrandRow]}><View style={styles.mark}><Text style={styles.markText}>A</Text></View>{!compact ? <View><Text style={styles.eyebrow}>YAYASAN ALFIDA</Text><Text style={styles.brand}>SIMPEG</Text></View> : <Text style={styles.brand}>SIMPEG</Text>}</View>;
}
function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metricCard}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}
function Notice({ notice }: { notice: NoticeState }) {
  return <View accessibilityRole="alert" style={[styles.notice, notice.kind === "success" && styles.successNotice]}><Text style={styles.noticeText}>{notice.text}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral },
  loading: { flex: 1 },
  loginKeyboard: { flex: 1 },
  loginScrollContent: { flexGrow: 1, justifyContent: "center", padding: space.lg },
  loginScrollKeyboardOpen: { justifyContent: "flex-start", paddingBottom: space.lg, paddingTop: space.md },
  loginCard: { alignSelf: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, gap: space.md, maxWidth: 440, padding: space.lg, width: "100%" },
  loginTitle: { color: colors.primary, fontFamily: "Lora", fontSize: 28, fontWeight: "700", textAlign: "center" },
  container: { flexGrow: 1, paddingHorizontal: space.lg, paddingVertical: space.lg, justifyContent: "center", gap: space.md },
  pageContent: { flexGrow: 1, padding: space.lg, gap: space.md },
  attendanceDashboard: { gap: space.md },
  attendanceHero: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, gap: space.sm, padding: space.lg },
  attendanceHeroTitle: { color: colors.primary, fontFamily: "Lora", fontSize: 24, fontWeight: "700", textAlign: "center" },
  attendanceHeroCopy: { color: colors.primary, fontFamily: "Inter", fontSize: 14, lineHeight: 21, textAlign: "center" },
  statusRing: { alignItems: "center", backgroundColor: colors.neutral, borderColor: colors.tertiary, borderRadius: 90, borderWidth: 1, height: 152, justifyContent: "center", marginVertical: space.sm, padding: space.md, width: 152 },
  statusRingLabel: { color: colors.tertiary, fontFamily: "Inter", fontSize: 11, fontWeight: "700", letterSpacing: 1.2 },
  statusRingValue: { color: colors.primary, fontFamily: "Lora", fontSize: 19, fontWeight: "700", textAlign: "center" },
  quickAction: { alignItems: "center", backgroundColor: colors.tertiary, borderRadius: radius.sm, paddingHorizontal: 20, paddingVertical: 12, width: "100%" },
  quickActionText: { color: colors.onTertiary, fontFamily: "Inter", fontSize: 15, fontWeight: "700" },
  attendanceMetrics: { flexDirection: "row", gap: space.sm },
  metricCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flex: 1, gap: 4, padding: space.md },
  metricLabel: { color: colors.tertiary, fontFamily: "Inter", fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  metricValue: { color: colors.primary, fontFamily: "Lora", fontSize: 17, fontWeight: "700" },
  topBar: { alignItems: "center", backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: space.lg, paddingVertical: space.md },
  menuButton: { alignItems: "center", borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, justifyContent: "center", minHeight: 44, minWidth: 44, paddingHorizontal: space.md, paddingVertical: space.sm },
  menuButtonText: { color: colors.tertiary, fontFamily: "Inter", fontSize: 13, fontWeight: "700" },
  drawerOverlay: { flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.24)" },
  sidebar: { backgroundColor: colors.neutral, borderRightColor: colors.border, borderRightWidth: 1, gap: space.sm, minWidth: "78%", paddingHorizontal: space.lg, paddingTop: 56 },
  drawerScrim: { flex: 1 },
  sidebarUser: { color: colors.primary, fontFamily: "Inter", fontSize: 13, marginBottom: space.md },
  sidebarItem: { borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: 14 },
  sidebarItemActive: { backgroundColor: colors.tertiary },
  sidebarItemText: { color: colors.primary, fontFamily: "Inter", fontSize: 15, fontWeight: "700" },
  sidebarItemTextActive: { color: colors.onTertiary },
  sidebarDivider: { backgroundColor: colors.border, height: 1, marginVertical: space.sm },
  sidebarLogout: { color: colors.tertiary, fontFamily: "Inter", fontSize: 14, fontWeight: "700" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.lg },
  compactBrandRow: { marginBottom: 0 },
  mark: { width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: colors.tertiary, borderRadius: radius.sm },
  markText: { fontFamily: "Inter", color: colors.onTertiary, fontWeight: "700", fontSize: 20 },
  eyebrow: { fontFamily: "Inter", fontSize: 10, color: colors.tertiary, fontWeight: "700", letterSpacing: 1.4 },
  brand: { fontFamily: "Inter", fontSize: 17, color: colors.primary, fontWeight: "700" },
  hero: { gap: space.md, marginVertical: space.lg },
  loginForm: { gap: space.sm },
  inputLabel: { fontFamily: "Inter", color: colors.primary, fontSize: 13, fontWeight: "700" },
  input: { borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, backgroundColor: colors.surface, color: colors.primary, fontFamily: "Inter", fontSize: 15, paddingHorizontal: space.md, paddingVertical: 12 },
  passwordField: { alignItems: "center", borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, flexDirection: "row" },
  passwordInput: { color: colors.primary, flex: 1, fontFamily: "Inter", fontSize: 15, paddingHorizontal: space.md, paddingVertical: 12 },
  passwordToggle: { paddingHorizontal: space.md, paddingVertical: 12 },
  passwordToggleText: { color: colors.tertiary, fontFamily: "Inter", fontSize: 12, fontWeight: "700" },
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
