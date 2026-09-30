// Navigation Item Component
// Single navigation link

import { Link } from "react-router-dom";
import { NavIcon } from "./NavIcon";
import { cn } from "@/shared/utils/cn";
import type { NavigationItem } from "@/types";

export interface NavItemProps {
  item: NavigationItem;
  isActive?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavItem({
  item,
  isActive,
  collapsed,
  onNavigate,
}: NavItemProps) {
  if (!item.route) return null;

  return (
    <Link
      to={item.route}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive
          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
          : "text-gray-700 dark:text-gray-300",
        collapsed && "justify-center px-2",
      )}
      title={collapsed ? item.label : undefined}
    >
      <NavIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {!collapsed && item.badge !== undefined && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
