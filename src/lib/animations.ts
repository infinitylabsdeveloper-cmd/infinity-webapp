export const ANIMATION_CONFIG = {
  duration: {
    instant: 0.1,   // 100ms
    fast: 0.18,     // 180ms - ultra snappy
    normal: 0.22,   // 220ms - balanced buttery smooth
    medium: 0.28,   // 280ms
    slow: 0.35,     // 350ms
    progress: 0.4,  // 400ms
  },
  ease: {
    smooth: [0.16, 1, 0.3, 1] as const,     // Modern cubic-bezier
    spring: [0.22, 1, 0.36, 1] as const,    // Apple-style snappy spring
    out: [0.16, 1, 0.3, 1] as const,
    in: [0.4, 0, 1, 1] as const,
    inOut: [0.4, 0, 0.2, 1] as const,
  },
  pageTransition: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
  questionSlide: {
    initial: (dir: number) => ({ opacity: 0, x: dir * 24 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
  modalTransition: {
    initial: { opacity: 0, scale: 0.96, y: 6 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 6 },
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
  },
  buttonTap: {
    whileHover: { scale: 1.015 },
    whileTap: { scale: 0.97 },
    transition: { duration: 0.12 }
  },
  cardHover: {
    whileHover: { y: -3, scale: 1.01 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
  }
};

