import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles,
  GripVertical,
  RotateCcw,
  UserCheck,
  RefreshCw,
  Eye,
  BarChart2,
  Sliders,
  ShieldCheck,
  Clock,
  Pin,
  CheckCircle2,
  Info
} from "lucide-react";

export interface MerchandisingStrategyPanelProps {
  section: string;
  sectionLabel: string;
  mode: "manual" | "smart" | "smart_rotation" | "personalized";
  onModeChange: (mode: "manual" | "smart" | "smart_rotation" | "personalized") => void;
  protectedTopCount: number;
  onProtectedTopCountChange: (count: number) => void;
  rotationFrequency: string;
  onRotationFrequencyChange: (freq: string) => void;
  rotationVersion: number;
  isRotationEnabled: boolean;
  onIsRotationEnabledChange: (enabled: boolean) => void;
  isPersonalizationEnabled: boolean;
  onIsPersonalizationEnabledChange: (enabled: boolean) => void;
  pinnedCount: number;
  onRotateNow: () => Promise<void>;
  isRotatingNow: boolean;
  onOpenPreview: () => void;
  onOpenAnalytics: () => void;
  onOpenGlobalSettings: () => void;
}

export const MerchandisingStrategyPanel: React.FC<MerchandisingStrategyPanelProps> = ({
  section,
  sectionLabel,
  mode,
  onModeChange,
  protectedTopCount,
  onProtectedTopCountChange,
  rotationFrequency,
  onRotationFrequencyChange,
  rotationVersion,
  isRotationEnabled,
  onIsRotationEnabledChange,
  isPersonalizationEnabled,
  onIsPersonalizationEnabledChange,
  pinnedCount,
  onRotateNow,
  isRotatingNow,
  onOpenPreview,
  onOpenAnalytics,
  onOpenGlobalSettings
}) => {
  const modes = [
    {
      id: "manual",
      name: "Mode A: Manual Sequence",
      icon: GripVertical,
      badge: "Fixed Sequence",
      badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
      description: "Preserves your exact drag-and-drop order. Pinned products stay in their assigned slots."
    },
    {
      id: "smart",
      name: "Mode B: Smart Ranking",
      icon: Sparkles,
      badge: "Performance-Driven",
      badgeColor: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300",
      description: "Ranks products using real sales data, ratings, inventory confidence, freshness, and discounts."
    },
    {
      id: "smart_rotation",
      name: "Mode C: Smart + Controlled Rotation",
      icon: RotateCcw,
      badge: "Recommended Default",
      badgeColor: "bg-pink-100 dark:bg-pink-950/40 text-[#ec4899] font-bold border border-pink-200 dark:border-pink-800",
      description: "Locks pinned items & top positions; deterministically rotates discovery products per schedule without refreshing jump."
    },
    {
      id: "personalized",
      name: "Mode D: Personalized Experience",
      icon: UserCheck,
      badge: "Privacy-Conscious",
      badgeColor: "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300",
      description: "Tailors discovery based on anonymous session category affinity. Gracefully falls back to Mode C."
    }
  ];

  return (
    <Card className="border border-slate-200/90 dark:border-slate-800/90 shadow-md rounded-2xl bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 overflow-hidden">
      <CardContent className="p-5 space-y-5">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Product Merchandising & Ordering Engine
              </span>
              <Badge className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900 text-[10px] font-bold">
                sbflorist.in
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Active strategy for <strong className="text-slate-900 dark:text-slate-100">{sectionLabel}</strong>. Changes take effect on storefront once published.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenPreview}
              className="h-8 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 text-slate-700 dark:text-slate-300 gap-1.5 shadow-sm"
            >
              <Eye className="h-3.5 w-3.5 text-pink-600" />
              Simulate & Preview
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAnalytics}
              className="h-8 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 gap-1.5 shadow-sm"
            >
              <BarChart2 className="h-3.5 w-3.5 text-purple-600" />
              Strategy Analytics
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenGlobalSettings}
              className="h-8 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 gap-1.5 shadow-sm"
            >
              <Sliders className="h-3.5 w-3.5 text-slate-600" />
              Global Settings
            </Button>
          </div>
        </div>

        {/* 4 Mode Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.id;

            return (
              <div
                key={m.id}
                onClick={() => onModeChange(m.id as any)}
                className={`relative cursor-pointer rounded-xl p-3.5 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-pink-50/40 dark:bg-pink-950/20 border-pink-500 dark:border-pink-600 shadow-sm ring-1 ring-pink-500/30"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? "bg-pink-500 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
                        {m.name.split(":")[1]}
                      </span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <Badge className={`text-[9px] px-1.5 py-0.5 rounded-md ${m.badgeColor}`}>
                    {m.badge}
                  </Badge>
                  <span className="text-[10px] font-mono text-slate-400">
                    {m.name.split(":")[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Controls Bar for Selected Mode */}
        {(mode === "smart_rotation" || mode === "smart" || mode === "personalized") && (
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Protected Top Positions */}
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  Protected Top Positions:
                </Label>
                <Select
                  value={String(protectedTopCount)}
                  onValueChange={(val) => onProtectedTopCountChange(Number(val))}
                >
                  <SelectTrigger className="w-[80px] h-8 text-xs font-bold bg-white dark:bg-slate-900 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Top 1</SelectItem>
                    <SelectItem value="2">Top 2</SelectItem>
                    <SelectItem value="3">Top 3</SelectItem>
                    <SelectItem value="4">Top 4 (Std)</SelectItem>
                    <SelectItem value="6">Top 6</SelectItem>
                    <SelectItem value="8">Top 8</SelectItem>
                    <SelectItem value="12">Top 12</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  (Positions 1–{protectedTopCount} locked by smart ranking)
                </span>
              </div>

              {/* Rotation Frequency (for Controlled Rotation) */}
              {mode === "smart_rotation" && (
                <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Rotation Window:
                  </Label>
                  <Select
                    value={rotationFrequency}
                    onValueChange={onRotationFrequencyChange}
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs font-bold bg-white dark:bg-slate-900 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily (24h)</SelectItem>
                      <SelectItem value="3days">Every 3 Days</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Pinned products count badge */}
              {pinnedCount > 0 && (
                <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-4">
                  <Pin className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <strong>{pinnedCount}</strong> Pinned to Slots
                  </span>
                </div>
              )}
            </div>

            {/* Version Bump & Rotate Now Button */}
            {mode === "smart_rotation" && (
              <div className="flex items-center gap-2.5">
                <Badge variant="outline" className="text-[11px] font-mono px-2 py-0.5 rounded-md border-slate-300 dark:border-slate-700">
                  Version: v{rotationVersion}
                </Badge>
                <Button
                  size="sm"
                  onClick={onRotateNow}
                  disabled={isRotatingNow}
                  className="h-8 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-lg gap-1.5 shadow-sm"
                  title="Deterministically rotates lower discovery positions to next sequence"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRotatingNow ? "animate-spin" : ""}`} />
                  {isRotatingNow ? "Rotating..." : "Rotate Now"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default MerchandisingStrategyPanel;
