
import React from 'react';
import { Link } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { Home, Clock } from "lucide-react";

const AdminSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="p-2">
          <h2 className="text-xl font-bold">Admin-Bereich</h2>
          <SidebarTrigger className="absolute right-2 top-2" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <Home />
                <span>Zurück zur Startseite</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/category-expiry">
                <Clock />
                <span>Ablaufdaten verwalten</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
