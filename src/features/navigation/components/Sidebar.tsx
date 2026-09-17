// Sidebar Component
// Collapsible navigation sidebar

import { Menu, X, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components";
import { NavGroup } from "./NavGroup";
import { NavItem } from "./NavItem";
import { useNavigation } from "../hooks/useNavigation";

export function Sidebar() {
  const {
    navigationItems,
    sidebarCollapsed,
    mobileNavOpen,
    toggleSidebar,
    closeMobileNav,
    isActiveRoute,
  } = useNavigation();

  const showExpandedContent = mobileNavOpen || !sidebarCollapsed;

  return (
    <>
      {/* Mobile overlay — only when the drawer is open this session */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
          mobileNavOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={closeMobileNav}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
          // Desktop: always visible; collapsed = narrow, expanded = wide
          "lg:translate-x-0",
          sidebarCollapsed ? "lg:w-16" : "lg:w-64",
          // Mobile: hidden until the hamburger opens the drawer
          mobileNavOpen ? "translate-x-0 w-64" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          {showExpandedContent && (
            <img
              src={`${import.meta.env.BASE_URL}icons/icon-192x192.png`}
              alt="Plan Visualizer"
              className="h-16 w-16"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "hidden lg:inline-flex",
              sidebarCollapsed && "mx-auto",
            )}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeMobileNav}
            className="lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navigationItems.map((item) => {
            if (item.children && item.children.length > 0) {
              return (
                <NavGroup
                  key={item.id}
                  item={item}
                  isActiveRoute={isActiveRoute}
                  collapsed={!showExpandedContent}
                />
              );
            }
            return (
              <NavItem
                key={item.id}
                item={item}
                isActive={isActiveRoute(item.route)}
                collapsed={!showExpandedContent}
                onNavigate={closeMobileNav}
              />
            );
          })}
        </nav>
      </aside>
    </>
  );
}

// Mobile menu button (for use in header)
export function MobileMenuButton() {
  const { toggleMobileNav } = useNavigation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleMobileNav}
      className="lg:hidden"
      aria-label="Toggle menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
