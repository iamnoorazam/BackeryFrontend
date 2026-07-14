import { cn } from "@/lib/utils";

const Card = ({ className, ...props }) => (
  <div className={cn("bg-white border border-stone-200/80 rounded-2xl shadow-soft", className)} {...props} />
);

const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-5 pb-0", className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("text-lg font-bold text-stone-900 leading-tight", className)} {...props} />
);

const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-stone-500", className)} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-5", className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div className={cn("flex items-center p-5 pt-0", className)} {...props} />
);

const CardImage = ({ className, ...props }) => (
  <div className={cn("relative overflow-hidden rounded-t-2xl", className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardImage };
