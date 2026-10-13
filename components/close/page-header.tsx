import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppearancePanel } from "@/components/close/appearance-panel";

export function PageHeader({
  eyebrow,
  title,
  badge,
  actions,
}: {
  eyebrow: string;
  title: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b bg-white px-3 py-2 dark:bg-slate-900 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-6" />
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted-foreground">
          {eyebrow}
        </div>
        <div className="flex items-center gap-2">
          <h1 className="truncate text-base font-semibold tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
      </div>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        {actions}
        <AppearancePanel />
        <Avatar className="size-8">
          <AvatarFallback className="text-xs font-semibold">AQ</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
