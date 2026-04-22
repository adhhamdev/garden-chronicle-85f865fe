import { GARDEN } from "@/lib/garden";
import gardenLogo from "@/assets/garden-logo.png";

export const SiteFooter = () => (
  <footer className="bg-primary text-primary-foreground pt-16 pb-8 mt-16">
    <div className="container">
      <div className="grid md:grid-cols-3 gap-10 items-start">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={gardenLogo}
              alt="Rabeeyunil Awwal Mango Garden logo"
              width={64}
              height={64}
              className="w-12 h-12 object-contain"
              loading="lazy"
            />
            <span className="font-display text-2xl">{GARDEN.shortName}</span>
          </div>
          <p className="text-primary-foreground/70 text-sm leading-relaxed font-sub">{GARDEN.location}</p>
          <p className="text-primary-foreground/55 text-xs mt-3 font-sub">Established {GARDEN.established}</p>
        </div>

        <div className="flex justify-center">
          <img
            src={gardenLogo}
            alt=""
            width={128}
            height={128}
            aria-hidden
            className="w-24 h-24 object-contain opacity-90"
            loading="lazy"
          />
        </div>

        <div className="md:text-right">
          <p className="font-display text-xl text-accent-light italic mb-2">Built with care for every tree ﷺ</p>
          <p className="text-primary-foreground/60 text-xs font-sub">A living digital record — updated as the garden grows.</p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-primary-foreground/15 flex flex-col sm:flex-row justify-between gap-2 text-xs text-primary-foreground/50 font-sub">
        <span>© {new Date().getFullYear()} {GARDEN.name}</span>
        <span>Hambantota, Sri Lanka</span>
      </div>
    </div>
  </footer>
);
