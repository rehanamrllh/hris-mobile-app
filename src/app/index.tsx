import { useState } from "react";
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

// ==========================================
// 2. TypeScript Interfaces
// ==========================================
export interface Employee {
  id: string;
  name: string;
  division: string;
  role: string;
  email: string;
  avatarBg: string;
  status: "Active" | "On Leave" | "Remote";
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "Tepat Waktu" | "Terlambat" | "Cuti";
}

export interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Disetujui" | "Ditolak";
}

// ==========================================
// 1. Dummy Data (Array of Objects)
// ==========================================
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

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "ATT-1",
    date: "06 Okt 2026",
    checkIn: "08:45 AM",
    checkOut: "05:00 PM",
    status: "Tepat Waktu",
  },
  {
    id: "ATT-2",
    date: "05 Okt 2026",
    checkIn: "08:55 AM",
    checkOut: "05:05 PM",
    status: "Tepat Waktu",
  },
  {
    id: "ATT-3",
    date: "02 Okt 2026",
    checkIn: "09:15 AM",
    checkOut: "05:30 PM",
    status: "Terlambat",
  },
  {
    id: "ATT-4",
    date: "01 Okt 2026",
    checkIn: "08:40 AM",
    checkOut: "05:00 PM",
    status: "Tepat Waktu",
  },
];

const INITIAL_LEAVE: LeaveRequest[] = [
  {
    id: "LV-001",
    type: "Cuti Tahunan",
    startDate: "12 Okt 2026",
    endDate: "14 Okt 2026",
    reason: "Acara Keluarga",
    status: "Disetujui",
  },
  {
    id: "LV-002",
    type: "Izin Sakit",
    startDate: "20 Sep 2026",
    endDate: "21 Sep 2026",
    reason: "Demam & Flu",
    status: "Disetujui",
  },
];

