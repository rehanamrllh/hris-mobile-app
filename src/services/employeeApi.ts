import {
  ExternalEmployee,
  ExternalEmployeeResponse,
} from "@/types/externalEmployee";

const EMPLOYEE_API_URL = "https://dummyjson.com/users";

export async function getEmployees(): Promise<ExternalEmployeeResponse> {
  const response = await fetch(EMPLOYEE_API_URL);

  if (!response.ok) {
    throw new Error(
      `Gagal mengambil data karyawan. Status server: ${response.status}`,
    );
  }

  return response.json() as Promise<ExternalEmployeeResponse>;
}

export async function getEmployeeById(
  id: number,
): Promise<ExternalEmployee> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID karyawan harus berupa bilangan bulat positif.");
  }

  const response = await fetch(`${EMPLOYEE_API_URL}/${id}`);

  if (!response.ok) {
    throw new Error(
      `Gagal mengambil data karyawan dengan ID ${id}. Status server: ${response.status}`,
    );
  }

  return response.json() as Promise<ExternalEmployee>;
}