import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Mail, CheckCheck, Sparkles, Send, ShieldCheck, Star } from 'lucide-react';

export const HeroVisual3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Motion values for smooth 3D tilt tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 220 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion || isMobile || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center select-none"
      style={{ perspective: 1200 }}
      aria-hidden="true"
    >
      {/* Ambient background glow */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-brand-600/25 via-indigo-500/20 to-accent-light/30 blur-3xl pointer-events-none -z-10" />

      {/* Main 3D Card Stage */}
      <motion.div
        style={{
          rotateX: isReducedMotion || isMobile ? 0 : rotateX,
          rotateY: isReducedMotion || isMobile ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={isReducedMotion ? undefined : { y: [0, -8, 0] }}
        transition={isReducedMotion ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full max-w-[310px] sm:max-w-[380px] h-[310px] sm:h-[360px] pointer-events-none mx-auto"
      >
        {/* Layer 0: Envelope Back Plate */}
        <div
          style={{ transform: 'translateZ(0px)' }}
          className="absolute inset-x-4 bottom-4 h-56 rounded-3xl bg-gradient-to-b from-brand-900/60 to-slate-950/80 backdrop-blur-xl border border-brand-500/30 shadow-2xl p-4 flex flex-col justify-end"
        >
          <div className="flex items-center justify-between text-brand-300 text-xs px-2 pb-1">
            <span className="font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-accent-light" />
              MailCraft Workspace
            </span>
            <span className="text-[10px] opacity-75">AI Processing Ready</span>
          </div>
        </div>

        {/* Layer 1: Polished Email Draft Card (Floats out of envelope) */}
        <div
          style={{ transform: 'translateZ(35px)' }}
          className="absolute inset-x-2 top-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xl space-y-3"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                P
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Professor Sharma</p>
                <p className="text-[10px] text-slate-400">Recipient • Academic</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
              <Sparkles className="w-2.5 h-2.5" />
              Tone: Professional
            </div>
          </div>

          {/* Email Subject & Body Preview */}
          <div className="space-y-1.5 text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Subject: Request for Assignment Extension
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
              Dear Professor Sharma, I hope this email finds you well. I am writing to respectfully request a 48-hour extension on the upcoming project submission due to medical consultation...
            </p>
          </div>

          {/* Card Footer Status */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>Length: Medium (120 words)</span>
            <span className="text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1">
              <CheckCheck className="w-3 h-3 text-emerald-500" /> Formatted & Verified
            </span>
          </div>
        </div>

        {/* Layer 2: Floating Quality Score Pill */}
        <div
          style={{ transform: 'translateZ(70px)' }}
          className="absolute -top-3 right-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xl border border-white/20 dark:border-slate-800 backdrop-blur-md"
        >
          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <CheckCheck className="w-2.5 h-2.5" />
          </div>
          <span>Quality Score 96 / 100</span>
        </div>

        {/* Layer 3: Floating Clarity Badge */}
        <div
          style={{ transform: 'translateZ(85px)' }}
          className="absolute -bottom-2 -left-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold shadow-lg border border-slate-200 dark:border-slate-800 backdrop-blur-md"
        >
          <div className="w-4 h-4 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center">
            <Star className="w-2.5 h-2.5 fill-brand-600 text-brand-600" />
          </div>
          <span>Grammar & Context: 100%</span>
        </div>
      </motion.div>
    </div>
  );
};
