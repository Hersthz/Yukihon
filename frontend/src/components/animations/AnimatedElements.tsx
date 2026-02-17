import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

// Enhanced animation variants
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: custom * 0.1,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  }),
};

export const fadeInDownVariants: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: custom * 0.1,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  }),
};

export const fadeInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: (custom = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      delay: custom * 0.1,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  }),
};

export const fadeInRightVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: (custom = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      delay: custom * 0.1,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  }),
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (custom = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: custom * 0.1,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  }),
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const bounceVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Animated container components
export const FadeInUp = ({
  children,
  custom = 0,
  delay = 0,
}: {
  children: ReactNode;
  custom?: number;
  delay?: number;
}) => (
  <motion.div
    variants={fadeInUpVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    custom={custom}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {children}
  </motion.div>
);

export const FadeInDown = ({
  children,
  custom = 0,
  delay = 0,
}: {
  children: ReactNode;
  custom?: number;
  delay?: number;
}) => (
  <motion.div
    variants={fadeInDownVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    custom={custom}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {children}
  </motion.div>
);

export const FadeInLeft = ({
  children,
  custom = 0,
  delay = 0,
}: {
  children: ReactNode;
  custom?: number;
  delay?: number;
}) => (
  <motion.div
    variants={fadeInLeftVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    custom={custom}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {children}
  </motion.div>
);

export const FadeInRight = ({
  children,
  custom = 0,
  delay = 0,
}: {
  children: ReactNode;
  custom?: number;
  delay?: number;
}) => (
  <motion.div
    variants={fadeInRightVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    custom={custom}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({
  children,
  custom = 0,
  delay = 0,
}: {
  children: ReactNode;
  custom?: number;
  delay?: number;
}) => (
  <motion.div
    variants={scaleInVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    custom={custom}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {children}
  </motion.div>
);
