'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Pill, 
  Users, 
  ClipboardList, 
  Package, 
  LogOut, 
  Menu, 
  Bell, 
  ShoppingCart, 
  BarChart2,
  Calculator,
  HeartPulse,
  ChevronDown,
  X,
  ChevronRight,
  UserCircle2,
  Truck,
  Clock,
  Settings,
  Search,
  HelpCircle
} from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';
import { usePathname, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle logout with our custom auth service
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isMounted) {
    return null;
  }

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-violet-500 to-purple-500' },
    {
      label: 'Inventory',
      icon: Pill,
      color: 'from-emerald-500 to-green-500',
      submenu: [
        { href: '/dashboard/inventory', label: 'Medicines' },
      ]
    },
    {
      label: 'Suppliers',
      icon: Truck,
      color: 'from-orange-400 to-amber-500',
      submenu: [
        { href: '/dashboard/suppliers', label: 'All Suppliers' },
        { href: '/dashboard/purchases', label: 'Purchase Orders' },
      ]
    },
    { href: '/dashboard/customers', label: 'Customers', icon: Users, color: 'from-blue-500 to-indigo-600' },
    { href: '/dashboard/pos', label: 'Point of Sale', icon: ShoppingCart, color: 'from-rose-500 to-pink-500' },
    { href: '/dashboard/expenses', label: 'Expenses', icon: Calculator, color: 'from-yellow-400 to-amber-500' },
    { href: '/dashboard/bank-accounts', label: 'Bank Accounts', icon: Package, color: 'from-teal-500 to-cyan-500' },
    {
      label: 'Reports',
      icon: BarChart2,
      color: 'from-sky-500 to-blue-500',
      submenu: [
        { href: '/dashboard/viewSales', label: 'Inventory View Sales' },
        { href: '/dashboard/reports', label: 'Final Report' }
      ]
    },
    // { href: '/dashboard/settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
  ];

  const isMenuActive = (item: any): boolean => {
    if (item.href) {
      return pathname === item.href;
    }
    if (item.submenu) {
      return item.submenu.some((subItem: any) => pathname === subItem.href);
    }
    return false;
  };

  const renderMenuItem = (item: any, index: number) => {
    if (!item.icon) {
      return null;
    }
    
    const Icon = item.icon;
    const isExpanded = expandedMenus.includes(item.label);
    const isActive = isMenuActive(item);
    const hasActiveChild = item.submenu?.some((subItem: any) => pathname === subItem.href);
    
    // Get the gradient background for the icon
    const gradientBg = item.color || 'from-blue-500 to-indigo-600';

    if (item.submenu) {
      return (
        <div key={`${item.label}-${index}`} className="relative">
          <button
            onClick={() => toggleSubmenu(item.label)}
            className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 w-full
              ${hasActiveChild || isExpanded 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}
              ${!isSidebarOpen ? 'justify-center' : 'space-x-3'}`}
          >
            <div className={`rounded-lg p-2 bg-gradient-to-br ${gradientBg} flex-shrink-0`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            
            {isSidebarOpen && (
              <>
                <span className="flex-1 font-medium">{item.label}</span>
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90 text-blue-600' : ''
                  }`}
                />
              </>
            )}
          </button>
          
          {isExpanded && isSidebarOpen && (
            <div className="ml-12 mt-1 space-y-1">
              {item.submenu.map((subItem: any, subIndex: number) => (
                <Link
                  key={`${subItem.href}-${subIndex}`}
                  href={subItem.href}
                  className={`flex items-center rounded-lg px-4 py-2 text-sm transition-colors
                    ${pathname === subItem.href
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={`${item.href}-${index}`}
        href={item.href}
        className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200
          ${isActive 
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700' 
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}
          ${!isSidebarOpen ? 'justify-center' : 'space-x-3'}`}
      >
        <div className={`rounded-lg p-2 bg-gradient-to-br ${gradientBg} flex-shrink-0`}>
          <Icon className={`h-5 w-5 text-white`} />
        </div>
        
        <span className={`font-medium transition-opacity duration-300 ${!isSidebarOpen && 'md:hidden'}`}>
          {item.label}
        </span>
      </Link>
    );
  };

  // Get user's initials for the avatar
  const getUserInitial = () => {
    if (user?.username) {
      return user.username[0].toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/30 to-violet-50/30 overflow-hidden">
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-xl transition-all duration-300 ease-in-out rounded-r-3xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
        ${isSidebarOpen ? 'w-72' : 'w-24'}
      `}>
        {/* Sidebar header */}
        <div className={`flex h-20 items-center justify-between px-6 border-b border-blue-100 ${!isSidebarOpen && 'px-4'}`}>
          <div className="flex items-center space-x-3">
            <div className="rounded-xl h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <div className={`transition-opacity duration-300 ${!isSidebarOpen && 'md:opacity-0'}`}>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Isira Pharmacy
              </h2>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          <button 
            className="md:hidden rounded-lg p-1 hover:bg-blue-50" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Sidebar navigation */}
        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          {menuItems.filter(item => !!item.icon).map(renderMenuItem)}
        </nav>
        
        {/* Logout button at bottom */}
        <div className="p-4 border-t border-blue-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-4 py-3 text-gray-700 transition-all duration-200
              hover:bg-red-50 hover:text-red-600 space-x-3"
          >
            <div className="rounded-lg p-2 bg-gradient-to-br from-red-500 to-rose-500">
              <LogOut className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:pl-72' : 'md:pl-24'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-blue-100 flex-none shadow-sm">
          <div className="flex h-20 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl p-2 bg-blue-50 hover:bg-blue-100 md:hidden focus:outline-none"
              >
                <Menu className="h-6 w-6 text-blue-600" />
              </button>
              
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="hidden md:flex rounded-xl p-2 bg-blue-50 hover:bg-blue-100 focus:outline-none"
              >
                <Menu className="h-6 w-6 text-blue-600" />
              </button>
              
              <div className="relative max-w-md w-full hidden md:block">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border-gray-200 bg-gray-50 focus:ring-blue-500 w-full"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center h-10 px-4 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="mr-2 rounded-full bg-green-100 h-6 w-6 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm font-medium text-gray-700">Online</span>
              </div>
              
              <NotificationsDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-xl flex items-center space-x-2 hover:bg-blue-50 transition-colors duration-200">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium shadow-lg">
                      {getUserInitial()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.username || user?.email || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl p-2">
                  <div className="flex items-center space-x-3 p-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium">
                      {getUserInitial()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.username || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg cursor-pointer">
                    <UserCircle2 className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="rounded-lg cursor-pointer text-red-600 focus:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Mobile search bar */}
          <div className="px-4 pb-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border-gray-200 bg-gray-50 focus:ring-blue-500 w-full"
              />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto">
          <div className="container h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}