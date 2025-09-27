import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, className, actions }: PageHeaderProps) {
  return (
    <div className={cn("border-b bg-background/50", className)}>
        <div className="container mx-auto flex items-center justify-between gap-4 py-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {actions && <div>{actions}</div>}
        </div>
    </div>
  );
}
