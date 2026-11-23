import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { LeaveContent } from "@/app/(app)/leave";
import {
  clockIn,
  clockOut,
  getMyAttendanceRecords,
  type AttendanceRecord,
} from "@/services/attendanceApi";
import {
  canAccessEmployeeDirectory,
  getAccessRole,
} from "@/lib/authorization";
import { getEmployees } from "@/services/employeeApi";
import type { ExternalEmployee } from "@/types/externalEmployee";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export interface Employee {
  id: string;
  name: string;
  division: string;
  role: string;
  email: string;
  avatarBg: string;
  status: "Active" | "On Leave" | "Remote";
}

const AVATAR_COLORS = [
  "#4F46E5",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
];

const mapExternalEmployeeToEmployee = (
  user: ExternalEmployee,
  index: number,
): Employee => ({
  id: `EMP-${String(user.id).padStart(3, "0")}`,
  name: `${user.firstName} ${user.lastName}`,
  division: user.company.department,
  role: user.company.title,
  email: user.email,
  avatarBg: AVATAR_COLORS[index % AVATAR_COLORS.length],
  status: user.id % 2 === 0 ? "Remote" : "Active",
});

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    name: "Budi Santoso",
    division: "Engineering",
    role: "Senior React Native Developer",
    email: "budi.santoso@company.com",
    avatarBg: "#4F46E5",
    status: "Active",
  },
  {
    id: "EMP-002",
    name: "Siti Rahmawati",
    division: "Human Resources",
    role: "HR Business Partner Manager",
    email: "siti.rahmawati@company.com",
    avatarBg: "#EC4899",
    status: "Active",
  },
  {
    id: "EMP-003",
    name: "Andi Wijaya",
    division: "Product Design",
    role: "Lead UI/UX Designer",
    email: "andi.wijaya@company.com",
    avatarBg: "#10B981",
    status: "Remote",
  },
  {
    id: "EMP-004",
    name: "Dewi Lestari",
    division: "Marketing & PR",
    role: "Digital Marketing Specialist",
    email: "dewi.lestari@company.com",
    avatarBg: "#F59E0B",
    status: "On Leave",
  },
  {
    id: "EMP-005",
    name: "Rian Pratama",
    division: "Engineering",
    role: "DevOps & Cloud Engineer",
    email: "rian.pratama@company.com",
    avatarBg: "#3B82F6",
    status: "Active",
  },
  {
    id: "EMP-006",
    name: "Nadia Putri",
    division: "Finance & Accounting",
    role: "Senior Financial Analyst",
    email: "nadia.putri@company.com",
    avatarBg: "#8B5CF6",
    status: "Active",
  },
];

