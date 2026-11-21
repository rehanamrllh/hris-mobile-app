import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [division, setDivision] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password || !fullName.trim() || !division.trim() || !role.trim()) {
      setError("Nama lengkap, divisi, jabatan, email, dan password wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    const result = await signUp(email, password, fullName, division, role);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Pendaftaran berhasil. Periksa email Anda jika verifikasi diperlukan.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Daftar Akun HRIS</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nama lengkap" editable={!submitting} />
        <TextInput style={styles.input} value={division} onChangeText={setDivision} placeholder="Divisi" editable={!submitting} />
        <TextInput style={styles.input} value={role} onChangeText={setRole} placeholder="Jabatan / role" editable={!submitting} />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" editable={!submitting} />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry editable={!submitting} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable
          style={({ pressed }) => [styles.button, (submitting || pressed) && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Daftar</Text>}
        </Pressable>
        <Link href={"/sign-in" as never} style={styles.link}>Sudah punya akun? Masuk</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "#F3F4F6", padding: 20 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24 },
  title: { fontSize: 24, fontWeight: "700", color: "#1F2937", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, paddingHorizontal: 14, height: 48, marginBottom: 12 },
  error: { color: "#B91C1C", marginBottom: 12 },
  message: { color: "#047857", marginBottom: 12 },
  button: { height: 48, borderRadius: 10, backgroundColor: "#4F46E5", justifyContent: "center", alignItems: "center" },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "#FFFFFF", fontWeight: "700" },
  link: { color: "#4F46E5", textAlign: "center", marginTop: 18, fontWeight: "600" },
});
