import { ResidentShellScreen } from "@/features/resident/resident-shell-screen";
import { RoleSwitcher } from "@/features/session/role-switcher";

export default function ResidentMoreRoute() {
  return <ResidentShellScreen title="More"><RoleSwitcher /></ResidentShellScreen>;
}
