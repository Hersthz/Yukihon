// src/components/layout/AuthLayout.tsx

import { ReactNode } from "react";
import WinterNightBackground from "@/components/WinterNightBackground";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <WinterNightBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