export default function HRISApp() {
  const router = useRouter();
  const { user } = useAuth();
  const accessRole = getAccessRole(user?.user_metadata);
  const canAccessDirectory = canAccessEmployeeDirectory(accessRole);
  const [activeTab, setActiveTab] = useState<
    "directory" | "attendance" | "leave" | "profile"
  >(canAccessDirectory ? "directory" : "attendance");
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [externalApiCount, setExternalApiCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [isLoading, setIsLoading] = useState(canAccessDirectory);

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [activeAttendanceId, setActiveAttendanceId] = useState<string | null>(
    null,
  );
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [addEmpModalVisible, setAddEmpModalVisible] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [newEmpDivision, setNewEmpDivision] = useState("Engineering");
  const [newEmpEmail, setNewEmpEmail] = useState("");

  useEffect(() => {
    if (!canAccessDirectory) {
      return;
    }

    const controller = new AbortController();

    const loadExternalEmployees = async () => {
      try {
        const { users } = await getEmployees(controller.signal);
        setExternalApiCount(users.length);
        setEmployees(users.map(mapExternalEmployeeToEmployee));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Data pegawai dari External API gagal dimuat.";
        Alert.alert(
          "Gagal Memuat Data",
          `${message} Data lokal akan digunakan.`,
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadExternalEmployees();
    return () => controller.abort();
  }, [canAccessDirectory]);

  useEffect(() => {
    if (activeTab !== "attendance") {
      return;
    }

    void getMyAttendanceRecords()
      .then((records) => {
        setAttendanceLogs(records);
        const today = new Date().toISOString().slice(0, 10);
        const activeRecord = records.find(
          (record) => record.work_date === today && record.check_out === null,
        );
        setActiveAttendanceId(activeRecord?.id ?? null);
        if (activeRecord) {
          setIsCheckedIn(true);
          setCheckInTime(
            new Date(activeRecord.check_in).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
        }
      })
      .catch((error: unknown) => {
        Alert.alert(
          "Gagal Memuat Presensi",
          error instanceof Error ? error.message : "Terjadi kesalahan.",
        );
      });

    const initialClockUpdate = setTimeout(() => {
      setCurrentTime(new Date());
    }, 0);
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearTimeout(initialClockUpdate);
      clearInterval(clockInterval);
    };
  }, [activeTab]);

  const divisions = [
    "All",
    "Engineering",
    "Human Resources",
    "Product Design",
    "Marketing & PR",
    "Finance & Accounting",
  ];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivision =
      selectedDivision === "All" || emp.division === selectedDivision;
    return matchesSearch && matchesDivision;
  });
  const metadata = user?.user_metadata ?? {};
  const profileName =
    typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : user?.email?.split("@")[0] ?? "Pengguna";
  const profileDivision =
    typeof metadata.division === "string" && metadata.division.trim()
      ? metadata.division.trim()
      : "Belum ditentukan";
  const profileRole =
    typeof metadata.role === "string" && metadata.role.trim()
      ? metadata.role.trim()
      : "Pegawai";
  const profileEmployee: Employee = {
    id: user?.id ? `USR-${user.id.substring(0, 8).toUpperCase()}` : "-",
    name: profileName,
    division: profileDivision,
    role: profileRole,
    email: user?.email ?? "-",
    avatarBg: "#4F46E5",
    status: "Active",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleClockToggle = async () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      if (!isCheckedIn) {
        const isLate =
          now.getHours() > 8 ||
          (now.getHours() === 8 && now.getMinutes() > 30);
        const status = isLate ? "Terlambat" : "Tepat Waktu";
        const record = await clockIn(status);
        setActiveAttendanceId(record.id);
        setIsCheckedIn(true);
        setCheckInTime(timeString);
        setAttendanceLogs((current) => [
          record,
          ...current.filter((item) => item.id !== record.id),
        ]);
        Alert.alert(
          "Presensi Berhasil",
          `Anda telah Check-In pada pukul ${timeString}`,
        );
      } else if (activeAttendanceId) {
        const record = await clockOut(activeAttendanceId);
        setIsCheckedIn(false);
        setActiveAttendanceId(null);
        setCheckInTime(null);
        setAttendanceLogs((current) =>
          current.map((item) => (item.id === record.id ? record : item)),
        );
        Alert.alert(
          "Presensi Berhasil",
          `Anda telah Check-Out pada pukul ${timeString}`,
        );
      }
    } catch (error: unknown) {
      Alert.alert(
        "Presensi Gagal",
        error instanceof Error ? error.message : "Terjadi kesalahan.",
      );
    }
  };

  const handleAddEmployee = () => {
    if (!canAccessDirectory) {
      setAddEmpModalVisible(false);
      Alert.alert("Akses Ditolak", "Hanya manager ke atas yang dapat menambah pegawai.");
      return;
    }

    if (!newEmpName.trim() || !newEmpRole.trim()) {
      Alert.alert("Peringatan", "Mohon isi nama dan jabatan pegawai.");
      return;
    }

    const randomColor =
      AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const newEmp: Employee = {
      id: `EMP-00${employees.length + 1}`,
      name: newEmpName,
      role: newEmpRole,
      division: newEmpDivision,
      email:
        newEmpEmail ||
        `${newEmpName.toLowerCase().replace(/\s+/g, ".")}@company.com`,
      avatarBg: randomColor,
      status: "Active",
    };

    setEmployees([newEmp, ...employees]);
    setAddEmpModalVisible(false);
    setNewEmpName("");
    setNewEmpRole("");
    setNewEmpEmail("");
    Alert.alert("Sukses", "Pegawai baru berhasil ditambahkan!");
  };

  const renderEmployeeCard = ({ item }: { item: Employee }) => {
    const getStatusStyle = (status: Employee["status"]) => {
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

    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[styles.avatarContainer, { backgroundColor: item.avatarBg }]}
          >
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>

          <View style={styles.employeeMainInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.employeeName}>{item.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusStyle.bg },
                ]}
              >
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={styles.employeeRole}>{item.role}</Text>

            <View style={styles.divisionBadge}>
              <Text style={styles.divisionText}>{item.division}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <Text style={styles.employeeIdText}>ID: {item.id}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: pressed ? "#4338CA" : "#4F46E5",
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
            onPress={() => {
              if (!canAccessDirectory) {
                Alert.alert(
                  "Akses Ditolak",
                  "Hanya manager ke atas yang dapat melihat detail pegawai.",
                );
                return;
              }
              router.push({
                pathname: "/employee/[id]",
                params: {
                  id: item.id,
                  name: item.name,
                  role: item.role,
                  division: item.division,
                  email: item.email,
                  status: item.status,
                  avatarBg: item.avatarBg,
                },
              });
            }}
          >
            <Text style={styles.actionButtonText}>Lihat Detail</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>Memuat data HRIS...</Text>
          <Text style={styles.loadingSubtitle}>Mohon tunggu sebentar</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>HRIS Mobile App</Text>
            <Text style={styles.headerSubtitle}>
              Employee Management System
              {externalApiCount > 0
                ? ` • ${externalApiCount} data dari API`
                : ""}
            </Text>
          </View>
          {canAccessDirectory ? (
            <Pressable
              style={styles.addEmployeeBtnHeader}
              onPress={() => {
                if (!canAccessDirectory) {
                  Alert.alert(
                    "Akses Ditolak",
                    "Hanya manager ke atas yang dapat menambah pegawai.",
                  );
                  return;
                }
                setAddEmpModalVisible(true);
              }}
            >
              <Text style={styles.addEmployeeBtnText}>+ Employee</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{employees.length}</Text>
            <Text style={styles.statLabel}>Total Pegawai</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {employees.filter((e) => e.status === "Active").length}
            </Text>
            <Text style={styles.statLabel}>Aktif</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {employees.filter((e) => e.status === "Remote").length}
            </Text>
            <Text style={styles.statLabel}>Remote</Text>
          </View>
        </View>
          </View>
          <View style={styles.tabBarContainer}>
        {canAccessDirectory ? (
          <Pressable
            style={[
              styles.tabButton,
              activeTab === "directory" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("directory")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "directory" && styles.tabTextActive,
              ]}
            >
              Direktori
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "attendance" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("attendance")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "attendance" && styles.tabTextActive,
            ]}
          >
            Presensi
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "leave" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("leave")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "leave" && styles.tabTextActive,
            ]}
          >
            Pengajuan Cuti
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "profile" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("profile")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "profile" && styles.tabTextActive,
            ]}
          >
            Profil
          </Text>
        </Pressable>
          </View>
          <View style={styles.contentContainer}>
        {activeTab === "directory" && canAccessDirectory && (
          <>
            <View style={styles.searchSection}>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari nama, role, atau ID..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.filterSection}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={divisions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = selectedDivision === item;
                  return (
                    <Pressable
                      style={[
                        styles.filterChip,
                        { backgroundColor: isSelected ? "#4F46E5" : "#E0E7FF" },
                      ]}
                      onPress={() => setSelectedDivision(item)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: isSelected ? "#FFFFFF" : "#3730A3" },
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>

            <FlatList
              data={filteredEmployees}
              keyExtractor={(item) => item.id}
              renderItem={renderEmployeeCard}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>Data Tidak Ditemukan</Text>
                  <Text style={styles.emptySubtitle}>
                    Tidak ada pegawai yang sesuai dengan pencarian Anda.
                  </Text>
                </View>
              }
            />
          </>
        )}
        {activeTab === "attendance" && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.clockCard}>
              <Text style={styles.clockCardTitle}>
                Presensi Harian Hari Ini
              </Text>
              <Text style={styles.clockCardSubtitle}>
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.liveClockLabel}>Waktu Saat Ini</Text>
              <Text style={styles.liveClock}>
                {currentTime.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Text>

              <View style={styles.clockStatusBox}>
                <Text style={styles.clockStatusLabel}>Status Presensi</Text>
                <Text
                  style={[
                    styles.clockStatusValue,
                    { color: isCheckedIn ? "#10B981" : "#6B7280" },
                  ]}
                >
                  {isCheckedIn
                    ? `Sudah Check-In (${checkInTime})`
                    : "Belum Check-In"}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.clockButton,
                  {
                    backgroundColor: isCheckedIn ? "#EF4444" : "#10B981",
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
                onPress={handleClockToggle}
              >
                <Text style={styles.clockButtonText}>
                  {isCheckedIn ? "CLOCK OUT (PULANG)" : "CLOCK IN (MASUK)"}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.sectionHeaderTitle}>Riwayat Presensi</Text>
            {attendanceLogs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logInfo}>
                  <Text style={styles.logDate}>
                    {new Date(`${log.work_date}T00:00:00`).toLocaleDateString(
                      "id-ID",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  </Text>
                  <Text style={styles.logTime}>
                    Masuk:{" "}
                    {new Date(log.check_in).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" • "}
                    Keluar:{" "}
                    {log.check_out
                      ? new Date(log.check_out).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Belum"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.logStatusBadge,
                    {
                      backgroundColor:
                        log.status === "Tepat Waktu" ? "#DEF7EC" : "#FDE8E8",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.logStatusText,
                      {
                        color:
                          log.status === "Tepat Waktu" ? "#03543F" : "#9B1C1C",
                      },
                    ]}
                  >
                    {log.status}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
        {activeTab === "leave" && (
          <View style={styles.leaveTabContainer}>
            <LeaveContent />
          </View>
        )}
        {activeTab === "profile" && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionHeaderTitle}>Data Profil</Text>
            {profileEmployee && (
              <View style={styles.profileCard}>
                <View style={styles.profileHeader}>
                  <View
                    style={[
                      styles.profileAvatar,
                      { backgroundColor: profileEmployee.avatarBg },
                    ]}
                  >
                    <Text style={styles.profileInitials}>
                      {getInitials(profileEmployee.name)}
                    </Text>
                  </View>
                  <View style={styles.profileIdentity}>
                    <Text style={styles.profileName}>
                      {profileEmployee.name}
                    </Text>
                    <Text style={styles.profileRole}>
                      {profileEmployee.role}
                    </Text>
                  </View>
                </View>

                <View style={styles.profileDivider} />
                <View style={styles.profileRow}>
                  <Text style={styles.profileLabel}>ID Pegawai</Text>
                  <Text style={styles.profileValue}>{profileEmployee.id}</Text>
                </View>
                <View style={styles.profileRow}>
                  <Text style={styles.profileLabel}>Divisi</Text>
                  <Text style={styles.profileValue}>
                    {profileEmployee.division}
                  </Text>
                </View>
                <View style={styles.profileRow}>
                  <Text style={styles.profileLabel}>Email</Text>
                  <Text style={styles.profileValue}>
                    {profileEmployee.email}
                  </Text>
                </View>
                <View style={styles.profileRow}>
                  <Text style={styles.profileLabel}>Status</Text>
                  <Text style={styles.profileValue}>
                    {profileEmployee.status}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}
          </View>
          <Modal
        visible={canAccessDirectory && addEmpModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddEmpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Pegawai Baru</Text>

            <Text style={styles.inputLabel}>Nama Lengkap *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contoh: Ahmad Rizky"
              value={newEmpName}
              onChangeText={setNewEmpName}
            />

            <Text style={styles.inputLabel}>Jabatan / Role *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contoh: Frontend Developer"
              value={newEmpRole}
              onChangeText={setNewEmpRole}
            />

            <Text style={styles.inputLabel}>Divisi</Text>
            <View style={styles.divisionPickerRow}>
              {[
                "Engineering",
                "Human Resources",
                "Product Design",
                "Marketing & PR",
              ].map((div) => (
                <Pressable
                  key={div}
                  style={[
                    styles.pickerChip,
                    newEmpDivision === div && styles.pickerChipActive,
                  ]}
                  onPress={() => setNewEmpDivision(div)}
                >
                  <Text
                    style={[
                      styles.pickerChipText,
                      newEmpDivision === div && styles.pickerChipTextActive,
                    ]}
                  >
                    {div}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Email (Opsional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="ahmad@company.com"
              keyboardType="email-address"
              value={newEmpEmail}
              onChangeText={setNewEmpEmail}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setAddEmpModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnSubmit]}
                onPress={handleAddEmployee}
              >
                <Text style={styles.modalBtnSubmitText}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        </View>
          </Modal>

        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#1E1B4B",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1B4B",
  },
  loadingSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
  },
  header: {
    backgroundColor: "#1E1B4B",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#A5B4FC",
    marginTop: 2,
  },
  addEmployeeBtnHeader: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addEmployeeBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#312E81",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#818CF8",
  },
  statLabel: {
    fontSize: 11,
    color: "#C7D2FE",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#4338CA",
  },

  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#1E1B4B",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#818CF8",
  },
  tabText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  contentContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  leaveTabContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
  },
  filterSection: {
    paddingLeft: 20,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  employeeMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  employeeRole: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 4,
  },
  divisionBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  divisionText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  employeeIdText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },

  clockCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 3,
  },
  clockCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  clockCardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 10,
  },
  liveClockLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  liveClock: {
    fontSize: 30,
    fontWeight: "700",
    color: "#4F46E5",
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 16,
  },
  clockStatusBox: {
    backgroundColor: "#F9FAFB",
    width: "100%",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  clockStatusLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  clockStatusValue: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  clockButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  clockButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  logCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  logInfo: {
    flex: 1,
  },
  logDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  logTime: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  logStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  leaveHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addLeaveBtn: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addLeaveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  leaveCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  leaveTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  leaveType: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  leaveDates: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
    marginBottom: 4,
  },
  leaveReason: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileInitials: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  profileIdentity: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  profileRole: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },
  profileDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    gap: 12,
  },
  profileLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  profileValue: {
    flex: 1,
    fontSize: 12,
    color: "#1F2937",
    fontWeight: "600",
    textAlign: "right",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
  },
  divisionPickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  pickerChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerChipActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  pickerChipText: {
    fontSize: 11,
    color: "#4B5563",
  },
  pickerChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnCancel: {
    backgroundColor: "#F3F4F6",
  },
  modalBtnCancelText: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 13,
  },
  modalBtnSubmit: {
    backgroundColor: "#4F46E5",
  },
  modalBtnSubmitText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
});
