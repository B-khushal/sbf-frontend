import { PageHeader } from '@/components/dashboard/PageHeader';
import { SoftButton } from '@/components/dashboard/SoftButton';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getVendorById, updateVendorStatus, approveVendor } from '@/services/vendorService';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft, Store, User, Mail, Phone, MapPin, Building2,
    FileText, Briefcase, Landmark, Calendar, Check, X,
    Pause, Play, Download
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import ReactSignatureCanvas from "react-signature-canvas";
import { UPLOADS_URL } from '@/config';

const VendorDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Approval dialog state
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [adminSignature, setAdminSignature] = useState("");
    const sigCanvas = React.useRef<ReactSignatureCanvas>(null);
    const [approvalLoading, setApprovalLoading] = useState(false);

    useEffect(() => {
        fetchVendorDetails();
    }, [id]);

    const fetchVendorDetails = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getVendorById(id);
            // The backend returns { success: true, vendor: {...} }
            setVendor(data.vendor || data);
        } catch (error: any) {
            toast({
                title: "Error fetching vendor",
                description: error.message || "Failed to load vendor details",
                variant: "destructive"
            });
            navigate('/admin/vendors');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
            case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
            case 'suspended': return <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!id) return;
        try {
            await updateVendorStatus(id, newStatus);
            toast({
                title: "Status Updated",
                description: `Vendor status has been changed to ${newStatus}.`
            });
            fetchVendorDetails();
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update vendor status",
                variant: "destructive"
            });
        }
    };

    const handleApprove = async () => {
        if (!id) return;
        if (sigCanvas.current?.isEmpty()) {
            toast({
                title: "Signature Required",
                description: "Please provide your signature to approve this contract.",
                variant: "destructive"
            });
            return;
        }

        try {
            setApprovalLoading(true);
            const signature = sigCanvas.current?.getCanvas().toDataURL('image/png') || '';

            await approveVendor(id, signature);

            toast({
                title: "Vendor Approved",
                description: "The vendor has been approved and the contract has been finalized."
            });

            setShowApprovalDialog(false);
            fetchVendorDetails();
        } catch (error: any) {
            toast({
                title: "Approval Failed",
                description: error.message || "Failed to approve vendor.",
                variant: "destructive"
            });
        } finally {
            setApprovalLoading(false);
        }
    };

    const clearSignature = () => {
        sigCanvas.current?.clear();
    };

    const getPdfUrl = (pdfPath: string) => {
        if (!pdfPath) return '';
        return `${UPLOADS_URL}${pdfPath}`;
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!vendor) return null;

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
            <PageHeader
        title={vendor.storeName || 'Vendor Profile'}
        subtitle={`Registered on ${new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} | Owner: ${vendor.ownerName || vendor.user?.name || 'Partner'}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Vendors', href: '/admin/vendors' },
          { label: vendor.storeName || 'Details' },
        ]}
        statusBadge={{
          label: vendor.status === 'approved' ? 'Active Vendor' : vendor.status === 'pending' ? 'Pending Approval' : vendor.status,
          variant: vendor.status === 'approved' ? 'success' : vendor.status === 'pending' ? 'warning' : 'rose',
        }}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SoftButton variant="secondary" icon={ArrowLeft} onClick={() => navigate('/admin/vendors')}>
              Back
            </SoftButton>
            {vendor.status === 'pending' && (
              <>
                <SoftButton variant="primary" icon={Check} onClick={() => setShowApprovalDialog(true)}>
                  Approve & Sign
                </SoftButton>
                <SoftButton variant="danger" icon={X} onClick={() => handleStatusUpdate('rejected')}>
                  Reject
                </SoftButton>
              </>
            )}
            {vendor.status === 'approved' && (
              <SoftButton variant="secondary" icon={Pause} onClick={() => handleStatusUpdate('suspended')}>
                Suspend Partner
              </SoftButton>
            )}
            {(vendor.status === 'suspended' || vendor.status === 'rejected') && (
              <SoftButton variant="primary" icon={Play} onClick={() => handleStatusUpdate('approved')}>
                Reactivate Partner
              </SoftButton>
            )}
          </div>
        }
      />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Details (Left Col) */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5 text-primary" />
                                Store Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Store Owner / Applicant</h4>
                                <p className="font-medium text-lg">{vendor.ownerName || vendor.user?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Store Description</h4>
                                <p className="text-gray-700">{vendor.storeDescription || 'No description provided'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-primary" />
                                Business Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Business Type</h4>
                                    <p className="capitalize">{vendor.businessInfo?.businessType || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Tax / GST ID</h4>
                                    <p>{vendor.businessInfo?.taxId || 'Not provided'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Registration No.</h4>
                                    <p>{vendor.businessInfo?.registrationNumber || 'Not provided'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Landmark className="h-5 w-5 text-primary" />
                                Banking Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Account Holder</h4>
                                    <p>{vendor.bankDetails?.accountHolderName || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Account Number</h4>
                                    <p>{vendor.bankDetails?.accountNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Bank Name</h4>
                                    <p>{vendor.bankDetails?.bankName || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">UPI ID</h4>
                                    <p>{vendor.bankDetails?.upiId || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info (Right Col) */}
                <div className="space-y-6">
                    <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary" />
                                Contact Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{vendor.contactInfo?.email || vendor.user?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{vendor.contactInfo?.phone || vendor.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span className="text-sm">
                                    {vendor.storeAddress?.street && (
                                        <>
                                            {vendor.storeAddress.street}<br />
                                            {vendor.storeAddress.city}, {vendor.storeAddress.state} {vendor.storeAddress.zipCode}<br />
                                            {vendor.storeAddress.country || 'India'}
                                        </>
                                    )}
                                    {!vendor.storeAddress?.street && 'No address provided'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-900 shadow-[6px_6px_14px_rgba(163,177,198,0.25),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(30,41,59,0.3)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Legal Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {vendor.consentPdf ? (
                                <Button variant="outline" className="w-full justify-between" asChild>
                                    <a href={getPdfUrl(vendor.consentPdf)} target="_blank" rel="noopener noreferrer">
                                        <span>View Consent Form</span>
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            ) : (
                                <p className="text-sm text-muted-foreground">Consent form PDF not generated yet.</p>
                            )}

                            {vendor.approvalPdf ? (
                                <Button variant="outline" className="w-full justify-between border-green-200 text-green-700 bg-green-50" asChild>
                                    <a href={getPdfUrl(vendor.approvalPdf)} target="_blank" rel="noopener noreferrer">
                                        <span>View Final Agreement</span>
                                        <Check className="h-4 w-4" />
                                    </a>
                                </Button>
                            ) : (
                                vendor.status === 'approved' && (
                                    <p className="text-sm text-muted-foreground">Final agreement PDF is missing.</p>
                                )
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Approval Dialog */}
            <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Approve Vendor Application</DialogTitle>
                        <DialogDescription>
                            By approving, you are entering into a formal agreement with Spring Blossoms Florist and this vendor. Please provide your digital signature to finalize the contract.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <h4 className="text-sm font-medium mb-2">Admin Signature</h4>
                        <div className="border border-gray-300 rounded-md bg-white">
                            <ReactSignatureCanvas
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{ className: 'w-full h-40 rounded-md' }}
                            />
                        </div>
                        <div className="flex justify-end mt-2">
                            <Button type="button" variant="ghost" size="sm" onClick={clearSignature}>
                                Clear Signature
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
                        <Button onClick={handleApprove} disabled={approvalLoading} className="bg-green-600 hover:bg-green-700 text-white">
                            {approvalLoading ? 'Approving...' : 'Sign & Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VendorDetailsPage;
