# Vendor Admin Mobile App Spec

## Purpose
This document maps the current vendor backend implementation to the admin mobile app requirements.

It covers:
- vendor lifecycle
- authentication and authorization
- vendor APIs
- request and response payloads
- form field mapping
- admin list/detail screen fields
- approval flow and PDF handling
- implementation notes and backend quirks

## Base API
- Base URL: `http://localhost:5000/api` in local development
- Frontend service default: `VITE_API_URL || http://localhost:5000/api`
- Vendor route prefix: `/vendors`

## Authentication
- Protected routes require `Authorization: Bearer <token>`
- Admin routes require authenticated user with `role = admin`
- Vendor self-service routes require authenticated user, then backend resolves the vendor with `Vendor.findOne({ user: req.user._id })`

## Vendor Lifecycle
1. User logs in with a normal user account.
2. User submits vendor consent/application using `POST /api/vendors/apply`.
3. Backend creates a `Vendor` record with `status = pending`.
4. Backend stores vendor signature as base64 and later generates a consent PDF.
5. User completes registration using `POST /api/vendors/register`.
6. Admin reviews pending vendor from `GET /api/vendors/admin/all` or `GET /api/vendors/admin/:id`.
7. Admin can:
   - approve with signature using `PUT /api/vendors/admin/:id/approve`
   - reject/suspend/reactivate using `PUT /api/vendors/admin/:id/status`
   - delete vendor using `DELETE /api/vendors/admin/:id`
8. On approval:
   - vendor `status` becomes `approved`
   - `verification.isVerified` becomes `true`
   - `approvedAt` is set
   - `adminSignature` is saved
   - approval PDF is generated
   - linked `User.role` becomes `vendor`
   - linked `User.vendorStatus` becomes `approved`

## Core Vendor Data Model

### Top-level fields
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `_id` | string | yes | MongoDB id |
| `user` | ObjectId/User | no | Linked logged-in user |
| `ownerName` | string | yes | Applicant full name |
| `storeName` | string | yes | Unique |
| `storeDescription` | string | yes | Store/business description |
| `storeLogo` | string | no | URL/base64 path |
| `storeBanner` | string | no | URL/base64 path |
| `status` | enum | yes | `pending`, `approved`, `suspended`, `rejected` |
| `signatureImage` | string | no | Vendor signature base64 |
| `adminSignature` | string | no | Admin signature base64 |
| `consentPdf` | string | no | Public API path |
| `approvalPdf` | string | no | Public API path |
| `approvedAt` | date | no | Set on approval |
| `createdAt` | date | yes | Auto |
| `updatedAt` | date | yes | Auto |

### `storeAddress`
| Field | Type | Required |
| --- | --- | --- |
| `street` | string | yes |
| `city` | string | yes |
| `state` | string | yes |
| `zipCode` | string | yes |
| `country` | string | yes |

### `contactInfo`
| Field | Type | Required |
| --- | --- | --- |
| `phone` | string | yes |
| `email` | string | yes |
| `website` | string | no |

### `businessInfo`
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `registrationNumber` | string | no | Optional |
| `taxId` | string | no | GST / tax id |
| `businessType` | enum | no | `individual`, `partnership`, `llc`, `corporation` |

### `bankDetails`
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `accountNumber` | string | no | Optional if UPI used |
| `routingNumber` | string | no | Used like IFSC in UI |
| `accountHolderName` | string | no | Registration UI makes this required |
| `bankName` | string | no | Optional |
| `upiId` | string | no | Alternative payout method |

### `commission`
| Field | Type | Default |
| --- | --- | --- |
| `rate` | number | `10` |
| `type` | enum | `percentage` |

### `verification`
| Field | Type | Default |
| --- | --- | --- |
| `isVerified` | boolean | `false` |
| `documentsSubmitted` | boolean | `false` |
| `verificationDate` | date | null |
| `verifiedBy` | ObjectId | null |

### `subscription`
| Field | Type | Default |
| --- | --- | --- |
| `plan` | enum | `basic` |
| `startDate` | date | now |
| `endDate` | date | null |
| `isActive` | boolean | `true` |

