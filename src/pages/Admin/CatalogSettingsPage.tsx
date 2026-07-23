import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, AlertTriangle } from "lucide-react";

const CatalogSettingsPage: React.FC = () => {
  const { toast } = useToast();
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
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Catalog & Inventory Settings
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure global catalog behavior, out-of-stock rules, and inventory threshold alerts.
            </p>
          </div>
        </div>

        <Button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm">
          <Save className="h-4 w-4" /> Save Settings
        </Button>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Out-Of-Stock Handling Rules</CardTitle>
          <CardDescription className="text-xs">Define how customer-facing pages behave when products run out of stock.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div>
            <Label className="text-xs">Global Default Out-Of-Stock Action</Label>
            <Select value={outOfStockBehavior} onValueChange={setOutOfStockBehavior}>
              <SelectTrigger className="h-9 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hide">Automatically Hide Product from Shop</SelectItem>
                <SelectItem value="badge">Show "Out of Stock" Badge & Disable Cart</SelectItem>
                <SelectItem value="backorder">Allow Backorders / Advance Pre-orders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <Label className="text-xs font-semibold">Low Stock Threshold Notifications</Label>
              <p className="text-[11px] text-muted-foreground">Receive dashboard alerts when stock drops below minimum threshold.</p>
            </div>
            <Switch checked={enableLowStockAlerts} onCheckedChange={setEnableLowStockAlerts} />
          </div>

          {enableLowStockAlerts && (
            <div>
              <Label className="text-xs">Low Stock Threshold Limit (Units)</Label>
              <Select value={lowStockThreshold} onValueChange={setLowStockThreshold}>
                <SelectTrigger className="h-8 text-xs mt-1 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Units</SelectItem>
                  <SelectItem value="5">5 Units</SelectItem>
                  <SelectItem value="10">10 Units</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <Label className="text-xs font-semibold">Automatic SKU Generator</Label>
              <p className="text-[11px] text-muted-foreground">Auto-generate unique SKU codes when new products are created.</p>
            </div>
            <Switch checked={enableAutoSKU} onCheckedChange={setEnableAutoSKU} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatalogSettingsPage;
