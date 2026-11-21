import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type LeaveRequest = Database["public"]["Tables"]["leave_requests"]["Row"];

export type LeaveRequestInput = Pick<
  LeaveRequest,
  "type" | "start_date" | "end_date" | "reason"
>;

const LEAVE_REQUEST_COLUMNS =
  "id, user_id, type, start_date, end_date, reason, status, created_at";

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Gagal memverifikasi akun: ${error.message}`);
  }
  if (!data.user) {
    throw new Error("Sesi login tidak ditemukan. Silakan masuk kembali.");
  }

  return data.user.id;
}

export async function getMyLeaveRequests(): Promise<LeaveRequest[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leave_requests")
    .select(LEAVE_REQUEST_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat pengajuan cuti: ${error.message}`);
  }

  return data as LeaveRequest[];
}

export async function createLeaveRequest(
  input: LeaveRequestInput,
): Promise<LeaveRequest> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leave_requests")
    .insert({ ...input, user_id: userId })
    .select(LEAVE_REQUEST_COLUMNS)
    .single();

  if (error) {
    throw new Error(`Gagal membuat pengajuan cuti: ${error.message}`);
  }

  return data as LeaveRequest;
}

export async function updateLeaveRequest(
  id: string,
  input: LeaveRequestInput,
): Promise<LeaveRequest> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leave_requests")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select(LEAVE_REQUEST_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengubah pengajuan cuti: ${error.message}`);
  }
  if (!data) {
    throw new Error("Pengajuan tidak ditemukan atau bukan milik akun ini.");
  }

  return data as LeaveRequest;
}

export async function deleteLeaveRequest(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leave_requests")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal menghapus pengajuan cuti: ${error.message}`);
  }
  if (!data) {
    throw new Error("Pengajuan tidak ditemukan atau bukan milik akun ini.");
  }
}
