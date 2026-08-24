import { HeroUINativeProvider } from "heroui-native";
import { ReactNode } from "react";

export function HerouiProvider({ children }: { children: ReactNode }) {
  return <HeroUINativeProvider>{children}</HeroUINativeProvider>;
}