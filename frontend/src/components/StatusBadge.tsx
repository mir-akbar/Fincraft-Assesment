import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusIcon, getStatusText } from "@/utils";
import type { DownloadStatus, ParseStatus } from "@/types";

interface StatusBadgeProps {
  status: DownloadStatus | ParseStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={`${getStatusColor(status)} ${className}`}>
      <span className="mr-1">{getStatusIcon(status)}</span>
      {getStatusText(status)}
    </Badge>
  );
}
