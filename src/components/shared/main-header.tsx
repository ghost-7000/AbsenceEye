import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";

interface MainHeaderProps {
    title: string;
}

export function MainHeader({ title }: MainHeaderProps) {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="hidden md:flex" />
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            <h1 className="font-headline text-xl font-semibold md:text-2xl">{title}</h1>
            <div className="flex flex-1 items-center justify-end gap-2">
                <ThemeToggle />
                <UserNav />
            </div>
        </header>
    )
}
