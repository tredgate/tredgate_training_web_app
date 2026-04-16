import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { TEST_IDS } from "../../shared/testIds";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backTo?: string;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  backTo,
}: PageHeaderProps) {
  return (
    <div
      data-testid={TEST_IDS.pageHeader.container}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-3">
        {backTo && (
          <Link
            to={backTo}
            data-testid={TEST_IDS.pageHeader.btnBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
        )}
        <div>
          <h1
            data-testid={TEST_IDS.pageHeader.title}
            className="text-2xl font-bold text-white"
          >
            {title}
          </h1>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
