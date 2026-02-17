// src/components/shared/PageHeader.tsx

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actionButtons?: ReactNode;
}

const PageHeader = ({ title, subtitle, icon, actionButtons }: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {icon && <div className="text-4xl">{icon}</div>}
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
            {subtitle && <p className="text-gray-400 text-lg">{subtitle}</p>}
          </div>
        </div>
        {actionButtons && <div className="flex gap-3">{actionButtons}</div>}
      </div>
    </motion.div>
  );
};

export default PageHeader;
