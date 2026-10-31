import React, { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SoftButton } from "@/components/dashboard/SoftButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CatalogSettingsPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [outOfStockBehavior, setOutOfStockBehavior] = useState("hide");
  const [enableLowStockAlerts, setEnableLowStockAlerts] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [enableAutoSKU, setEnableAutoSKU] = useState(true);

  const handleSaveSettings = () => {
    toast({
      title: "Catalog Settings Saved",
      description: "Global product catalog settings updated successfully.",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Catalog & Inventory Rules"
        subtitle="Configure global catalog behavior, out-of-stock handling, and stock alert thresholds."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Inventory', href: '/admin/inventory' },
          { label: 'Settings' },
        ]}
        statusBadge={{ label: "Active Configuration", variant: "success" }}
        actions={
          <div className="flex items-center gap-3">
            <SoftButton variant="secondary" icon={ArrowLeft} onClick={() => navigate('/admin/inventory')}>
              Back
            </SoftButton>
            <SoftButton variant="primary" icon={Save} onClick={handleSaveSettings}>
              Save Settings
            </SoftButton>
          </div>
        }
      />

      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)] p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Out-Of-Stock Handling Rules</h2>
          <p className="text-xs text-slate-500 mt-0.5">Define how customer-facing pages behave when bouquets, cakes, or gifts run out of stock.</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Global Default Out-Of-Stock Action
            </Label>
            <Select value={outOfStockBehavior} onValueChange={setOutOfStockBehavior}>
              <SelectTrigger className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hide">Automatically Hide Product from Shop</SelectItem>
                <SelectItem value="badge">Show "Out of Stock" Badge & Disable Cart</SelectItem>
                <SelectItem value="backorder">Allow Backorders / Advance Pre-orders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#edf1f7] dark:bg-slate-800/50 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border border-slate-200/40 dark:border-slate-800">
            <div>
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-100">Low Stock Threshold Notifications</Label>
              <p className="text-xs text-slate-500 mt-0.5">Receive dashboard alerts when stock drops below minimum threshold.</p>
            </div>
            <Switch checked={enableLowStockAlerts} onCheckedChange={setEnableLowStockAlerts} />
          </div>

          {enableLowStockAlerts && (
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Low Stock Threshold Limit (Units)
              </Label>
              <Select value={lowStockThreshold} onValueChange={setLowStockThreshold}>
                <SelectTrigger className="h-11 rounded-xl bg-[#edf1f7] dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border-none w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Units (Critical)</SelectItem>
                  <SelectItem value="5">5 Units (Standard)</SelectItem>
                  <SelectItem value="10">10 Units (High buffer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#edf1f7] dark:bg-slate-800/50 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] border border-slate-200/40 dark:border-slate-800">
            <div>
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-100">Automatic SKU Generator</Label>
              <p className="text-xs text-slate-500 mt-0.5">Auto-generate unique SKU codes when new products are created.</p>
            </div>
            <Switch checked={enableAutoSKU} onCheckedChange={setEnableAutoSKU} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogSettingsPage;
