"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AgentChat from "@/components/AgentChat";

type FloatingAgentProps = {
  tripDays: number;
  selectedDestinations: string[];
};

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L13.8 7.2L19 9L13.8 10.8L12 16L10.2 10.8L5 9L10.2 7.2L12 2Z"
        fill="currentColor"
      />
      <path
        d="M18.5 15L19.4 17.6L22 18.5L19.4 19.4L18.5 22L17.6 19.4L15 18.5L17.6 17.6L18.5 15Z"
        fill="currentColor"
      />
      <path
        d="M5.5 14L6.25 16.25L8.5 17L6.25 17.75L5.5 20L4.75 17.75L2.5 17L4.75 16.25L5.5 14Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function FloatingAgent({
  tripDays,
  selectedDestinations,
}: FloatingAgentProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="launcher"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.92 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="group flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_35px_rgba(6,182,212,0.35)] transition duration-300 hover:scale-[1.03] hover:bg-cyan-400"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/90 text-cyan-300 transition group-hover:rotate-6">
              <SparkIcon />
            </span>
            <span>Travel Assistant</span>
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 26, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
            className="w-[370px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:w-[430px]"
          >
            <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-blue-500/10 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <motion.div
                    initial={{ rotate: -8, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.28, delay: 0.08 }}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300"
                  >
                    <SparkIcon />
                  </motion.div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      AI Travel Assistant
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Ask questions using your current dashboard filters and trip context.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: 0.08 }}
              className="max-h-[75vh] overflow-y-auto p-4"
            >
              <AgentChat
                tripDays={tripDays}
                selectedDestinations={selectedDestinations}
                compact
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}