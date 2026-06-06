import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "info" | "warning" | "success" | "destructive" | "secondary" }
> = {
  NEW: { label: "New", variant: "info" },
  CONTACTED: { label: "Contacted", variant: "warning" },
  QUALIFIED: { label: "Qualified", variant: "secondary" },
  CONVERTED: { label: "Converted", variant: "success" },
  LOST: { label: "Lost", variant: "destructive" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    variant: "default" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
