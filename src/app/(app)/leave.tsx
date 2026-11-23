import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  createLeaveRequest,
  deleteLeaveRequest,
  getMyLeaveRequests,
  updateLeaveRequest,
  type LeaveRequest,
  type LeaveRequestInput,
} from "@/services/leaveRequestApi";

const EMPTY_FORM = {
  type: "",
  start_date: "",
  end_date: "",
  reason: "",
};

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function LeaveContent() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadRequests = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    }

    try {
      const data = await getMyLeaveRequests();
      setRequests(data);
      setErrorMessage(null);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memuat pengajuan cuti.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void getMyLeaveRequests()
      .then((data) => {
        if (isMounted) {
          setRequests(data);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat pengajuan cuti.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateForm = () => {
    setEditingRequest(null);
    setForm({ ...EMPTY_FORM, type: "Cuti Tahunan" });
    setFormVisible(true);
  };

  const openEditForm = (request: LeaveRequest) => {
    setEditingRequest(request);
    setForm({
      type: request.type,
      start_date: request.start_date,
      end_date: request.end_date,
      reason: request.reason,
    });
    setFormVisible(true);
  };

  const handleSave = async () => {
    const input: LeaveRequestInput = {
      type: form.type.trim(),
      start_date: form.start_date.trim(),
      end_date: form.end_date.trim(),
      reason: form.reason.trim(),
    };

    if (!input.type || !input.reason) {
      Alert.alert("Data belum lengkap", "Jenis cuti dan alasan wajib diisi.");
      return;
    }
    if (!isValidDate(input.start_date) || !isValidDate(input.end_date)) {
      Alert.alert(
        "Tanggal tidak valid",
        "Gunakan format tanggal YYYY-MM-DD yang valid.",
      );
      return;
    }
    if (input.end_date < input.start_date) {
      Alert.alert("Rentang tanggal tidak valid", "Tanggal selesai harus sama atau setelah tanggal mulai.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingRequest) {
        await updateLeaveRequest(editingRequest.id, input);
      } else {
        await createLeaveRequest(input);
      }

      setFormVisible(false);
      setEditingRequest(null);
      setForm(EMPTY_FORM);
      await loadRequests(true);
    } catch (error: unknown) {
      Alert.alert(
        "Gagal menyimpan",
        error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (request: LeaveRequest) => {
    Alert.alert(
      "Hapus pengajuan?",
      `Pengajuan "${request.type}" akan dihapus permanen.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setIsSaving(true);
              try {
                await deleteLeaveRequest(request.id);
                await loadRequests(true);
              } catch (error: unknown) {
                Alert.alert(
                  "Gagal menghapus",
                  error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan yang tidak diketahui.",
                );
              } finally {
                setIsSaving(false);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <>
      <View style={styles.content}>
        <View style={styles.actionsRow}>
          <Text style={styles.sectionTitle}>Pengajuan Saya</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={openCreateForm}
            disabled={isSaving}
          >
            <Text style={styles.primaryButtonText}>+ Ajukan Cuti</Text>
          </Pressable>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable
              onPress={() => {
                setIsLoading(true);
                void loadRequests();
              }}
            >
              <Text style={styles.retryText}>Coba lagi</Text>
            </Pressable>
          </View>
        ) : null}

        {isLoading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#4F46E5" />
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => void loadRequests(true)}
                tintColor="#4F46E5"
              />
            }
          >
            {requests.length === 0 && !errorMessage ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Belum ada pengajuan cuti</Text>
                <Text style={styles.emptySubtitle}>
                  Tarik layar ke bawah untuk memperbarui daftar.
                </Text>
              </View>
            ) : null}

            {requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeading}>
                  <Text style={styles.requestType}>{request.type}</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Pending</Text>
                  </View>
                </View>
                <Text style={styles.dates}>
                  {request.start_date} s/d {request.end_date}
                </Text>
                <Text style={styles.reason}>{request.reason}</Text>
                <View style={styles.requestActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openEditForm(request)}
                    disabled={isSaving}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => handleDelete(request)}
                    disabled={isSaving}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Hapus</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <Modal
        visible={formVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFormVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {editingRequest ? "Edit Pengajuan Cuti" : "Form Pengajuan Cuti"}
              </Text>

              <Text style={styles.inputLabel}>Jenis cuti *</Text>
              <TextInput
                style={styles.input}
                value={form.type}
                onChangeText={(type) => setForm((current) => ({ ...current, type }))}
                placeholder="Contoh: Cuti Tahunan"
                maxLength={100}
              />

              <Text style={styles.inputLabel}>Tanggal mulai (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.input}
                value={form.start_date}
                onChangeText={(start_date) =>
                  setForm((current) => ({ ...current, start_date }))
                }
                placeholder="2026-12-01"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Tanggal selesai (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.input}
                value={form.end_date}
                onChangeText={(end_date) =>
                  setForm((current) => ({ ...current, end_date }))
                }
                placeholder="2026-12-03"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Alasan *</Text>
              <TextInput
                style={[styles.input, styles.reasonInput]}
                value={form.reason}
                onChangeText={(reason) => setForm((current) => ({ ...current, reason }))}
                placeholder="Tuliskan alasan pengajuan cuti"
                multiline
                maxLength={1000}
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setFormVisible(false)}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelText}>Batal</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={() => void handleSave()}
                  disabled={isSaving}
                >
                  <Text style={styles.saveText}>
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

export default function LeaveScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Pengajuan Cuti</Text>
        <Text style={styles.subtitle}>Daftar pengajuan milik akun Anda</Text>
      </View>
      <LeaveContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { backgroundColor: "#1E1B4B", padding: 20 },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#C7D2FE", fontSize: 13, marginTop: 4 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 18 },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: { color: "#111827", fontSize: 18, fontWeight: "700" },
  primaryButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  loader: { marginTop: 48 },
  listContent: { paddingBottom: 28, flexGrow: 1 },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  requestHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestType: { color: "#1F2937", fontSize: 16, fontWeight: "700", flex: 1 },
  pendingBadge: { backgroundColor: "#FEF3C7", borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  pendingText: { color: "#92400E", fontWeight: "700", fontSize: 11 },
  dates: { color: "#4B5563", marginTop: 10, fontSize: 13 },
  reason: { color: "#6B7280", marginTop: 6, lineHeight: 20 },
  requestActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 14,
  },
  secondaryButton: { backgroundColor: "#EEF2FF", borderRadius: 7, paddingHorizontal: 14, paddingVertical: 8 },
  secondaryButtonText: { color: "#3730A3", fontWeight: "700" },
  deleteButton: { backgroundColor: "#FEE2E2", borderRadius: 7, paddingHorizontal: 14, paddingVertical: 8 },
  deleteButtonText: { color: "#991B1B", fontWeight: "700" },
  emptyCard: {
    marginTop: 22,
    padding: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
  },
  emptyTitle: { color: "#374151", fontWeight: "700", fontSize: 16 },
  emptySubtitle: { color: "#6B7280", marginTop: 7, textAlign: "center" },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#991B1B" },
  retryText: { color: "#3730A3", fontWeight: "700", marginTop: 8 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    padding: 18,
  },
  modalScroll: { flexGrow: 1, justifyContent: "center" },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 20 },
  modalTitle: { color: "#111827", fontSize: 20, fontWeight: "700", marginBottom: 18 },
  inputLabel: { color: "#374151", fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
  },
  reasonInput: { height: 84, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  modalButton: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 11 },
  cancelButton: { backgroundColor: "#F3F4F6" },
  cancelText: { color: "#374151", fontWeight: "700" },
  saveButton: { backgroundColor: "#4F46E5" },
  saveText: { color: "#FFFFFF", fontWeight: "700" },
});
