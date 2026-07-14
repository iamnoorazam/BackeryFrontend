import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

const Logo = ({ showTagline = true, size = "md" }) => {
  const iconSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconInner = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const textSize = size === "sm" ? "text-base" : "text-xl";

  return (
    <Link to="/" className="flex items-center gap-2.5 group shrink-0">
      <div className="relative shrink-0">
        <div className={`${iconSize} rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-all duration-300`}>
          <UtensilsCrossed className={`${iconInner} text-white`} />
        </div>
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-orange-600/20 to-amber-500/20 blur-md group-hover:blur-lg transition-all duration-300 -z-10" />
      </div>
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline">
          <span className={`${textSize} font-extrabold text-stone-900 tracking-tight`}>Apna</span>
          <span className={`${textSize} font-extrabold text-orange-600 tracking-tight`}>Mart</span>
        </div>
        {showTagline && (
          <span className="text-[9px] text-stone-400 font-medium tracking-[0.2em] uppercase">Fresh & Fast</span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
