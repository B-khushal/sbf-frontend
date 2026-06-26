import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sliders, Cpu, Compass, Activity } from 'lucide-react';

const AssignmentRules: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Assignment Rules</h1>
        <p className="text-muted-foreground">Detailed layout of the automated routing and Courier matching algorithm.</p>
      </div>

      <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-emerald-50/55 border-b border-emerald-100">
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-emerald-700" /> Auto-Match Priority Formula
          </CardTitle>
          <CardDescription>How Spring Blossoms Florist maps dispatch requests to courier partners.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="p-4 bg-emerald-900 text-white rounded-lg font-mono text-center text-sm md:text-base shadow">
            Score = (Store Distance * 1.5) + (Active Orders Load * 4.0) - (Courier Rating * 3.0)
            <div className="text-emerald-300 text-xs mt-2">※ Lower computed score results in higher assignment priority rank.</div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-emerald-50 p-2.5 rounded-full h-11 w-11 flex items-center justify-center shrink-0">
                <Compass className="h-5.5 w-5.5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-950">1. Proximity Bounds Check</h3>
                <p className="text-sm text-muted-foreground">
                  The dispatcher scans for online couriers within the max search radius. Partners outside the radius are excluded to ensure fresh delivery times.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-emerald-50 p-2.5 rounded-full h-11 w-11 flex items-center justify-center shrink-0">
                <Sliders className="h-5.5 w-5.5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-950">2. Load Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Couriers already carrying max capacity limits are set to 'busy' to prevent delivery bottlenecks.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-emerald-50 p-2.5 rounded-full h-11 w-11 flex items-center justify-center shrink-0">
                <Activity className="h-5.5 w-5.5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-950">3. Reassignment Timeout Safeguard</h3>
                <p className="text-sm text-muted-foreground">
                  If a courier does not accept a dispatch request within the timeout limit (e.g. 60 seconds), the system automatically cancels the offer, records a statistics adjustment, and dispatches to the next best match.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentRules;
