import { type ReactNode, useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Rocket, 
  LogOut, 
  Sun,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { cn } from "../lib/utils";
import { ToogleTheme } from './ThemeToogle';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { signOut, user } = useContext(AuthContext);
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Usuários', path: '/usuarios', icon: Users },
    { label: 'SpaceX API', path: '/spacex', icon: Rocket },
  ];
  
  const NavList = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("flex flex-col gap-2", mobile ? "p-4" : "p-2")}>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link to={item.path} key={item.path} title={isCollapsed && !mobile ? item.label : ''}>
            <Button 
              variant={isActive ? "secondary" : "ghost"} 
              className={cn(
                "w-full transition-all duration-300",
                isActive 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 font-semibold' 
                  : 'hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100',

                !mobile && isCollapsed ? "justify-center px-2" : "justify-start gap-3 px-4"
              )}
            >
              <Icon size={20} className="shrink-0" />
              
              {(!isCollapsed || mobile) && (
                <span className="truncate">{item.label}</span>
              )}
            </Button>
          </Link>
        )
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      
      <aside 
        className={cn(
          "border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col shadow-sm z-10 transition-all duration-300 relative",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border shadow-sm z-20 text-orange-200 hover:text-orange-500"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>
        
        <div className={cn(
          "h-16 flex items-center border-b border-slate-100 dark:border-slate-700 overflow-hidden transition-all",
          isCollapsed ? "justify-center px-0" : "px-6 gap-2"
        )}>
          <div className="bg-orange-500 p-1.5 rounded-lg text-white shadow-lg shadow-orange-200 dark:shadow-orange-400 shrink-0">
            <Sun size={24} fill="currentColor" /> 
          </div>
          {!isCollapsed && (
            <div className='flex flex-row items-center justify-between w-full'>
              <div className="transition-opacity duration-300">
                <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight leading-none">GDASH</h1>
                <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-widest">Energy</span>
              </div>
              <ToogleTheme />
            </div>
          )}
        </div>
        
        <div className="flex-1 py-4 overflow-hidden hover:overflow-y-auto">
          {!isCollapsed && (
            <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Menu Principal
            </div>
          )}
          <NavList />
        </div>
        
        <div className={cn("border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 transition-all", isCollapsed ? "p-2" : "p-4")}>
          <div className={cn(
            "flex items-center rounded-lg bg-white border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden",
            isCollapsed ? "justify-center p-1 border-0 shadow-none bg-transparent" : "gap-3 mb-4 p-2"
          )}>
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm shrink-0">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name}&background=f97316&color=fff`} />
              <AvatarFallback className="bg-orange-100 text-orange-600">
                {user?.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-slate-700 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate" title={user?.email}>{user?.email}</p>
              </div>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className={cn(
              "w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 hover:border-red-200 dark:bg-slate-200 dark:hover:bg-slate-300",
              isCollapsed ? "justify-center px-0" : "gap-2"
            )}
            onClick={signOut}
            title="Sair"
          >
            <LogOut size={16} />
            {!isCollapsed && "Sair"}
          </Button>

        </div>
      </aside>
      
      <div className="flex-1 flex flex-col min-w-0">
      
        <header className="h-16 border-b border-slate-200 dark:border-slate-700 flex md:hidden items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Sun className="text-orange-500" />
            <span className="font-bold text-lg">GDASH</span>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
               <div className="h-16 flex items-center gap-10 px-6 border-b border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-xl">Menu</span>
                  <ToogleTheme />
               </div>
               <NavList mobile />
               <div className="p-4 mt-auto border-t">
                 <Button variant="destructive" className="w-full gap-2" onClick={signOut}>
                   <LogOut size={16}/> Sair
                 </Button>
               </div>
            </SheetContent>
          </Sheet>
        </header>
        
        <div className="flex-1 overflow-auto flex flex-col scroll-smooth">
          <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
            {children}
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}