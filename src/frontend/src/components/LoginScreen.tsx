import { motion } from "motion/react";
import type React from "react";

interface LoginScreenProps {
  onChildLogin: () => void;
  onParentLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onChildLogin,
  onParentLogin,
}) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {/* Floating stars decoration */}
      {Array.from({ length: 12 }, (_, i) => `deco-star-${i}`).map((id, i) => (
        <motion.div
          key={id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${[10, 85, 25, 70, 5, 90, 40, 60, 15, 80, 50, 35][i]}%`,
            top: `${[10, 15, 30, 20, 55, 45, 75, 80, 90, 70, 5, 92][i]}%`,
            width: `${[4, 3, 5, 3, 4, 3, 4, 3, 4, 5, 3, 4][i]}px`,
            height: `${[4, 3, 5, 3, 4, 3, 4, 3, 4, 5, 3, 4][i]}px`,
            backgroundColor: "oklch(0.95 0.05 85)",
            boxShadow: "0 0 6px oklch(0.95 0.05 85)",
          }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
          transition={{
            duration: 1.8 + i * 0.3,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Card container */}
      <motion.div
        className="relative flex flex-col items-center w-full max-w-sm"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Glow halo behind logo */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "240px",
            height: "240px",
            top: "-20px",
            background:
              "radial-gradient(circle, oklch(0.82 0.18 85 / 0.25) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="relative z-10"
        >
          <img
            src="/assets/generated/understandify-logo-half.dim_512x512.png"
            alt="Understandify mascot"
            className="w-44 h-44 md:w-52 md:h-52 object-contain drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 0 24px oklch(0.82 0.18 85 / 0.7))",
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mt-2 mb-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h1
            className="font-fredoka text-5xl md:text-6xl font-bold tracking-wide"
            style={{
              color: "oklch(0.82 0.18 85)",
              textShadow:
                "0 0 30px oklch(0.82 0.18 85 / 0.6), 0 0 60px oklch(0.82 0.18 85 / 0.3)",
            }}
          >
            Understandify
          </h1>
          <p
            className="font-nunito text-lg font-semibold mt-1"
            style={{ color: "oklch(0.75 0.20 195)" }}
          >
            🚀 Safe Learning for Kids
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-3/4 my-6 rounded-full"
          style={{
            height: "1px",
            background:
              "linear-gradient(to right, transparent, oklch(0.82 0.18 85 / 0.5), transparent)",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        />

        {/* Prompt text */}
        <motion.p
          className="font-nunito text-base font-semibold mb-5 text-center"
          style={{ color: "oklch(0.70 0.06 265)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          Who is exploring today?
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col gap-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {/* Child button */}
          <motion.button
            type="button"
            data-ocid="login.child_button"
            onClick={onChildLogin}
            className="relative w-full py-4 rounded-2xl font-fredoka text-2xl font-bold overflow-hidden group"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.22 145), oklch(0.68 0.24 180))",
              boxShadow:
                "0 4px 24px oklch(0.72 0.22 145 / 0.45), 0 0 0 1px oklch(0.75 0.22 145 / 0.3)",
              color: "oklch(0.98 0.01 265)",
            }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Shimmer overlay */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.98 0.01 265), transparent)",
              }}
            />
            <span className="relative z-10">I'm a Child 🚀</span>
          </motion.button>

          {/* Parent button */}
          <motion.button
            type="button"
            data-ocid="login.parent_button"
            onClick={onParentLogin}
            className="relative w-full py-4 rounded-2xl font-fredoka text-2xl font-bold overflow-hidden group"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.30 0.08 265), oklch(0.26 0.10 280))",
              boxShadow:
                "0 4px 24px oklch(0.15 0.05 265 / 0.6), 0 0 0 1px oklch(0.82 0.18 85 / 0.35)",
              color: "oklch(0.82 0.18 85)",
            }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              style={{ background: "oklch(0.82 0.18 85)" }}
            />
            <span className="relative z-10">I'm a Parent 🔐</span>
          </motion.button>
        </motion.div>

        {/* Subtle footer note */}
        <motion.p
          className="font-nunito text-xs mt-8 text-center"
          style={{ color: "oklch(0.40 0.05 265)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Parents: use your PIN to access Parent Mode
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
