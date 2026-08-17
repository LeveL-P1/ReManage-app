import { GuardShellScreen } from "@/features/guard/guard-shell-screen";
import { RoleSwitcher } from "@/features/session/role-switcher";
import { SessionLogoutButton } from "@/features/session/session-logout-button";

export default function GuardMoreRoute() {
  return <GuardShellScreen title="More"><RoleSwitcher /><SessionLogoutButton /></GuardShellScreen>;
}