### `storeSettings`
| Field | Type | Default |
| --- | --- | --- |
| `isStoreOpen` | boolean | `true` |
| `processingTime` | number | `1` |
| `shippingPolicy` | string | null |
| `returnPolicy` | string | null |
| `termsAndConditions` | string | null |
| `acceptsReturns` | boolean | `true` |
| `returnWindow` | number | `30` |

### `salesSettings`
| Field | Type | Default |
| --- | --- | --- |
| `autoApproveOrders` | boolean | `true` |
| `allowBackorders` | boolean | `false` |
| `lowStockThreshold` | number | `5` |
| `notifyLowStock` | boolean | `true` |

### `analytics`
| Field | Type | Default |
| --- | --- | --- |
| `totalProducts` | number | `0` |
| `totalOrders` | number | `0` |
| `totalRevenue` | number | `0` |
| `totalCommissionPaid` | number | `0` |
| `averageRating` | number | `0` |
| `totalReviews` | number | `0` |

### `socialMedia`
| Field | Type |
| --- | --- |
| `facebook` | string |
| `instagram` | string |
| `twitter` | string |
| `youtube` | string |

## Vendor APIs

## 1. Apply / Consent
### `POST /api/vendors/apply`
- Auth: required
- Purpose: first-step vendor application and consent

### Request body
```json
{
  "vendorDetails": {
    "fullName": "John Doe",
    "businessName": "Doe Flowers",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "address": "123 Flower Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "website": "https://doeflowers.com",
    "instagram": "@doeflowers",
    "businessDescription": "Premium floral arrangements"
  },
  "consentAccepted": true,
  "signatureImage": "data:image/png;base64,..."
}
```

### Required validation
- `consentAccepted = true`
- `signatureImage` present
- required vendor details:
  - `fullName`
  - `businessName`
  - `email`
  - `phone`
  - `address`
  - `city`
  - `state`
  - `zipCode`
- `businessName` must be unique against `Vendor.storeName`

### Success response
```json
{
  "success": true,
  "message": "Vendor application submitted successfully!",
  "vendorId": "..."
}
```

### Backend field mapping
| Request field | Vendor model field |
| --- | --- |
| `vendorDetails.fullName` | `ownerName` |
| `vendorDetails.businessName` | `storeName` |
| `vendorDetails.businessDescription` | `storeDescription` |
| `vendorDetails.address` | `storeAddress.street` |
| `vendorDetails.city` | `storeAddress.city` |
| `vendorDetails.state` | `storeAddress.state` |
| `vendorDetails.zipCode` | `storeAddress.zipCode` |
| fixed value | `storeAddress.country = India` |
| `vendorDetails.phone` | `contactInfo.phone` |
| `vendorDetails.email` | `contactInfo.email` |
| `vendorDetails.website` | `contactInfo.website` |
| `vendorDetails.instagram` | `socialMedia.instagram` |
| `signatureImage` | `signatureImage` |

### Notes
- Consent PDF generation happens after response in the background.
- Admin notification email is sent in the background.

## 2. Get Consent Prefill Data
### `GET /api/vendors/consent-data`
- Auth: required
- Purpose: prefill vendor registration from the consent step

### Success response
```json
{
  "success": true,
  "vendorData": {
    "storeName": "Doe Flowers",
    "storeDescription": "Premium floral arrangements",
    "storeAddress": {
      "street": "123 Flower Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India"
    },
    "contactInfo": {
      "phone": "+91 9876543210",
      "email": "john@example.com",
      "website": "https://doeflowers.com"
    }
  }
}
```

## 3. Complete Vendor Registration
### `POST /api/vendors/register`
- Auth: required
- Purpose: second-step registration after consent

