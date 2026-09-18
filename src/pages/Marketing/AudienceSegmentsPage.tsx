import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Users,
  Sparkles,
  ShoppingBag,
  Flame,
  RotateCcw,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { marketingService } from '@/services/marketingService';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export const AudienceSegmentsPage: React.FC = () => {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const { user } = useAuth();

  const isHead = user?.role === 'marketing_head' || user?.role === 'platform_admin' || user?.role === 'admin';

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getSegments();
      if (res?.success) {
        setSegments(res.segments || []);
      }
    } catch (e) {
      toast.error('Failed to load audience segments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await marketingService.createSegment(formData);
      if (res?.success) {
        toast.success('Audience segment created successfully!');
        setIsCreateOpen(false);
        setFormData({ name: '', description: '' });
        fetchSegments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create segment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-pink-400" />
            Audience Segments &amp; Personas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic customer groups based on behavioral activity, intent level, and lifetime value
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isHead && (
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs h-8 rounded-xl flex items-center gap-1.5 shadow-md shadow-pink-950/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Segment</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchSegments}
            disabled={loading}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-pink-400' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((seg) => (
          <Card
            key={seg.id}
            className="bg-slate-900/70 border-slate-800/80 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-bold text-slate-200">
                  {seg.name}
                </CardTitle>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {seg.type}
                </span>
              </div>
              <CardDescription className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {seg.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">Dynamic Members</span>
                <span className="font-mono font-bold text-pink-400">
                  {seg.memberCount || 14} members
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Segment Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-pink-400" />
              Create Custom Audience Segment
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Define a new marketing segment for targeted campaigns and promotions
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSegment} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Segment Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Delhi Luxury Rose Enthusiasts"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Description &amp; Criteria
              </label>
              <textarea
                rows={3}
                placeholder="Criteria: Customers who viewed bouquets over ₹3,000 in the last 14 days"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)} className="h-8 text-xs text-slate-400">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs bg-pink-600 hover:bg-pink-500 text-white font-semibold">
                Create Segment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AudienceSegmentsPage;
