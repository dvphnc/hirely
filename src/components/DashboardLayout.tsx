
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building, 
  LogOut, 
  Menu, 
  X,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, href, isActive, onClick }: NavItemProps) => {
  return (
    <Link 
      to={href} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-white/10",
        isActive ? "bg-white/20 text-white font-medium" : "text-white/70"
      )}
      onClick={onClick}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Apply dark mode from localStorage on component mount and when it changes
  useEffect(() => {
    const applyDarkMode = () => {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      if (savedDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    applyDarkMode();
    
    // Set up an event listener for darkMode changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darkMode') {
        applyDarkMode();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Employees", href: "/employees" },
    { icon: Briefcase, label: "Jobs", href: "/jobs" },
    { icon: Building, label: "Departments", href: "/departments" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  // Extract user name from user_metadata or fallback to email
  const userName = user?.user_metadata?.name || user?.email;

  return (
    <div className="flex h-screen">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={closeSidebar}
        />
      )}
      
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-instagram-gradient flex flex-col z-30 transition-transform duration-300 lg:transform-none",
          sidebarOpen ? "transform-none" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Hirely</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-white hover:bg-white/10"
            onClick={closeSidebar}
          >
            <X size={20} />
          </Button>
        </div>
        
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={location.pathname === item.href}
              onClick={closeSidebar}
            />
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {userName}
                </span>
                <span className="text-xs text-white/70">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </aside>
      
      <div className="flex flex-col flex-1 lg:pl-64">
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10 py-4 px-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>
          <div className="lg:hidden font-medium">Hirely</div>
          <div className="hidden lg:block font-medium">
            {navItems.find(item => item.href === location.pathname)?.label || "Hirely"}
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 dark:text-white p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
