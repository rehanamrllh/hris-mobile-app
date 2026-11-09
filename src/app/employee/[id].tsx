import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function EmployeeDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    role?: string;
    division?: string;
    email?: string;
    status?: string;
    avatarBg?: string;
  }>();

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "Active":
        return { bg: "#DEF7EC", text: "#03543F" };
      case "Remote":
        return { bg: "#E1EFFE", text: "#1E40AF" };
      case "On Leave":
        return { bg: "#FEECDC", text: "#9A3412" };
      default:
        return { bg: "#F3F4F6", text: "#374151" };
    }
  };

  const statusStyle = getStatusStyle(params.status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: params.avatarBg || "#4F46E5" },
          ]}
        >
          <Text style={styles.avatarText}>
            {(params.name || "E").substring(0, 2).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{params.name || "Nama Pegawai"}</Text>
        <Text style={styles.role}>{params.role || "Jabatan"}</Text>

        <View
          style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
        >
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {params.status || "Unknown"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>ID Pegawai</Text>
          <Text style={styles.value}>{params.id || "-"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Divisi</Text>
          <Text style={styles.value}>{params.division || "-"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{params.email || "-"}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 10,
    marginRight: 10,
    marginLeft: 10,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  role: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  infoRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
});