### Request body
```json
{
  "storeName": "Doe Flowers",
  "storeDescription": "Premium floral arrangements",
  "storeAddress": {
    "street": "123 Flower Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "contactInfo": {
    "phone": "+91 9876543210",
    "email": "john@example.com",
    "website": "https://doeflowers.com"
  },
  "businessInfo": {
    "registrationNumber": "ABC123",
    "taxId": "GST123",
    "businessType": "individual"
  },
  "bankDetails": {
    "accountNumber": "1234567890",
    "routingNumber": "IFSC0001",
    "accountHolderName": "John Doe",
    "bankName": "HDFC",
    "upiId": "john@upi"
  }
}
```

### Success response
```json
{
  "success": true,
  "message": "Vendor registration completed successfully.",
  "vendor": { }
}
```

### Notes
- Backend requires an existing vendor record from `/apply`.
- Registration updates the same vendor row instead of creating a new one.

## 4. Vendor Profile
### `GET /api/vendors/profile`
- Auth: required
- Purpose: fetch current vendor profile

### Response
```json
{
  "vendor": { }
}
```

### `PUT /api/vendors/profile`
- Auth: required
- Purpose: update vendor profile sections

### Allowed update sections
- `storeDescription`
- `storeLogo`
- `storeBanner`
- `storeAddress`
- `contactInfo`
- `businessInfo`
- `bankDetails`
- `storeSettings`
- `salesSettings`
- `socialMedia`

### Important note
- Backend merges each allowed section object.
- `storeName` is not in the allowed update list for this route.

## 5. Vendor Settings
### `GET /api/vendors/settings`
- Auth: required
- Purpose: small settings payload for vendor settings screen

### Response
```json
{
  "storeName": "Doe Flowers",
  "storeDescription": "Premium floral arrangements",
  "contactInfo": {
    "email": "john@example.com",
    "phone": "+91 9876543210"
  },
  "payoutInfo": {
    "bankAccountHolder": "John Doe",
    "bankAccountNumber": "1234567890",
    "bankIfsc": "IFSC0001"
  }
}
```

### `PUT /api/vendors/settings`
- Auth: required
- Purpose: update simplified settings payload

### Request body
```json
{
  "storeName": "Doe Flowers",
  "storeDescription": "Premium floral arrangements",
  "contactInfo": {
    "email": "john@example.com",
    "phone": "+91 9876543210"
  },
  "payoutInfo": {
    "bankAccountHolder": "John Doe",
    "bankAccountNumber": "1234567890",
    "bankIfsc": "IFSC0001"
  }
}
```

### Mapping
| Settings field | Vendor model field |
| --- | --- |
| `payoutInfo.bankAccountHolder` | `bankDetails.accountHolderName` |
| `payoutInfo.bankAccountNumber` | `bankDetails.accountNumber` |
| `payoutInfo.bankIfsc` | `bankDetails.routingNumber` |

## 6. Vendor Dashboard
### `GET /api/vendors/dashboard`
- Auth: required
- Purpose: vendor dashboard metrics

### Response shape
- `vendor`
- `stats`
- `recentOrders`
- `lowStockProducts`
- `charts`

### `stats` fields in service typing
- `totalProducts`
- `activeProducts`
- `totalOrders`
- `monthlyOrders`
- `totalRevenue`
- `monthlyRevenue`
- `vendorEarnings`
- `monthlyEarnings`
- `pendingOrders`
- `lowStockCount`

## 7. Vendor Products
### `GET /api/vendors/products`
- Auth: required
- Query params:
  - `page`
  - `limit`
  - `search`
  - `category`
  - `status`

### Supported `status`
- `active`
- `inactive`
- `low-stock`

