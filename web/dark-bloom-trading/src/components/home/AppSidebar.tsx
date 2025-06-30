
import { Home, TrendingUp, Eye, Briefcase, BookOpen, Bot, Newspaper, Brain } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

const mainItems = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Market",
    url: "/marketplace",
    icon: TrendingUp,
  },
  {
    title: "Watchlist",
    url: "/watchlist",
    icon: Eye,
  },
  {
    title: "Portfolio",
    url: "/portfolio",
    icon: Briefcase,
  },
];

const resourcesItems = [
  {
    title: "Bots",
    url: "/resources/bots",
    icon: Bot,
  },
  {
    title: "Blogs",
    url: "/resources/blogs",
    icon: Newspaper,
  },
  {
    title: "AI Mentor",
    url: "/resources/ai-mentor",
    icon: Brain,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-800">
      <SidebarContent className="bg-gray-950">
        <SidebarGroup>
          <SidebarGroupLabel className="text-emerald-400 font-semibold text-lg mb-4">
            DarkBloom
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-gray-800 hover:text-emerald-400 transition-colors">
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center gap-2 hover:bg-gray-800 rounded-md p-2 transition-colors">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400 font-medium">Resources</span>
                <ChevronRight className="ml-auto h-4 w-4 text-blue-400 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenuSub>
                  {resourcesItems.map((item) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton asChild className="hover:bg-gray-800 hover:text-blue-300 transition-colors">
                        <a href={item.url} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
