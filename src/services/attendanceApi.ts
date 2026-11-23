import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type AttendanceRecord = Database["public"]["Tables"]["attendance_records"]["Row"];

const ATTENDANCE_COLUMNS =
  "id, user_id, work_date, check_in, check_out, status, created_at";

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Gagal memverifikasi akun: ${error.message}`);
  if (!data.user) throw new Error("Sesi login tidak ditemukan.");
  return data.user.id;
}

export async function getMyAttendanceRecords(): Promise<AttendanceRecord[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("attendance_records")
    .select(ATTENDANCE_COLUMNS)
    .eq("user_id", userId)
    .order("work_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Gagal memuat presensi: ${error.message}`);
  return data as AttendanceRecord[];
}

export async function clockIn(status: "Tepat Waktu" | "Terlambat") {
  const userId = await getCurrentUserId();
  const now = new Date();
  const workDate = now.toISOString().slice(0, 10);
  const checkIn = now.toISOString();

  const { data: existing } = await supabase
    .from("attendance_records")
    .select(ATTENDANCE_COLUMNS)
    .eq("user_id", userId)
    .eq("work_date", workDate)
    .is("check_out", null)
    .maybeSingle();

  if (existing) {
    return existing as AttendanceRecord;
  }

  const { data, error } = await supabase
    .from("attendance_records")
    .insert({
      user_id: userId,
      work_date: workDate,
      check_in: checkIn,
      check_out: null,
      status,
    })
    .select(ATTENDANCE_COLUMNS)
    .single();

  if (error) throw new Error(`Gagal melakukan clock-in: ${error.message}`);
  return data as AttendanceRecord;
}

export async function clockOut(recordId: string): Promise<AttendanceRecord> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("attendance_records")
    .update({ check_out: new Date().toISOString() })
    .eq("id", recordId)
    .eq("user_id", userId)
    .is("check_out", null)
    .select(ATTENDANCE_COLUMNS)
    .maybeSingle();

  if (error) throw new Error(`Gagal melakukan clock-out: ${error.message}`);
  if (!data) throw new Error("Data presensi aktif tidak ditemukan.");
  return data as AttendanceRecord;
}
