import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * react-hook-form-bound text field used across the checkout form. Distinct from
 * the generic molecules/FormField (which is controlled via `value`/`onChange`):
 * this one wires an RHF `register(name)` and mirrors browser-autofilled values
 * back into RHF via onInput (autofill doesn't fire React change events).
 */
const RHFField = ({ label, name, register, errors, required, placeholder, className, disabled, type, setValue }) => (
  <div className="space-y-1">
    <Label htmlFor={name} className="text-xs sm:text-sm font-medium">
      {label} {required && <span className="text-danger">*</span>}
    </Label>
    <Input
      id={name}
      type={type || "text"}
      {...register(name)}
      placeholder={placeholder || ""}
      className={`text-sm ${errors[name] ? "border-danger ring-danger" : ""} ${className || ""}`}
      disabled={disabled}
      onInput={setValue ? (e) => setValue(name, e.target.value, { shouldValidate: false }) : undefined}
    />
    {errors[name] && <p className="text-[11px] text-danger">{errors[name].message}</p>}
  </div>
);

export default RHFField;
