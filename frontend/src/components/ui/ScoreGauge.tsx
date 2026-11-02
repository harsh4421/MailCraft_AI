import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label = 'Quality Score',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let color = '#EF4444'; // Red
  let statusText = 'Needs Revision';
  if (clampedScore >= 80) {
    color = '#10B981'; // Green
    statusText = 'Excellent';
  } else if (clampedScore >= 65) {
    color = '#F59E0B'; // Amber
    statusText = 'Good';
  } else if (clampedScore >= 50) {
    color = '#6366F1'; // Indigo
    statusText = 'Fair';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-extrabold text-slate-900 dark:text-slate-100"
          >
            {clampedScore}
          </motion.span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span
          className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          {statusText}
        </span>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
};

export const ScoreProgressBar: React.FC<{
  label: string;
  score: number;
  colorClass?: string;
}> = ({ label, score, colorClass = 'bg-brand-600' }) => {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-bold text-slate-900 dark:text-slate-100">{clamped}/100</span>
      </div>
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
};

export const CriteriaRatingBar: React.FC<{
  label: string;
  rating: number; // 1 to 5 scale
  colorClass?: string;
}> = ({ label, rating, colorClass = 'bg-brand-600' }) => {
  const clamped = Math.max(1, Math.min(5, Math.round(rating)));
  const percentage = (clamped / 5) * 100;
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
          <span className="text-amber-500 text-[11px]">{'★'.repeat(clamped)}{'☆'.repeat(5 - clamped)}</span>
          <span className="font-mono text-[11px]">{clamped}/5</span>
        </div>
      </div>
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
};
