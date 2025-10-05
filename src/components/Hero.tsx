import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Activity, Timer, BarChart3, Target } from "lucide-react";
import { useEffect, useState } from "react";



export function Hero() {
  // Slideshow images (all from public/assets)
  const slideshowImages = [
    "/assets/hero-fitness.jpg",
    "/assets/hero2.png",
    "/assets/hero3.png",
    "/assets/hero4.png",
    "/assets/hero5.png",
  ];
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true);
      // Wait a moment for the current photo to "fall", then change to next
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slideshowImages.length);
        setTransitioning(false);
      }, 1500); // Photo falls for 1.5 seconds, then new one appears
    }, 6000);
    return () => clearInterval(timer);
  }, [slideshowImages.length]);

  return (
    <section className="relative w-full min-h-[92vh] overflow-hidden bg-white text-slate-900">
      {/* Paper grid background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(2,6,23,0.07)_1px,transparent_1px)] bg-[size:22px_22px]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-lime-100/50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-5">
          {/* Left: editorial headline */}
          <div className="order-2 space-y-8 lg:order-1 lg:col-span-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/10 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              Built for consistency • Not hacks
            </div>
            <h1 className="text-[42px] font-extrabold leading-[1.04] tracking-tight sm:text-6xl">
              Train bold.
              <span className="relative mx-2 inline-block -rotate-1 rounded bg-lime-300/70 px-2 text-slate-900">
                Make it yours.
              </span>
            </h1>
            <p className="max-w-xl text-lg text-slate-700">
              A clear weekly cadence, adaptive sessions, and honest feedback. No dark gradients. No fluff. Just a program that works for your life.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="px-8 text-base bg-black text-white hover:bg-black/90 ring-2 ring-lime-300 ring-offset-2 ring-offset-white">
                <Link to="/signup">Start building</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 text-base border-slate-800/20 text-slate-900 hover:bg-lime-50">
                <Link to="/login">I'm returning</Link>
              </Button>
            </div>

            {/* Feature list - brutalist ticks */}
            <ul className="mt-2 grid max-w-xl grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <li className="flex items-center gap-3 rounded-md border border-slate-900/10 bg-white px-3 py-2 shadow-sm">
                <Activity className="h-4 w-4 text-lime-600" />
                Adaptive training by energy
              </li>
              <li className="flex items-center gap-3 rounded-md border border-slate-900/10 bg-white px-3 py-2 shadow-sm">
                <Timer className="h-4 w-4 text-lime-600" />
                Sessions that fit busy days
              </li>
              <li className="flex items-center gap-3 rounded-md border border-slate-900/10 bg-white px-3 py-2 shadow-sm">
                <BarChart3 className="h-4 w-4 text-lime-600" />
                Clear progress markers
              </li>
              <li className="flex items-center gap-3 rounded-md border border-slate-900/10 bg-white px-3 py-2 shadow-sm">
                <Target className="h-4 w-4 text-lime-600" />
                Built around your goals
              </li>
            </ul>
          </div>

          {/* Right: polaroid collage */}
          <div className="order-1 lg:order-2 lg:col-span-2">
            <div className="relative mx-auto w-full max-w-[520px]">
              {/* Back card */}
              <div className="absolute left-6 top-10 -rotate-6 rounded-xl border-2 border-black/10 bg-white p-2 shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
                <img src="/assets/hero3.png" alt="Progress dashboard" className="h-48 w-72 rounded-md object-cover" />
              </div>
              {/* Mid card */}
              <div className="absolute right-6 top-0 rotate-3 rounded-xl border-2 border-black/10 bg-white p-2 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
                <img src="/assets/hero2.png" alt="Nutrition snapshot" className="h-52 w-72 rounded-md object-cover" />
              </div>
              {/* Front card - slideshow */}
              <div className="relative z-10 rounded-2xl border-2 border-black/10 bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-500">
                <div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-slate-100">
                  {slideshowImages.map((src, idx) => {
                    const isCurrent = idx === current;
                    const isNext = idx === (current + 1) % slideshowImages.length;
                    const shouldFall = isCurrent && transitioning;
                    const shouldReveal = isNext && transitioning;
                    
                    return (
                      <div
                        key={src}
                        className={`absolute inset-0 ${
                          isCurrent ? "opacity-100" : isNext && transitioning ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ 
                          zIndex: isCurrent ? 10 : isNext ? 8 : 1
                        }}
                      >
                        {/* Left pin - always stays */}
                        <div className="absolute left-4 top-4 z-20 h-2 w-2 rounded-full bg-slate-600 shadow-md" />
                        
                        {/* Right pin - disappears when falling, appears when revealing */}
                        <div 
                          className={`absolute right-4 top-4 z-20 h-2 w-2 rounded-full bg-slate-600 shadow-md transition-opacity duration-300 ${
                            shouldFall ? "opacity-0" : "opacity-100"
                          }`} 
                        />
                        
                        {/* Photo */}
                        <img
                          src={src}
                          alt="Training scene"
                          className="h-full w-full object-cover rounded-xl"
                          style={{
                            transformOrigin: "24px 24px", // Left pin position
                            transform: shouldFall
                              ? "rotate(45deg)"
                              : shouldReveal
                              ? "translateY(0px) scale(1)"
                              : isCurrent
                              ? "rotate(0deg)"
                              : "translateY(20px) scale(0.95)",
                            opacity: shouldFall ? 0 : 1,
                            transition: shouldFall
                              ? "transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.2s ease-out"
                              : shouldReveal
                              ? "transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease-in"
                              : "transform 0.3s ease-out, opacity 0.3s ease-out"
                          }}
                        />
                        
                        {/* Consistent shadow overlay */}
                        <div className="absolute inset-0 bg-black/8 rounded-xl pointer-events-none" />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-800">Today • Strength + Zone-2</div>
                  <div className="rounded bg-lime-300/70 px-2 py-1 text-xs font-semibold text-slate-900" aria-hidden>
                    &nbsp;
                  </div>
                </div>
                {/* Dots indicator */}
                <div className="absolute bottom-3 right-4 flex gap-1">
                  {slideshowImages.map((_, idx) => (
                    <span
                      key={idx}
                      className={`inline-block h-2 w-2 rounded-full transition-all duration-300 ${idx === current ? "bg-lime-500" : "bg-slate-300"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Minimal stats strip removed (demo data) */}
      </div>
    </section>
  );
}