export default function HRISApp() {
  const [activeTab, setActiveTab] = useState<
    "directory" | "attendance" | "leave"
  >("directory");
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");

  // Attendance state
  const [attendanceLogs, setAttendanceLogs] =
    useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<
    "Tepat Waktu" | "Terlambat"
  >("Tepat Waktu");

  // Leave state
  const [leaveRequests, setLeaveRequests] =
    useState<LeaveRequest[]>(INITIAL_LEAVE);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [leaveType, setLeaveType] = useState("Cuti Tahunan");
  const [leaveReason, setLeaveReason] = useState("");

  // Add Employee Modal state
  const [addEmpModalVisible, setAddEmpModalVisible] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [newEmpDivision, setNewEmpDivision] = useState("Engineering");
  const [newEmpEmail, setNewEmpEmail] = useState("");

  const divisions = [
    "All",
    "Engineering",
    "Human Resources",
    "Product Design",
    "Marketing & PR",
    "Finance & Accounting",
  ];

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivision =
      selectedDivision === "All" || emp.division === selectedDivision;
    return matchesSearch && matchesDivision;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Clock In / Clock Out Handler
  const handleClockToggle = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateString = now.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (!isCheckedIn) {
      const isLate =
        now.getHours() > 8 ||
        (now.getHours() === 8 && now.getMinutes() > 30);
      setIsCheckedIn(true);
      setCheckInTime(timeString);
      setCheckInStatus(isLate ? "Terlambat" : "Tepat Waktu");
      Alert.alert(
        "Presensi Berhasil",
        `Anda telah Check-In pada pukul ${timeString}`,
      );
    } else {
      setIsCheckedIn(false);
      const newRecord: AttendanceRecord = {
        id: `ATT-${Date.now()}`,
        date: dateString,
        checkIn: checkInTime || "08:45 AM",
        checkOut: timeString,
        status: checkInStatus,
      };
      setAttendanceLogs([newRecord, ...attendanceLogs]);
      setCheckInTime(null);
      setCheckInStatus("Tepat Waktu");
      Alert.alert(
        "Presensi Berhasil",
        `Anda telah Check-Out pada pukul ${timeString}`,
      );
    }
  };

  // Add Employee Handler
  const handleAddEmployee = () => {
    if (!newEmpName.trim() || !newEmpRole.trim()) {
      Alert.alert("Peringatan", "Mohon isi nama dan jabatan pegawai.");
      return;
    }

    const colors = [
      "#4F46E5",
      "#EC4899",
      "#10B981",
      "#F59E0B",
      "#3B82F6",
      "#8B5CF6",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

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

  // Add Leave Request Handler
  const handleCreateLeave = () => {
    if (!leaveReason.trim()) {
      Alert.alert("Peringatan", "Mohon isi alasan pengajuan cuti.");
      return;
    }

    const newLeave: LeaveRequest = {
      id: `LV-00${leaveRequests.length + 1}`,
      type: leaveType,
      startDate: "15 Okt 2026",
      endDate: "17 Okt 2026",
      reason: leaveReason,
      status: "Pending",
    };

    setLeaveRequests([newLeave, ...leaveRequests]);
    setLeaveModalVisible(false);
    setLeaveReason("");
    Alert.alert("Sukses", "Pengajuan cuti berhasil dikirim ke HRD!");
  };

  // ==========================================
  // 3. Custom Function (renderEmployeeCard)
  // ==========================================
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
          {/* Custom Avatar with Dynamic Background (Inline Style example) */}
          <View
            style={[styles.avatarContainer, { backgroundColor: item.avatarBg }]}
          >
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>

          <View style={styles.employeeMainInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.employeeName}>{item.name}</Text>
              {/* Status Badge with dynamic inline style */}
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

          {/* 6. Basic UI Component: Pressable */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              // 5. Example of INLINE STYLING for pressed state feedback
              {
                backgroundColor: pressed ? "#4338CA" : "#4F46E5",
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
            onPress={() =>
              Alert.alert(
                "Detail Pegawai",
                `Nama: ${item.name}\nID: ${item.id}\nDivisi: ${item.division}\nRole: ${item.role}\nEmail: ${item.email}\nStatus: ${item.status}`,
              )
            }
          >
            <Text style={styles.actionButtonText}>Lihat Detail</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      {/* ================= AREA DI ATAS TAB: HEADER & RINGKASAN ================= */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>HRIS Mobile App</Text>
            <Text style={styles.headerSubtitle}>
              Employee Management System
            </Text>
          </View>
          <Pressable
            style={styles.addEmployeeBtnHeader}
            onPress={() => setAddEmpModalVisible(true)}
          >
            <Text style={styles.addEmployeeBtnText}>+ Employee</Text>
          </Pressable>
        </View>

        {/* Stats Row */}
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
      {/* ================= AKHIR AREA DI ATAS TAB ================= */}

      {/* ================= NAVIGASI TAB: MULAI ================= */}
      <View style={styles.tabBarContainer}>
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
      </View>
      {/* ================= NAVIGASI TAB: SELESAI ================= */}

      {/* ================= KONTEN TAB: MULAI ================= */}
      <View style={styles.contentContainer}>
        {/* ================= TAB 1: DIREKTORI - MULAI ================= */}
        {activeTab === "directory" && (
          <>
            {/* Search Bar */}
            <View style={styles.searchSection}>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari nama, role, atau ID..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Division Filter Pills */}
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

            {/* Looping Component: FlatList */}
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
        {/* ================= TAB 1: DIREKTORI - SELESAI ================= */}

        {/* ================= TAB 2: PRESENSI - MULAI ================= */}
        {activeTab === "attendance" && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Clock In / Clock Out Card */}
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

            {/* Attendance Logs */}
            <Text style={styles.sectionHeaderTitle}>Riwayat Presensi</Text>
            {attendanceLogs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logInfo}>
                  <Text style={styles.logDate}>{log.date}</Text>
                  <Text style={styles.logTime}>
                    Masuk: {log.checkIn} • Keluar: {log.checkOut}
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
        {/* ================= TAB 2: PRESENSI - SELESAI ================= */}

        {/* ================= TAB 3: PENGAJUAN CUTI - MULAI ================= */}
        {activeTab === "leave" && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header Action */}
            <View style={styles.leaveHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>
                Daftar Pengajuan Cuti
              </Text>
              <Pressable
                style={styles.addLeaveBtn}
                onPress={() => setLeaveModalVisible(true)}
              >
                <Text style={styles.addLeaveBtnText}>+ Ajukan Cuti</Text>
              </Pressable>
            </View>

            {leaveRequests.map((leave) => (
              <View key={leave.id} style={styles.leaveCard}>
                <View style={styles.leaveTopRow}>
                  <Text style={styles.leaveType}>{leave.type}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          leave.status === "Disetujui"
                            ? "#DEF7EC"
                            : leave.status === "Pending"
                              ? "#FEF08A"
                              : "#FDE8E8",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            leave.status === "Disetujui"
                              ? "#03543F"
                              : leave.status === "Pending"
                                ? "#713F12"
                                : "#9B1C1C",
                        },
                      ]}
                    >
                      {leave.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.leaveDates}>
                  {leave.startDate} s/d {leave.endDate}
                </Text>
                <Text style={styles.leaveReason}>Alasan: {leave.reason}</Text>
              </View>
            ))}
          </ScrollView>
        )}
        {/* ================= TAB 3: PENGAJUAN CUTI - SELESAI ================= */}
      </View>
      {/* ================= KONTEN TAB: SELESAI ================= */}

      {/* ================= MODAL: TAMBAH PEGAWAI ================= */}
      <Modal
        visible={addEmpModalVisible}
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

      {/* ================= MODAL: AJUKAN CUTI ================= */}
      <Modal
        visible={leaveModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Form Pengajuan Cuti</Text>

            <Text style={styles.inputLabel}>Jenis Cuti</Text>
            <View style={styles.divisionPickerRow}>
              {["Cuti Tahunan", "Izin Sakit", "Cuti Melahirkan"].map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.pickerChip,
                    leaveType === type && styles.pickerChipActive,
                  ]}
                  onPress={() => setLeaveType(type)}
                >
                  <Text
                    style={[
                      styles.pickerChipText,
                      leaveType === type && styles.pickerChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Alasan / Keterangan *</Text>
            <TextInput
              style={[
                styles.modalInput,
                { height: 80, textAlignVertical: "top" },
              ]}
              placeholder="Tuliskan alasan pengajuan cuti Anda..."
              multiline
              numberOfLines={3}
              value={leaveReason}
              onChangeText={setLeaveReason}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setLeaveModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnSubmit]}
                onPress={handleCreateLeave}
              >
                <Text style={styles.modalBtnSubmitText}>Kirim Pengajuan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// 5. External Styling using StyleSheet.create()
// ==========================================
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#1E1B4B",
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

  /* Navigation Tabs */
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

  /* Clock In/Out Styles */
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

  /* Leave Tab Styles */
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

  /* Modal Styles */
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
