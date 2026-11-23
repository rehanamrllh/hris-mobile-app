export type AccessRole =
  | "employee"
  | "supervisor"
  | "manager"
  | "director"
  | "admin";

const VALID_ACCESS_ROLES: AccessRole[] = [
  "employee",
  "supervisor",
  "manager",
  "director",
  "admin",
];

export function getAccessRole(
  metadata: Record<string, unknown> | undefined,
): AccessRole {
  const assignedRole =
    typeof metadata?.access_role === "string"
      ? metadata.access_role.trim().toLowerCase()
      : "";
  const profileRole =
    typeof metadata?.role === "string" ? metadata.role.trim().toLowerCase() : "";

  let profileAccessRole: AccessRole = "employee";
  if (/(admin|administrator)/.test(profileRole)) profileAccessRole = "admin";
  else if (/(director|executive director)/.test(profileRole))
    profileAccessRole = "director";
  else if (/(manager|manajer)/.test(profileRole))
    profileAccessRole = "manager";
  else if (/(supervisor|team lead|lead)/.test(profileRole))
    profileAccessRole = "supervisor";

  const validAssignedRole = VALID_ACCESS_ROLES.includes(
    assignedRole as AccessRole,
  )
    ? (assignedRole as AccessRole)
    : "employee";

  const roleRank: Record<AccessRole, number> = {
    employee: 1,
    supervisor: 2,
    manager: 3,
    director: 4,
    admin: 5,
  };

  return roleRank[validAssignedRole] >= roleRank[profileAccessRole]
    ? validAssignedRole
    : profileAccessRole;
}

export function canAccessEmployeeDirectory(role: AccessRole): boolean {
  return ["manager", "director", "admin"].includes(role);
}
