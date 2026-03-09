interface AppPageTitleBlockProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AppPageTitleBlock({ title, description, action }: AppPageTitleBlockProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col max-sm:gap-2 gap-4">
        <h2 className="text-3xl  font-medium text-foreground ">{title}</h2>
        {description ? (
          <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
