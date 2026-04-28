export const motionTokens = {
  distance: {
    sm: 8,
    md: 20,
    lg: 40,
  },
  duration: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.5,
  },
  stiffness: {
    loose: 150,
    normal: 300,
    snappy: 500,
  },
} as const

export const transitions = {
  spring: {
    type: 'spring',
    stiffness: motionTokens.stiffness.normal,
    damping: 30,
  },
  springSnappy: {
    type: 'spring',
    stiffness: motionTokens.stiffness.snappy,
    damping: 40,
  },
  ease: {
    duration: motionTokens.duration.normal,
    ease: 'easeOut',
  },
  slow: {
    duration: motionTokens.duration.slow,
    ease: 'easeInOut',
  },
} as const
