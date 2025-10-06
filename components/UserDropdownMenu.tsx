"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  ChevronDown,
  CreditCard,
  Crown,
  HelpCircle,
  KeyRound,
  LogOut,
  Mail,
  Moon,
  Palette,
  Settings,
  Shield,
  Sparkles,
  Star,
  Sun,
  User,
  UserCircle,
  Zap
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserDropdownProps {
  username: string;
  email: string;
  avatarUrl?: string;
}

const UserDropdownMenu = ({
  username,
  email,
  avatarUrl,
}: UserDropdownProps) => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut({
        redirectTo: "/login",
        redirect: true
      });
    } catch (error) {
      console.log(error);
      router.push("/login");
    }
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  // Get user role for display (fallback to default values since session is not available)
  const userRole = "User";
  const organizationName = "StockFlow";

  // Generate initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-auto justify-start gap-3 px-3 hover:bg-white/10 transition-all duration-300 group"
        >
          {/* Enhanced Avatar with Status Indicator */}
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-white/20 transition-all duration-300 group-hover:ring-emerald-300/50 group-hover:scale-105">
              <AvatarImage src={avatarUrl} alt={username} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm">
                {getInitials(username)}
              </AvatarFallback>
            </Avatar>
            {/* Online Status Indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-md animate-pulse" />
          </div>

          {/* User Info */}
          <div className="hidden sm:flex flex-col items-start min-w-0 flex-1">
            <span className="text-sm font-semibold text-gray-900 truncate max-w-32">
              {username}
            </span>
            <span className="text-xs text-gray-500 truncate max-w-32">
              {email}
            </span>
          </div>

          {/* Dropdown Arrow */}
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-all duration-300 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 p-0 bg-white/95 backdrop-blur-xl border border-emerald-200/50 shadow-2xl ring-1 ring-black/5"
        align="end"
        forceMount
        sideOffset={8}
      >
        {/* Enhanced User Header */}
        <div className="relative p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-b border-emerald-200/50">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
          <div className="absolute top-2 right-2 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full" />
          <div className="absolute bottom-2 left-2 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-full" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-4 ring-white/50 shadow-xl">
                <AvatarImage src={avatarUrl} alt={username} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg">
                  {getInitials(username)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full shadow-lg animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg truncate">{username}</h3>
              <p className="text-sm text-gray-600 truncate">{email}</p>

              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
                  <Crown className="w-3 h-3 mr-1" />
                  {userRole}
                </Badge>
                <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700">
                  {organizationName}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-b border-gray-100/50">
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-0 pb-2">
            Quick Actions
          </DropdownMenuLabel>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-auto p-3 flex-col gap-2 border-emerald-200/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
              onClick={() => handleNavigate("/dashboard/profile")}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium">Profile</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-auto p-3 flex-col gap-2 border-teal-200/50 hover:bg-teal-50 hover:border-teal-300 transition-all duration-200"
              onClick={() => handleNavigate("/dashboard/settings")}
            >
              <Settings className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-medium">Settings</span>
            </Button>
          </div>
        </div>

        {/* Account Management */}
        <DropdownMenuGroup className="p-2">
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Account
          </DropdownMenuLabel>

          <DropdownMenuItem
            className="cursor-pointer p-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 group"
            onClick={() => handleNavigate("/dashboard/profile")}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <UserCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">My Profile</div>
                <div className="text-xs text-muted-foreground">Update your information</div>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer p-3 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-all duration-200 group"
            onClick={() => handleNavigate("/dashboard/settings/security")}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                <KeyRound className="h-4 w-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Security</div>
                <div className="text-xs text-muted-foreground">Password & 2FA settings</div>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer p-3 rounded-lg hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-200 group"
            onClick={() => handleNavigate("/dashboard/settings/notifications")}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
                <Bell className="h-4 w-4 text-cyan-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Notifications</div>
                <div className="text-xs text-muted-foreground">Email & push preferences</div>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="mx-2" />

        {/* Preferences */}
        <DropdownMenuGroup className="p-2">
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Preferences
          </DropdownMenuLabel>

          <DropdownMenuItem className="cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition-all duration-200 group">
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                {darkMode ? <Moon className="h-4 w-4 text-slate-600" /> : <Sun className="h-4 w-4 text-slate-600" />}
              </div>
              <div className="flex-1">
                <div className="font-medium">Dark Mode</div>
                <div className="text-xs text-muted-foreground">Toggle theme appearance</div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer p-3 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 group"
            onClick={() => handleNavigate("/dashboard/settings/appearance")}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Palette className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Appearance</div>
                <div className="text-xs text-muted-foreground">Customize interface</div>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="mx-2" />

        {/* Support & Billing */}
        <DropdownMenuGroup className="p-2">
          <DropdownMenuItem
            className="cursor-pointer p-3 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 group"
            onClick={() => handleNavigate("/dashboard/billing")}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                <CreditCard className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Billing & Plans</div>
                <div className="text-xs text-muted-foreground">Manage subscription</div>
              </div>
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                Pro
              </Badge>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer p-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
            onClick={() => handleNavigate("/help")}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <HelpCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Help & Support</div>
                <div className="text-xs text-muted-foreground">Get assistance</div>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="mx-2" />

        {/* Logout */}
        <div className="p-2">
          <DropdownMenuItem
            className="cursor-pointer p-3 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 group border border-transparent hover:border-red-200"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <LogOut className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Sign Out</div>
                <div className="text-xs text-muted-foreground">End your session</div>
              </div>
            </div>
          </DropdownMenuItem>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100/50">
          <div className="text-center text-xs text-gray-500">
            StockFlow v2.1.0 • Built with ❤️
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownMenu;