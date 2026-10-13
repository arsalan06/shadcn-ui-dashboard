import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/close/app-sidebar";
import { CloseProvider } from "@/components/close/close-provider";

// The rollup is not fetched here on purpose: it is one upstream call per store
// and takes several seconds, which would hold up the first paint of every page
// under this layout. CloseProvider loads it from /api/close instead, and
// refetches whenever the close date changes.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <CloseProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">{children}</SidebarInset>
      </SidebarProvider>
    </CloseProvider>
  );
}
