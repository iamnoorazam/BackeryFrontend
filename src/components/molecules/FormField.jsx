import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const FormField = ({ label, id, error, className, ...props }) => (
  <div className={`space-y-1.5 ${className || ""}`}>
    {label && <Label htmlFor={id}>{label}</Label>}
    <Input
      id={id}
      className={error ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : ""}
      {...props}
    />
    {error && (
      <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-red-500" />
        {error}
      </p>
    )}
  </div>
);

export default FormField;
