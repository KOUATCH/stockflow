export type Role = "admin" | "buyer" | "approver" | "receiver"

export type UserLike = {
  id: string
  email?: string | null
  name?: string | null
  roles?: Role[]
}

export type Action =
  | "po:create"
  | "po:submit"
  | "po:approve"
  | "po:receive"
  | "po:cancel"
  | "po:update"
  | "po:delete"
  | "po:clone"
  | "po:export"
  | "po:bulk-status"

const roleMatrix: Record<Role, Action[]> = {
  admin: [
    "po:create",
    "po:submit",
    "po:approve",
    "po:receive",
    "po:cancel",
    "po:update",
    "po:delete",
    "po:clone",
    "po:export",
    "po:bulk-status",
  ],
  buyer: ["po:create", "po:submit", "po:update", "po:clone", "po:export"],
  approver: ["po:approve", "po:cancel", "po:export", "po:bulk-status"],
  receiver: ["po:receive", "po:export"],
}

export function can(user: UserLike | null | undefined, action: Action) {
  if (!user?.roles?.length) return false
  if (user.roles.includes("admin")) return true
  return user.roles.some((r) => roleMatrix[r]?.includes(action))
}
