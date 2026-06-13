export type NavLeaf = { label: string; href: string };
export type NavGroup = {
  label: string;
  icon: string;
  children?: (NavLeaf | { label: string; children: NavLeaf[] })[];
  href?: string;
};

export const NAV: NavGroup[] = [
  {
    label: "Home",
    icon: "home",
    children: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Analytics", href: "/dashboard/analytics" },
    ],
  },
  {
    label: "Pages",
    icon: "pages",
    children: [
      {
        label: "Profile",
        children: [
          { label: "Profile overview", href: "/dashboard/profile" },
          { label: "Teams", href: "/dashboard/profile/teams" },
          { label: "All Projects", href: "/dashboard/profile/projects" },
        ],
      },
      {
        label: "Users",
        children: [
          { label: "Reports", href: "/dashboard/users/reports" },
          { label: "New User", href: "/dashboard/users/new" },
        ],
      },
      {
        label: "Account",
        children: [
          { label: "Setting", href: "/dashboard/account/settings" },
          { label: "Billing", href: "/dashboard/account/billing" },
          { label: "Invoice", href: "/dashboard/account/invoice" },
          { label: "Security", href: "/dashboard/account/security" },
        ],
      },
      {
        label: "Projects",
        children: [
          { label: "General", href: "/dashboard/projects/general" },
          { label: "Timeline", href: "/dashboard/projects/timeline" },
          { label: "New Project", href: "/dashboard/projects/new" },
        ],
      },
      { label: "Pricing page", href: "/dashboard/pricing" },
      { label: "Charts", href: "/dashboard/charts" },
      { label: "Notification", href: "/dashboard/notification" },
      { label: "Chat", href: "/dashboard/chat" },
    ],
  },
  {
    label: "Applications",
    icon: "apps",
    children: [
      { label: "Kanban", href: "/dashboard/apps/kanban" },
      { label: "Wizard", href: "/dashboard/apps/wizard" },
      { label: "Data tables", href: "/dashboard/apps/data-tables" },
      { label: "Calendar", href: "/dashboard/apps/calendar" },
    ],
  },
  {
    label: "E-commerce",
    icon: "cart",
    children: [
      { label: "Overview", href: "/dashboard/ecommerce/overview" },
      {
        label: "Products",
        children: [
          { label: "New Product", href: "/dashboard/ecommerce/products/new" },
          { label: "Edit Product", href: "/dashboard/ecommerce/products/edit" },
          { label: "Product List", href: "/dashboard/ecommerce/products/list" },
        ],
      },
      {
        label: "Orders",
        children: [
          { label: "Order list", href: "/dashboard/ecommerce/orders/list" },
          { label: "Order Detail", href: "/dashboard/ecommerce/orders/detail" },
        ],
      },
    ],
  },
  {
    label: "Authentication",
    icon: "shield",
    children: [
      { label: "Logout", href: "/logout" },
    ],
  },
];