### Product list response
```json
{
  "products": [
    {
      "_id": "...",
      "title": "Red Rose Bouquet",
      "images": ["..."],
      "price": 799,
      "countInStock": 12,
      "category": "Flowers",
      "hidden": false,
      "isFeatured": false,
      "isNew": true,
      "approvalStatus": "approved",
      "rejectionReason": "",
      "createdAt": "..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalProducts": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

## 8. Vendor Orders
### `GET /api/vendors/orders`
- Auth: required
- Query params:
  - `page`
  - `limit`
  - `status`
  - `startDate`
  - `endDate`

### Response
- `orders`
- `pagination`

### Order response notes
- Backend filters order items so vendor only receives its own items.
- Each returned order includes `vendorTotal`.

## 9. Vendor Analytics
### `GET /api/vendors/analytics?period=30d`
- Auth: required
- Supported `period` values:
  - `7d`
  - `30d`
  - `90d`
  - `1y`

### Response sections
- `salesOverTime`
- `topProducts`
- `orderStatus`
- `categoryPerformance`
- `customerInsights`
- `keyStats`

## 10. Vendor Payouts
### `GET /api/vendors/payouts`
- Auth: required
- Query params:
  - `page`
  - `limit`

### Response
- `payouts`
- `pagination`
- `summary`
- `pendingEarnings`

### `summary`
| Field | Meaning |
| --- | --- |
| `totalEarned` | paid + pending |
| `totalPaid` | completed/paid/approved payouts |
| `pendingPayout` | pending payout total |
| `nextPayoutDate` | first day of next month |

## 11. Vendor Notifications
### `GET /api/vendors/notifications`
- Auth: required
- Query params:
  - `since`

### Response
```json
{
  "success": true,
  "notifications": [ ]
}
```

## 12. Admin Vendor List
### `GET /api/vendors/admin/all`
- Auth: admin
- Query params:
  - `page` default `1`
  - `limit` default `10`
  - `status`
  - `search`

### Search behavior
- searches `storeName`
- searches `contactInfo.email`

### Response
```json
{
  "vendors": [
    {
      "_id": "...",
      "user": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "ownerName": "John Doe",
      "storeName": "Doe Flowers",
      "storeDescription": "Premium floral arrangements",
      "status": "pending",
      "verification": {
        "isVerified": false
      },
      "subscription": {
        "plan": "basic",
        "isActive": true
      },
      "consentPdf": "/api/vendors/pdf/.../consent",
      "approvalPdf": "/api/vendors/pdf/.../approval",
      "stats": {
        "totalProducts": 0,
        "totalOrders": 0
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalVendors": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

## 13. Admin Vendor Details
### `GET /api/vendors/admin/:id`
- Auth: admin

### Response
```json
{
  "success": true,
  "vendor": { }
}
```

### Fields currently used by admin web UI
- store block
  - `storeName`
  - `ownerName`
  - `storeDescription`
  - `status`
  - `createdAt`
- contact block
  - `contactInfo.email`
  - `contactInfo.phone`
  - `storeAddress.street`
  - `storeAddress.city`
  - `storeAddress.state`
  - `storeAddress.zipCode`
  - `storeAddress.country`
- business block
  - `businessInfo.businessType`
  - `businessInfo.taxId`
  - `businessInfo.registrationNumber`
- bank block
  - `bankDetails.accountHolderName`
  - `bankDetails.accountNumber`
  - `bankDetails.bankName`
  - `bankDetails.upiId`
- legal block
  - `consentPdf`
  - `approvalPdf`
- verification block
  - `verification.isVerified`
  - `verification.verificationDate`
  - `approvedAt`
  - `adminSignature`
  - `signatureImage`

## 14. Admin Update Vendor Status
### `PUT /api/vendors/admin/:id/status`
- Auth: admin

### Request body
```json
{
  "status": "rejected"
}
```

### Allowed practical values
- `pending`
- `approved`
- `suspended`
- `rejected`

### Response
```json
{
  "success": true,
  "message": "Vendor status updated to approved ",
  "vendor": { }
}
```

### Important behavior
- If status is set to `approved`, backend also sets:
  - `verification.isVerified = true`
  - `verification.verificationDate = now`
  - `verification.verifiedBy = req.user._id`
- This route does not update `User.role` to `vendor`.
- This route does not require admin signature.
- For real approval, mobile admin should use `/approve`, not `/status` with `approved`.

## 15. Admin Approve Vendor with Signature
### `PUT /api/vendors/admin/:id/approve`
- Auth: admin
- Purpose: official approval flow

### Request body
```json
{
  "adminSignature": "data:image/png;base64,..."
}
```

### Validation
- `adminSignature` is required

### Response
```json
{
  "success": true,
  "message": "Vendor approved and agreement finalized.",
  "vendor": { }
}
```

### Side effects
- vendor status becomes `approved`
- verification fields are updated
- `adminSignature` saved
- `approvedAt` saved
- linked user role changes to `vendor`
- linked user `vendorStatus` becomes `approved`
- approval PDF generated
- approval email sent to vendor

## 16. Admin Delete Vendor
### `DELETE /api/vendors/admin/:id`
- Auth: admin

### Response
```json
{
  "success": true,
  "message": "Vendor deleted and user role reverted successfully"
}
```

### Side effects
- deletes all products with `vendor = :id`
- if linked user exists:
  - `role` becomes `user`
  - `vendorStatus` becomes `pending`
- deletes vendor row

## 17. Public Vendor PDFs
### `GET /api/vendors/pdf/:id/consent`
### `GET /api/vendors/pdf/:id/approval`
- Auth: not required
- Response content-type: `application/pdf`
- Content disposition: inline

## Form Field Spec For Admin Mobile App

## A. Vendor List Screen
### Display fields
| UI field | API source |
| --- | --- |
| Vendor/store name | `storeName` |
| Owner/applicant name | `user.name` fallback `ownerName` |
| Email | `user.email` fallback `contactInfo.email` |
| Status chip | `status` |
| Verified chip | `verification.isVerified` |
| Plan chip | `subscription.plan` |
| Product count | `stats.totalProducts` |
| Order count | `stats.totalOrders` |
| Created date | `createdAt` |
| Consent PDF action | `consentPdf` |

### Filters
- search text
- status
- verified / unverified
- plan

## B. Vendor Detail Screen
### Sections
1. Store Information
2. Contact Information
3. Business Details
4. Banking Details
5. Legal Documents
6. Verification / Approval Metadata
7. Actions

### Read-only fields
| Section | Field | Source |
| --- | --- | --- |
| Store | Store Name | `storeName` |
| Store | Owner Name | `ownerName` or `user.name` |
| Store | Description | `storeDescription` |
| Store | Status | `status` |
| Store | Created On | `createdAt` |
| Contact | Email | `contactInfo.email` |
| Contact | Phone | `contactInfo.phone` |
| Contact | Website | `contactInfo.website` |
| Contact | Address | `storeAddress.*` |
| Business | Business Type | `businessInfo.businessType` |
| Business | Registration Number | `businessInfo.registrationNumber` |
| Business | Tax/GST ID | `businessInfo.taxId` |
| Bank | Account Holder | `bankDetails.accountHolderName` |
| Bank | Account Number | `bankDetails.accountNumber` |
| Bank | IFSC | `bankDetails.routingNumber` |
| Bank | Bank Name | `bankDetails.bankName` |
| Bank | UPI ID | `bankDetails.upiId` |
| Docs | Consent PDF | `consentPdf` |
| Docs | Approval PDF | `approvalPdf` |
| Verification | Verified | `verification.isVerified` |
| Verification | Verified On | `verification.verificationDate` |
| Verification | Approved On | `approvedAt` |
| Verification | Vendor Signature | `signatureImage` |
| Verification | Admin Signature | `adminSignature` |

## C. Admin Approval Form
### Required fields
| UI field | Type | Required | API field |
| --- | --- | --- | --- |
| Admin signature pad | base64 png | yes | `adminSignature` |

### Submit action
- endpoint: `PUT /api/vendors/admin/:id/approve`

## D. Admin Status Action Form
### Required fields
| UI field | Type | Required | API field |
| --- | --- | --- | --- |
| Status | enum | yes | `status` |

### Allowed actions
- reject pending vendor
- suspend approved vendor
- reactivate suspended vendor

### Submit action
- endpoint: `PUT /api/vendors/admin/:id/status`

## E. Vendor Application Form Reference
This is useful if admin mobile app needs to preview original application fields.

### Consent/application step fields
| UI field | Required | API field |
| --- | --- | --- |
| Full Name | yes | `vendorDetails.fullName` |
| Business Name | yes | `vendorDetails.businessName` |
| Email | yes | `vendorDetails.email` |
| Phone | yes | `vendorDetails.phone` |
| Street Address | yes | `vendorDetails.address` |
| City | yes | `vendorDetails.city` |
| State | yes | `vendorDetails.state` |
| ZIP Code | yes | `vendorDetails.zipCode` |
| Website | no | `vendorDetails.website` |
| Instagram | no | `vendorDetails.instagram` |
| Business Description | no in consent step, but strongly expected overall | `vendorDetails.businessDescription` |
| Consent checkbox | yes | `consentAccepted` |
| Vendor signature | yes | `signatureImage` |

### Registration step fields
| UI field | Required by UI | API field |
| --- | --- | --- |
| Store Name | yes | `storeName` |
| Store Description | yes | `storeDescription` |
| Street | yes | `storeAddress.street` |
| City | yes | `storeAddress.city` |
| State | yes | `storeAddress.state` |
| ZIP Code | yes | `storeAddress.zipCode` |
| Country | defaulted | `storeAddress.country` |
| Phone | yes | `contactInfo.phone` |
| Email | yes | `contactInfo.email` |
| Website | no | `contactInfo.website` |
| Business Type | yes | `businessInfo.businessType` |
| Registration Number | no | `businessInfo.registrationNumber` |
| Tax ID / GST | no | `businessInfo.taxId` |
| Account Holder Name | yes | `bankDetails.accountHolderName` |
| Account Number | conditional | `bankDetails.accountNumber` |
| IFSC | conditional | `bankDetails.routingNumber` |
| Bank Name | no | `bankDetails.bankName` |
| UPI ID | conditional | `bankDetails.upiId` |

## Recommended Mobile Admin Flows

## Pending vendor review
1. Call `GET /api/vendors/admin/all?status=pending`
2. Open details using `GET /api/vendors/admin/:id`
3. Load consent PDF if present
4. If approving, capture admin signature and call `/approve`
5. If rejecting, call `/status`

## Approved vendor maintenance
1. Call `GET /api/vendors/admin/all?status=approved`
2. Open details
3. Suspend using `/status`

## Suspended vendor reactivation
1. Call `GET /api/vendors/admin/all?status=suspended`
2. Open details
3. Reactivate using `/status` with `approved`

## Backend Quirks To Account For
- Use `/approve` for approval, not `/status` with `approved`, because only `/approve` updates the linked user role and creates the approval PDF.
- `GET /api/vendors/admin/all` computes only `stats.totalProducts` and `stats.totalOrders`. Revenue is not added there.
- In admin UI types, some fields are flattened as `phone` or `address`, but backend actually returns nested `contactInfo` and `storeAddress`.
- `routingNumber` is being used as IFSC in the registration and settings UI.
- Consent/apply route is marked as protected in routing even though one comment says public.
- PDF routes are public. If the mobile app exposes them, the links should be treated as shareable URLs.
- Base64 signatures can be large. Keep request payload limits in mind for mobile.

## Minimal Data Contract For Admin Mobile App
If the first mobile release only needs vendor review and approval, these fields are enough:
- `_id`
- `storeName`
- `ownerName`
- `status`
- `createdAt`
- `contactInfo.email`
- `contactInfo.phone`
- `storeAddress`
- `businessInfo`
- `bankDetails`
- `verification`
- `consentPdf`
- `approvalPdf`
- `signatureImage`

## Source Files Used
- `server/models/Vendor.js`
- `server/controllers/vendorController.js`
- `server/routes/vendorRoutes.js`
- `server/middleware/authMiddleware.js`
- `server/models/User.js`
- `sbf-main/src/services/vendorService.ts`
- `sbf-main/src/pages/VendorConsentPage.tsx`
- `sbf-main/src/pages/Vendor/VendorRegistration.tsx`
- `sbf-main/src/pages/Admin/VendorManagement.tsx`
- `sbf-main/src/pages/Admin/VendorDetailsPage.tsx`
