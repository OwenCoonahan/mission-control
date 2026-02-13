"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  CheckSquare,
  FileText,
  Calendar,
  FolderKanban,
  Brain,
  BookOpen,
  Users,
  Settings,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  { title: "Tasks", icon: CheckSquare, isActive: true },
  { title: "Content", icon: FileText },
  { title: "Calendar", icon: Calendar },
  { title: "Projects", icon: FolderKanban },
  { title: "Memory", icon: Brain },
  { title: "Docs", icon: BookOpen },
  { title: "People", icon: Users },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r border-white/10">
      <SidebarHeader className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-white">Mission Control</p>
            <p className="text-xs text-gray-400">Owen&apos;s HQ</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 uppercase text-xs tracking-wider">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.isActive}
                    tooltip={item.title}
                    className={item.isActive 
                      ? "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback className="bg-violet-600 text-white text-sm">OC</AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden flex-1">
            <p className="text-sm font-medium text-white">Owen</p>
            <p className="text-xs text-gray-400">Personal</p>
          </div>
          <Settings className="h-4 w-4 text-gray-400 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
