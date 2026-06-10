# EstateAdmin — Admin API Documentation

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:7000` (check your `.env` `PORT`)  
> **API Prefix:** `/api/v1`  
> **Full Base:** `http://localhost:7000/api/v1`

---

## Table of Contents

1. [Authentication Setup](#1-authentication-setup)
2. [Response Format](#2-response-format)
3. [Public APIs (No Auth)](#3-public-apis-no-auth)
4. [Admin Auth APIs](#4-admin-auth-apis)
5. [Admin Dashboard API](#5-admin-dashboard-api)
6. [Admin Property CRUD APIs](#6-admin-property-crud-apis)
7. [Admin Property Media APIs](#7-admin-property-media-apis)
8. [Admin Property Document APIs](#8-admin-property-document-apis)
9. [Complete Dummy Payloads](#9-complete-dummy-payloads)
10. [Recommended Workflow](#10-recommended-workflow)
11. [Enum Reference](#11-enum-reference)

---

## 1. Authentication Setup

### Login flow
1. `POST /api/v1/admin/auth/login` → get `accessToken` in response body
2. `refreshToken` is set automatically as **httpOnly cookie** (not in JSON response)
3. Use `accessToken` for all protected APIs:

```
Authorization: Bearer <accessToken>
```

### Token expiry
| Token | Location | Expiry |
|-------|----------|--------|
| Access Token | Response JSON → Redux | 30 minutes |
| Refresh Token | httpOnly Cookie | 10 days |

### Refresh access token
```
POST /api/v1/admin/auth/refresh-token
```
No body required. Cookie is sent automatically (Postman: enable cookies).

---

## 2. Response Format

### Success
```json
{
  "success": true,
  "message": "Success message",
  "data": { },
  "meta": { }
}
```

### Error
```json
{
  "success": false,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "Email is required" }
  ],
  "requestId": "uuid"
}
```

---

## 3. Public APIs (No Auth)

### 3.1 Health Check (root)
| | |
|---|---|
| **GET** | `/health` |
| **GET** | `/health/live` |
| **GET** | `/health/ready` |
| **GET** | `/api/v1/health` |

**Response example:**
```json
{
  "success": true,
  "code": "SERVICE_HEALTH_OK",
  "status": "healthy",
  "timestamp": "2026-06-10T10:00:00.000Z",
  "uptime": 120.5,
  "requestId": "abc-123",
  "services": {
    "mongodb": "connected",
    "memory": { "rss": "95MB", "heapUsed": "30MB" }
  }
}
```

---

### 3.2 Get All Constants (dropdown values)
| | |
|---|---|
| **GET** | `/api/v1/constants` |
| **Auth** | No |

Returns all enums: listing types, property types, amenities, states, document types, etc.

---

### 3.3 Root Info
| | |
|---|---|
| **GET** | `/` |

```json
{
  "success": true,
  "message": "EstateAdmin API Server",
  "version": "1.0.0",
  "health": "/health",
  "api": "/api/v1"
}
```

---

## 4. Admin Auth APIs

Base: `/api/v1/admin/auth`

---

### 4.1 Login
| | |
|---|---|
| **POST** | `/api/v1/admin/auth/login` |
| **Auth** | No |
| **Content-Type** | `application/json` |

**Request body:**
```json
{
  "email": "admin@estateadmin.com",
  "password": "ChangeMe@123"
}
```

**Success response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "6a29014386b516db1cb83704",
      "name": "Super Admin",
      "email": "admin@estateadmin.com",
      "role": "super_admin",
      "avatar": null,
      "lastLoginAt": "2026-06-10T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "30m",
    "tokenType": "Bearer"
  }
}
```

> **Note:** `refreshToken` is in Set-Cookie header as `estate_refresh_token` (httpOnly).

---

### 4.2 Refresh Access Token
| | |
|---|---|
| **POST** | `/api/v1/admin/auth/refresh-token` |
| **Auth** | Cookie only (refresh token) |
| **Body** | Empty |

**Success response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "30m",
    "tokenType": "Bearer"
  }
}
```

---

### 4.3 Get Current Admin Profile
| | |
|---|---|
| **GET** | `/api/v1/admin/auth/me` |
| **Auth** | Bearer Token ✅ |

**Success response (200):**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "_id": "6a29014386b516db1cb83704",
    "name": "Super Admin",
    "email": "admin@estateadmin.com",
    "role": "super_admin",
    "avatar": null,
    "isActive": true,
    "lastLoginAt": "2026-06-10T10:00:00.000Z",
    "createdAt": "2026-06-01T08:00:00.000Z",
    "updatedAt": "2026-06-10T10:00:00.000Z"
  }
}
```

---

### 4.4 Logout
| | |
|---|---|
| **POST** | `/api/v1/admin/auth/logout` |
| **Auth** | Bearer Token ✅ |

**Success response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 5. Admin Dashboard API

### 5.1 Dashboard Stats
| | |
|---|---|
| **GET** | `/api/v1/admin/dashboard/stats` |
| **Auth** | Bearer Token ✅ |

**Success response (200):**
```json
{
  "success": true,
  "message": "Dashboard stats fetched successfully",
  "data": {
    "totalProperties": 156,
    "statusBreakdown": {
      "active": 120,
      "pending": 18,
      "draft": 12,
      "inactive": 6
    },
    "listingTypeBreakdown": [
      { "listingType": "For Sale", "count": 80 },
      { "listingType": "For Rent", "count": 45 },
      { "listingType": "BUY", "count": 20 },
      { "listingType": "PG", "count": 11 }
    ]
  }
}
```

---

## 6. Admin Property CRUD APIs

Base: `/api/v1/admin/properties`  
**All routes require:** `Authorization: Bearer <accessToken>`

---

### 6.1 List Properties
| | |
|---|---|
| **GET** | `/api/v1/admin/properties` |
| **Auth** | Bearer Token ✅ |

**Query parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `search` | string | — | Search title, listingId, city, address |
| `listingType` | string | — | For Sale, For Rent, BUY, PG |
| `propertyType` | string | — | Flat, Villa, etc. |
| `status` | string | — | draft, active, pending, inactive |
| `city` | string | — | Filter by city |
| `sortBy` | string | createdAt | createdAt, price, title, updatedAt |
| `sortOrder` | string | desc | asc, desc |

**Example:**
```
GET /api/v1/admin/properties?page=1&limit=10&search=skyline&listingType=For Sale&status=active&sortBy=price&sortOrder=asc
```

**Success response (200):**
```json
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [
    {
      "_id": "6789abcdef1234567890abcd",
      "listingId": "EA-88231-A3F2C1",
      "listingType": "For Sale",
      "propertyType": "Flat",
      "title": "Skyline 2BHK Flat",
      "price": 7500000,
      "status": "active",
      "location": { "city": "Mumbai", "state": "Maharashtra" },
      "media": [
        {
          "_id": "media001",
          "type": "exterior",
          "url": "http://localhost:7000/uploads/properties/6789.../media/photo.webp",
          "fileName": "exterior-abc.webp",
          "originalFileName": "IMG_1234.heic",
          "fileSize": 245000,
          "mimeType": "image/webp",
          "storageKey": "properties/6789.../media/exterior-abc.webp",
          "storageProvider": "local",
          "isMain": true
        }
      ],
      "mainImage": "http://localhost:7000/uploads/.../photo.webp",
      "createdBy": { "name": "Super Admin", "email": "admin@estateadmin.com" },
      "createdAt": "2026-06-01T08:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 6.2 Create Property
| | |
|---|---|
| **POST** | `/api/v1/admin/properties` |
| **Auth** | Bearer Token ✅ |
| **Content-Type** | `application/json` |

> Use **For Sale** dummy → [Section 9.1](#91-create-property--for-sale-all-fields)  
> Use **For Rent** dummy → [Section 9.2](#92-create-property--for-rent--pg-all-fields)

**Success response (201):**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "_id": "6789abcdef1234567890abcd",
    "listingId": "EA-88231-A3F2C1",
    "...all property fields...",
    "media": [],
    "documents": [],
    "createdBy": { "name": "Super Admin", "email": "admin@estateadmin.com" }
  }
}
```

---

### 6.3 Get Single Property
| | |
|---|---|
| **GET** | `/api/v1/admin/properties/:id` |
| **Auth** | Bearer Token ✅ |

**Example:**
```
GET /api/v1/admin/properties/6789abcdef1234567890abcd
```

Returns full property with all fields, media[], documents[], createdBy, lastUpdatedBy.

---

### 6.4 Update Property
| | |
|---|---|
| **PUT** | `/api/v1/admin/properties/:id` |
| **Auth** | Bearer Token ✅ |
| **Content-Type** | `application/json` |

Send only fields to update (minimum 1 field). Same field structure as create.

**Example — partial update:**
```json
{
  "title": "Updated Skyline 2BHK Flat - Premium",
  "price": 7800000,
  "maintenance": 15000,
  "bedrooms": 2,
  "bathrooms": 2,
  "amenities": ["Lift", "Gym", "Swimming Pool", "Visitor Parking"],
  "location": {
    "fullAddress": "Plot 45, Andheri East, Mumbai",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400069",
    "latitude": 19.1136,
    "longitude": 72.8697
  }
}
```

---

### 6.5 Update Property Status
| | |
|---|---|
| **PATCH** | `/api/v1/admin/properties/:id/status` |
| **Auth** | Bearer Token ✅ |

**Request body:**
```json
{
  "status": "active"
}
```

Valid values: `draft` | `active` | `pending` | `inactive`

---

### 6.6 Delete Property (Soft Delete + Cloud Cleanup)
| | |
|---|---|
| **DELETE** | `/api/v1/admin/properties/:id` |
| **Auth** | Bearer Token ✅ |

Deletes all media & documents from cloud/local storage, then soft-deletes property.

**Success response (200):**
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

## 7. Admin Property Media APIs

Base: `/api/v1/admin/properties/:id/media`

**Rules:**
- Max **10 images** per property
- Any image format accepted (JPEG, PNG, HEIC, etc.)
- Auto converted to **WebP** before cloud upload
- Max file size: **60MB**
- Storage: local | cloudinary | r2 (via `.env`)

---

### 7.1 Upload Media (Add New Image)
| | |
|---|---|
| **POST** | `/api/v1/admin/properties/:id/media` |
| **Auth** | Bearer Token ✅ |
| **Content-Type** | `multipart/form-data` |

**Form fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ | Any image format |
| `type` | Text | ✅ | Media type (see enum) |
| `isMain` | Text | No | `true` or `false` (default: false) |

**Valid `type` values:**
`exterior` | `livingRoom` | `bedroom` | `kitchen` | `bathroom` | `balcony` | `society` | `floorPlan` | `video` | `virtualTour`

**Postman example:**
```
POST /api/v1/admin/properties/6789abcdef1234567890abcd/media

Body → form-data:
  file    → [select image file]
  type    → exterior
  isMain  → true
```

---

### 7.2 Replace Media (Update Image File)
| | |
|---|---|
| **PUT** | `/api/v1/admin/properties/:id/media/:mediaId` |
| **Auth** | Bearer Token ✅ |
| **Content-Type** | `multipart/form-data` |

Replaces existing image. Old file deleted from cloud automatically.

**Form fields:** Same as 7.1 (`file`, `type`, `isMain`)

---

### 7.3 Update Media Metadata (No File Change)
| | |
|---|---|
| **PATCH** | `/api/v1/admin/properties/:id/media/:mediaId` |
| **Auth** | Bearer Token ✅ |
| **Content-Type** | `application/json` |

**Request body (at least 1 field):**
```json
{
  "type": "livingRoom",
  "isMain": true
}
```

Use to set main thumbnail without re-uploading image.

---

### 7.4 Delete Media
| | |
|---|---|
| **DELETE** | `/api/v1/admin/properties/:id/media/:mediaId` |
| **Auth** | Bearer Token ✅ |

Deletes from cloud/local + removes from DB.

**Example scenario — 4 old kept, 3 deleted, 3 new added:**
```
DELETE /api/v1/admin/properties/:id/media/:mediaId1
DELETE /api/v1/admin/properties/:id/media/:mediaId2
DELETE /api/v1/admin/properties/:id/media/:mediaId3
POST   /api/v1/admin/properties/:id/media  (×3 new uploads)
→ Result: 4 old + 3 new = 7 images
```

---

## 8. Admin Property Document APIs

Base: `/api/v1/admin/properties/:id/documents`

**Rules:**
- Max **30 documents** per property
- Any format accepted (PDF, JPG, PNG, etc.)
- No compression — original uploaded
- Max file size: **60MB**
- Same cloud storage as media

---

### 8.1 Upload Document
| | |
|---|---|
| **POST** | `/api/v1/admin/properties/:id/documents` |
| **Auth** | Bearer Token ✅ |
| **Content-Type** | `multipart/form-data` |

**Form fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ | PDF, image, any document |
| `category` | Text | ✅ | identity, ownership, approval, taxUtility, legal |
| `type` | Text | ✅ | Document type name (see enum) |

**Postman example — RERA Certificate:**
```
POST /api/v1/admin/properties/6789abcdef1234567890abcd/documents

Body → form-data:
  file      → rera_certificate.pdf
  category  → approval
  type      → RERA Certificate
```

**Postman example — Property Tax Receipt:**
```
  file      → tax_receipt.pdf
  category  → taxUtility
  type      → Property Tax Receipt
```

**Postman example — Sale Deed:**
```
  file      → sale_deed.pdf
  category  → legal
  type      → Sale Deed
```

---

### 8.2 Replace Document
| | |
|---|---|
| **PUT** | `/api/v1/admin/properties/:id/documents/:documentId` |
| **Auth** | Bearer Token ✅ |
| **Content-Type** | `multipart/form-data` |

Same form fields as 8.1. Old document deleted from cloud.

---

### 8.3 Update Document Metadata
| | |
|---|---|
| **PATCH** | `/api/v1/admin/properties/:id/documents/:documentId` |
| **Auth** | Bearer Token ✅ |
| **Content-Type** | `application/json` |

**Request body:**
```json
{
  "category": "approval",
  "type": "Occupancy Certificate"
}
```

---

### 8.4 Delete Document
| | |
|---|---|
| **DELETE** | `/api/v1/admin/properties/:id/documents/:documentId` |
| **Auth** | Bearer Token ✅ |

Deletes from cloud/local + removes from DB.

---

## 9. Complete Dummy Payloads

### 9.1 Create Property — For Sale (ALL fields)

```json
{
  "listingType": "For Sale",
  "propertyType": "Flat",
  "title": "Skyline 2BHK Flat in Andheri East",
  "description": "Spacious 2BHK flat in a premium society with city view. Marble flooring, modular kitchen, covered parking, gym and swimming pool in society. Close to metro and schools.",
  "ownershipType": "Freehold",
  "condition": "Brand New",
  "constructionStatus": "Ready to Move",
  "furnishing": "Semi-Furnished",
  "facing": "East",
  "flooringType": "Marble",
  "area": {
    "value": 1200,
    "unit": "sqft"
  },
  "price": 7500000,
  "maintenance": 12500,
  "bedrooms": 2,
  "bathrooms": 2,
  "floorNo": 8,
  "totalFloors": 20,
  "waterSupply": "Municipal Water",
  "powerBackup": "Full Backup",
  "parkingType": "Covered Parking",
  "securityFeatures": [
    "CCTV",
    "Security Guard",
    "Gated Community"
  ],
  "amenities": [
    "Lift",
    "Gym",
    "Swimming Pool",
    "Club House",
    "Park",
    "Kids Play Area",
    "Jogging Track",
    "Community Hall",
    "Visitor Parking",
    "EV Charging",
    "Temple",
    "Sports Court"
  ],
  "connectivity": [
    "Near Metro",
    "Near Railway Station",
    "Near Airport",
    "Near Highway",
    "Near Bus Stand"
  ],
  "nearbyFacilities": [
    "School Nearby",
    "Hospital Nearby",
    "Market Nearby",
    "Mall Nearby",
    "Bank Nearby",
    "Park Nearby"
  ],
  "location": {
    "fullAddress": "Plot 45, Skyline Heights, Andheri East, Mumbai",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400069",
    "latitude": 19.1136,
    "longitude": 72.8697
  },
  "saleDetails": {
    "possessionStatus": "Immediate Possession",
    "loanAvailability": "Available"
  },
  "status": "draft"
}
```

---

### 9.2 Create Property — For Rent / PG (ALL fields)

```json
{
  "listingType": "For Rent",
  "propertyType": "Flat",
  "title": "2BHK Fully Furnished Flat for Rent - Bandra West",
  "description": "Beautiful 2BHK fully furnished flat available for rent in prime Bandra West location. Sea-facing balcony, modular kitchen, wardrobes in all bedrooms.",
  "ownershipType": "Leasehold",
  "condition": "Excellent",
  "constructionStatus": "Ready to Move",
  "furnishing": "Fully Furnished",
  "facing": "North-West",
  "flooringType": "Wooden Flooring",
  "area": {
    "value": 950,
    "unit": "sqft"
  },
  "price": 45000,
  "maintenance": 8000,
  "bedrooms": 2,
  "bathrooms": 2,
  "floorNo": 12,
  "totalFloors": 22,
  "waterSupply": "Both",
  "powerBackup": "Full Backup",
  "parkingType": "Basement Parking",
  "securityFeatures": [
    "CCTV",
    "Security Guard",
    "Gated Community"
  ],
  "amenities": [
    "Lift",
    "Gym",
    "Swimming Pool",
    "Club House",
    "Park",
    "Kids Play Area",
    "Jogging Track",
    "Community Hall",
    "Visitor Parking",
    "EV Charging",
    "Temple",
    "Sports Court"
  ],
  "connectivity": [
    "Near Metro",
    "Near Railway Station",
    "Near Airport",
    "Near Highway",
    "Near Bus Stand"
  ],
  "nearbyFacilities": [
    "School Nearby",
    "Hospital Nearby",
    "Market Nearby",
    "Mall Nearby",
    "Bank Nearby",
    "Park Nearby"
  ],
  "location": {
    "fullAddress": "Flat 1202, Ocean View Tower, Bandra West, Mumbai",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400050",
    "latitude": 19.0596,
    "longitude": 72.8295
  },
  "rentalDetails": {
    "tenantTypeAllowed": [
      "Family",
      "Working Professionals",
      "Government Employees Only"
    ],
    "occupationPreference": "No Restriction",
    "employmentVerification": [
      "Government ID",
      "Company ID",
      "Salary Slip",
      "Employment Letter"
    ],
    "rentalAgreementDuration": "11 Months",
    "minimumStayDuration": "11 Months",
    "lockInPeriod": "No Lock-in",
    "availability": "Immediate",
    "availabilityDate": null,
    "foodPreference": "No Restriction",
    "pets": "Not Allowed",
    "smoking": "Not Allowed",
    "alcohol": "Restricted",
    "guestPolicy": "Allowed",
    "tenantVerification": [
      "Aadhaar",
      "PAN",
      "Police Verification",
      "Employment Proof",
      "References"
    ],
    "securityDeposit": "2 Months Rent",
    "securityDepositCustomAmount": null,
    "preferredMoveInDate": "Within 15 Days",
    "preferredMoveInDateSpecific": null,
    "governmentEmployeePreferred": false
  },
  "status": "draft"
}
```

---

### 9.3 Upload All Media Types (after property created)

Run these one by one after getting property `_id`:

| # | type | isMain | Description |
|---|------|--------|-------------|
| 1 | `exterior` | true | Building exterior photo |
| 2 | `livingRoom` | false | Living room |
| 3 | `bedroom` | false | Master bedroom |
| 4 | `kitchen` | false | Kitchen |
| 5 | `bathroom` | false | Bathroom |
| 6 | `balcony` | false | Balcony view |
| 7 | `society` | false | Society/common area |
| 8 | `floorPlan` | false | Floor plan image |

---

### 9.4 Upload All Document Types (after property created)

| category | type | File example |
|----------|------|--------------|
| `identity` | Aadhaar Card | aadhaar.pdf |
| `identity` | PAN Card | pan.pdf |
| `ownership` | Sale Deed | sale_deed.pdf |
| `ownership` | Registry | registry.pdf |
| `approval` | RERA Certificate | rera.pdf |
| `approval` | Occupancy Certificate | oc.pdf |
| `approval` | Completion Certificate | cc.pdf |
| `approval` | Approved Building Plan | plan.pdf |
| `taxUtility` | Property Tax Receipt | tax_receipt.pdf |
| `taxUtility` | Electricity Bill | electricity.pdf |
| `taxUtility` | Water Bill | water.pdf |
| `legal` | Encumbrance Certificate | ec.pdf |
| `legal` | NOC | noc.pdf |
| `legal` | Society Share Certificate | share_cert.pdf |
| `legal` | Sale Deed | sale_deed_legal.pdf |

---

## 10. Recommended Workflow

### New Property (Complete Flow)
```
Step 1:  POST /admin/auth/login                          → get accessToken
Step 2:  POST /admin/properties                          → create property (draft)
         → save property _id
Step 3:  POST /admin/properties/:id/media  (×N)          → upload images (max 10)
Step 4:  POST /admin/properties/:id/documents (×N)     → upload documents
Step 5:  PATCH /admin/properties/:id/status              → { "status": "active" } publish
```

### Edit Property Images
```
Keep existing:  no action needed
Delete image:   DELETE /admin/properties/:id/media/:mediaId
Add new image:  POST   /admin/properties/:id/media
Replace image:  PUT    /admin/properties/:id/media/:mediaId
Set main image: PATCH  /admin/properties/:id/media/:mediaId  → { "isMain": true }
```

### Edit Property Data
```
PUT /admin/properties/:id  → update any fields
```

### Delete Property
```
DELETE /admin/properties/:id  → soft delete + all cloud files removed
```

---

## 11. Enum Reference

### listingType
`For Sale` | `For Rent` | `BUY` | `PG`

### propertyType
`Flat` | `Builder Floor` | `Independent House` | `Villa` | `Penthouse` | `Farmhouse` | `Studio Apartment` | `Office Space` | `Shop` | `Showroom` | `Warehouse` | `Factory` | `Co-working Space` | `Residential Plot` | `Commercial Plot` | `Agricultural Land` | `Industrial Land`

### ownershipType
`Freehold` | `Leasehold` | `POA` | `Co-operative Society`

### condition
`Brand New` | `Excellent` | `Good` | `Average` | `Needs Renovation`

### constructionStatus
`Ready to Move` | `Under Construction`

### furnishing
`Unfurnished` | `Semi-Furnished` | `Fully Furnished`

### facing
`North` | `South` | `East` | `West` | `North-East` | `North-West` | `South-East` | `South-West`

### flooringType
`Marble` | `Granite` | `Wooden Flooring`

### waterSupply
`Municipal Water` | `Borewell` | `Both`

### powerBackup
`No Backup` | `Full Backup`

### parkingType
`No Parking` | `Open Parking` | `Covered Parking` | `Basement Parking` | `Stilt Parking`

### securityFeatures
`CCTV` | `Security Guard` | `Gated Community`

### amenities
`Lift` | `Gym` | `Swimming Pool` | `Club House` | `Park` | `Kids Play Area` | `Jogging Track` | `Community Hall` | `Visitor Parking` | `EV Charging` | `Temple` | `Sports Court`

### connectivity
`Near Metro` | `Near Railway Station` | `Near Airport` | `Near Highway` | `Near Bus Stand`

### nearbyFacilities
`School Nearby` | `Hospital Nearby` | `Market Nearby` | `Mall Nearby` | `Bank Nearby` | `Park Nearby`

### status
`draft` | `active` | `pending` | `inactive`

### saleDetails.possessionStatus
`Immediate Possession` | `Within 3 Months` | `Within 6 Months` | `Within 1 Year`

### saleDetails.loanAvailability
`Available` | `Not Available`

### rentalDetails — key enums
- **tenantTypeAllowed:** `Family` | `Bachelor Male` | `Bachelor Female` | `Students` | `Working Professionals` | `Business Owners` | `Government Employees Only` | `Corporate Lease` | `Anyone`
- **occupationPreference:** `Government Job Holders Only` | `Private Employees Only` | `Business Owners Only` | `Self-Employed Only` | `Students Only` | `No Restriction`
- **employmentVerification:** `Government ID` | `Company ID` | `Salary Slip` | `Employment Letter`
- **rentalAgreementDuration:** `11 Months` | `2 Years` | `3 Years` | `More Than 3 Years`
- **minimumStayDuration:** `3 Months` | `6 Months` | `11 Months` | `1 Year` | `2 Years` | `No Minimum`
- **lockInPeriod:** `No Lock-in` | `3 Months` | `6 Months` | `11 Months` | `1 Year`
- **availability / preferredMoveInDate:** `Immediate` | `Within 15 Days` | `Within 30 Days` | `Specific Date`
- **foodPreference:** `Vegetarian Only` | `Non-Vegetarian Allowed` | `No Restriction`
- **pets / smoking / alcohol / guestPolicy:** `Allowed` | `Not Allowed` | `Restricted`
- **tenantVerification:** `Aadhaar` | `PAN` | `Police Verification` | `Employment Proof` | `References` | `No Verification`
- **securityDeposit:** `1 Month Rent` | `2 Months Rent` | `3 Months Rent` | `Custom Amount`

### media.type
`exterior` | `livingRoom` | `bedroom` | `kitchen` | `bathroom` | `balcony` | `society` | `floorPlan` | `video` | `virtualTour`

### document.category
`identity` | `ownership` | `approval` | `taxUtility` | `legal`

### document.type (all valid values)
**identity:** Aadhaar Card, PAN Card, Passport, Driving Licence, Voter ID  
**ownership:** Sale Deed, Registry, Conveyance Deed, Mutation Certificate  
**approval:** RERA Certificate, Occupancy Certificate, Completion Certificate, Approved Building Plan  
**taxUtility:** Property Tax Receipt, Electricity Bill, Water Bill  
**legal:** Encumbrance Certificate, NOC, Society Share Certificate, Sale Deed

---

## API Summary Table

| # | Method | Endpoint | Auth |
|---|--------|----------|------|
| 1 | GET | `/health` | No |
| 2 | GET | `/health/live` | No |
| 3 | GET | `/health/ready` | No |
| 4 | GET | `/api/v1/health` | No |
| 5 | GET | `/api/v1/constants` | No |
| 6 | POST | `/api/v1/admin/auth/login` | No |
| 7 | POST | `/api/v1/admin/auth/refresh-token` | Cookie |
| 8 | GET | `/api/v1/admin/auth/me` | ✅ |
| 9 | POST | `/api/v1/admin/auth/logout` | ✅ |
| 10 | GET | `/api/v1/admin/dashboard/stats` | ✅ |
| 11 | GET | `/api/v1/admin/properties` | ✅ |
| 12 | POST | `/api/v1/admin/properties` | ✅ |
| 13 | GET | `/api/v1/admin/properties/:id` | ✅ |
| 14 | PUT | `/api/v1/admin/properties/:id` | ✅ |
| 15 | PATCH | `/api/v1/admin/properties/:id/status` | ✅ |
| 16 | DELETE | `/api/v1/admin/properties/:id` | ✅ |
| 17 | POST | `/api/v1/admin/properties/:id/media` | ✅ |
| 18 | PUT | `/api/v1/admin/properties/:id/media/:mediaId` | ✅ |
| 19 | PATCH | `/api/v1/admin/properties/:id/media/:mediaId` | ✅ |
| 20 | DELETE | `/api/v1/admin/properties/:id/media/:mediaId` | ✅ |
| 21 | POST | `/api/v1/admin/properties/:id/documents` | ✅ |
| 22 | PUT | `/api/v1/admin/properties/:id/documents/:documentId` | ✅ |
| 23 | PATCH | `/api/v1/admin/properties/:id/documents/:documentId` | ✅ |
| 24 | DELETE | `/api/v1/admin/properties/:id/documents/:documentId` | ✅ |

---

*Last updated: June 2026 | EstateAdmin Backend v1.0.0*
