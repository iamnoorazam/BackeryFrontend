import { PackageOpen } from "lucide-react";

const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
      {icon ? (
        <span className="text-3xl">{icon}</span>
      ) : (
        <PackageOpen className="h-7 w-7 text-muted-foreground/70" />
      )}
    </div>
    <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
