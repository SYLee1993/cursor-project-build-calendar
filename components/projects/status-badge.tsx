import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal text-muted-foreground", className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
