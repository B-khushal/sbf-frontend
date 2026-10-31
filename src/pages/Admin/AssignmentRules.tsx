import React from 'react';
import { Sliders, Cpu, Compass, Activity, ShieldCheck, Zap } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';

const AssignmentRules: React.FC = () => {
  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Logistics', href: '/admin/delivery/analytics' },
          { label: 'Auto-Assignment Rules' },
        ]}
        title="Fleet Auto-Dispatch Algorithm"
        description="Dynamic routing heuristics, courier scoring formula, proximity radii, and timeout safeguards."
        liveStatus={{ label: 'Algorithm Engine Online', ping: true }}
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Search Radius"
          value="12 km"
          icon={Compass}
          color="blue"
          subtitle="Max courier dispatch bubble"
        />
        <StatCard
          title="Assignment Timeout"
          value="60s"
          icon={Activity}
          color="amber"
          subtitle="Auto-failover to next rider"
        />
        <StatCard
          title="Priority Basis"
          value="Distance + Load - Rating"
          icon={Cpu}
          color="emerald"
          subtitle="Continuous score weighting"
        />
      </div>

      {/* Main Algorithm Card */}
      <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 p-6 space-y-6 transition-all">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-rose-600" /> Auto-Match Priority Formula
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            How Spring Blossoms Florist automatically pairs newly prepared bouquets and cakes with available fleet riders.
          </p>
        </div>

        {/* Formula Box */}
        <div className="p-4 rounded-xl bg-[#edf1f7] dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.25),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] font-mono text-center text-xs md:text-sm">
          <span className="text-rose-600 font-bold">Score</span> = (Store Distance × 1.5) + (Active Orders Load × 4.0) - (Courier Rating × 3.0)
          <div className="text-slate-500 text-[11px] mt-1.5 font-sans font-medium">
            ※ Lower computed score results in higher assignment priority rank for the order handover.
          </div>
        </div>

        {/* Heuristic Breakdown */}
        <div className="space-y-4">
          <div className="flex gap-4 p-4 rounded-xl bg-white/70 dark:bg-slate-800 border border-white/80 dark:border-slate-700 shadow-xs">
            <div className="bg-rose-100 dark:bg-rose-950/50 p-2.5 rounded-xl h-11 w-11 flex items-center justify-center shrink-0 text-rose-600">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                1. Proximity Bounds Check
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                The dispatcher scans for online couriers within the max search radius. Partners outside the radius are excluded to protect fresh flower stem hydration and cake structure.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-white/70 dark:bg-slate-800 border border-white/80 dark:border-slate-700 shadow-xs">
            <div className="bg-amber-100 dark:bg-amber-950/50 p-2.5 rounded-xl h-11 w-11 flex items-center justify-center shrink-0 text-amber-600">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                2. Load Capacity Optimization
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Couriers already carrying their maximum assigned transit boxes are flagged as 'busy' by the algorithm to prevent delays and multi-stop batching issues.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-white/70 dark:bg-slate-800 border border-white/80 dark:border-slate-700 shadow-xs">
            <div className="bg-emerald-100 dark:bg-emerald-950/50 p-2.5 rounded-xl h-11 w-11 flex items-center justify-center shrink-0 text-emerald-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                3. Reassignment Timeout Safeguard
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                If a courier does not accept an app dispatch ping within 60 seconds, the engine automatically rolls over and alerts the next best scoring fleet partner with zero dispatcher intervention required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentRules;
