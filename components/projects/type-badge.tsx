import { Badge } from "@/components/ui/badge";
import { TYPE_BADGE_CLASSES, TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProjectType } from "@/types/project";

interface TypeBadgeProps {
  type: ProjectType;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(TYPE_BADGE_CLASSES[type], className)}
    >
      {TYPE_LABELS[type]}
    </Badge>
  );
}
