import { Link } from "react-router-dom";

const Logo = ({ showTagline = true, size = "md", dark = false, nameClassName = "flex" }) => {
  // Compact on phones, full size from sm up (except when size="sm" is forced).
  const iconSize = size === "sm" ? "w-9 h-9" : "w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11";
  const textSize = size === "sm" ? "text-base" : "text-[15px] sm:text-lg lg:text-xl";

  return (
    <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0" aria-label="Saffron & Silk — home">
      <div className="relative shrink-0">
        <div
          className={`${iconSize} rounded-2xl overflow-hidden shadow-lg shadow-[#9E2B5E]/20 group-hover:shadow-[#9E2B5E]/35 group-hover:-translate-y-0.5 transition-all duration-300`}
        >
          <img
            src="/logo.svg"
            alt="Saffron & Silk"
            className="w-full h-full object-contain"
            width={44}
            height={44}
          />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#D2691E]/25 to-[#9E2B5E]/25 blur-md group-hover:blur-lg transition-all duration-300 -z-10" />
      </div>
      <div className={`${nameClassName} flex-col leading-tight min-w-0`}>
        <div className="flex items-baseline gap-1 whitespace-nowrap">
          <span className={`${textSize} font-display font-bold ${dark ? "text-white" : "text-foreground"} tracking-tight`}>
            Saffron
          </span>
          <span className={`${textSize} font-display font-semibold italic bg-gradient-to-r from-[#D2691E] to-[#9E2B5E] bg-clip-text text-transparent tracking-tight`}>
            &amp; Silk
          </span>
        </div>
        {showTagline && (
          <span className={`hidden sm:block text-[9px] ${dark ? "text-[#A1887F]" : "text-muted-foreground"} font-medium tracking-[0.22em] uppercase`}>
            Bakehouse &amp; Boutique
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
