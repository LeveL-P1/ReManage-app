import { GuardShellScreen } from "@/features/guard/guard-shell-screen";
import { RoleSwitcher } from "@/features/session/role-switcher";

export default function GuardMoreRoute() {
  return <GuardShellScreen title="More"><RoleSwitcher /></GuardShellScreen>;
}
