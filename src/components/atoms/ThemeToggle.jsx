import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/store/ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * Accessible light/dark switch with a springy icon cross-fade.
 * `variant="pill"` renders a labelled toggle for menus; default is an icon button.
 */
const ThemeToggle = ({ className, variant = "icon" }) => {
  const { isDark, toggleTheme } = useTheme();

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors",
          className
        )}
      >
        <span className="flex items-center gap-2.5">
          {isDark ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
          {isDark ? "Dark mode" : "Light mode"}
        </span>
        <span
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            isDark ? "bg-primary" : "bg-muted-foreground/30"
          )}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm",
              isDark ? "left-[1.125rem]" : "left-0.5"
            )}
          />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted transition-colors pressable",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          {isDark ? <Moon className="h-[1.15rem] w-[1.15rem]" /> : <Sun className="h-[1.15rem] w-[1.15rem]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
