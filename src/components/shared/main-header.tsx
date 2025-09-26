import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { Button } from "../ui/button";
import { PanelRightOpen } from "lucide-react";

interface MainHeaderProps {
    title: string;
}

export function MainHeader({ title }: MainHeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden" side="right" />
            
            <h1 className="font-headline text-xl font-semibold md:text-2xl">{title}</h1>
            
            <div className="flex flex-1 items-center justify-end gap-2">
                <ThemeToggle />
                <UserNav />
            </div>
             <SidebarTrigger className="hidden md:flex" side="right" asChild>
                <Button variant="outline" size="icon">
                    <PanelRightOpen />
                </Button>
            </SidebarTrigger>
        </header>
    )
}
