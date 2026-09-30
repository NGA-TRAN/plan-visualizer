import { Circle, Workflow, type LucideIcon } from "lucide-react";

// Register navigation icons here so unused icons can be removed from the build.
const navigationIcons: Record<string, LucideIcon> = {
  workflow: Workflow,
};

export function NavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = navigationIcons[name] ?? Circle;
  return <Icon className={className} />;
}
