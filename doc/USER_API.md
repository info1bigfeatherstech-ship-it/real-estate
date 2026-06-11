# EstateAdmin — User (Public) API Documentation

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:7000` (check your `.env` `PORT`)  
> **API Prefix:** `/api/v1`  
> **Full Base:** `http://localhost:7000/api/v1`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Response Format](#2-response-format)
3. [Public Constants API](#3-public-constants-api)
4. [Property List API](#4-property-list-api)
5. [Property Detail APIs](#5-property-detail-apis)
6. [Related Properties API](#6-related-properties-api)
7. [Filter Reference](#7-filter-reference)
8. [Example Use Cases](#8-example-use-cases)
9. [Enum Reference](#9-enum-reference)

---

## 1. Overview

User-facing APIs are **read-only** and **do not require authentication**. They expose only properties with:

- `status: active`
- `isDeleted: false`

**Never returned on public APIs:** `documents[]`, `storageKey`, `storageProvider`, `createdBy`, `lastUpdatedBy`, `status`, `isDeleted`, `deletedAt`.

| # | Method | Endpoint | Auth |
|---|--------|----------|------|
| 1 | GET | `/api/v1/constants` | No |
| 2 | GET | `/api/v1/user/properties` | No |
| 3 | GET | `/api/v1/user/properties/listing/:listingId` | No |
| 4 | GET | `/api/v1/user/properties/:id` | No |
| 5 | GET | `/api/v1/user/properties/:id/related` | No |

---

## 2. Response Format

### Success (list)
```json
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 156,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Success (single)
```json
{
  "success": true,
  "message": "Property fetched successfully",
  "data": { }
}
```

### Error
```json
{
  "success": false,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    { "field": "minPrice", "message": "price: minimum cannot exceed maximum" }
  ],
  "requestId": "uuid"
}
```

---

## 3. Public Constants API

| | |
|---|---|
| **GET** | `/api/v1/constants` |
| **Auth** | None |

Returns all enums (listing types, property types, amenities, states, etc.) for building website filter UI.

---

## 4. Property List API

| | |
|---|---|
| **GET** | `/api/v1/user/properties` |
| **Auth** | None |

Returns paginated property cards. Only **active** listings are included.

### Pagination & sorting

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number (min 1) |
| `limit` | number | `12` | Items per page (max 100) |
| `sortBy` | string | `publishedAt` | `publishedAt`, `price`, `createdAt`, `area.value`, `title` |
| `sortOrder` | string | `desc` | `asc` or `desc` |

### List card response fields

Each item in `data[]` contains:

`_id`, `listingId`, `listingType`, `propertyType`, `title`, `price`, `maintenance`, `bedrooms`, `bathrooms`, `area`, `furnishing`, `location` (city/state/pincode only), `mainImage`, `publishedAt`

### Example
```
GET /api/v1/user/properties?page=1&limit=12&sortBy=publishedAt&sortOrder=desc
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
      "maintenance": 3500,
      "bedrooms": 2,
      "bathrooms": 2,
      "area": { "value": 1050, "unit": "sqft" },
      "furnishing": "Semi-Furnished",
      "location": {
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400053"
      },
      "mainImage": "http://localhost:7000/uploads/properties/6789.../media/photo.webp",
      "publishedAt": "2026-06-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 5. Property Detail APIs

### 5.1 By listing ID (SEO-friendly — primary)

| | |
|---|---|
| **GET** | `/api/v1/user/properties/listing/:listingId` |
| **Auth** | None |

**Example:**
```
GET /api/v1/user/properties/listing/EA-88231-A3F2C1
```

### 5.2 By MongoDB ID (fallback)

| | |
|---|---|
| **GET** | `/api/v1/user/properties/:id` |
| **Auth** | None |

**Example:**
```
GET /api/v1/user/properties/6789abcdef1234567890abcd
```

### Detail response fields

Full public property view including `description`, all attributes, `rentalDetails`/`saleDetails`, full `location` (with address and coordinates), sanitized `media[]` (`_id`, `type`, `url`, `isMain`, `mimeType`), `mainImage`, `publishedAt`, `createdAt`, `updatedAt`.

**Success response (200) — abbreviated:**
```json
{
  "success": true,
  "message": "Property fetched successfully",
  "data": {
    "_id": "6789abcdef1234567890abcd",
    "listingId": "EA-88231-A3F2C1",
    "listingType": "For Sale",
    "propertyType": "Flat",
    "title": "Skyline 2BHK Flat",
    "description": "Spacious 2BHK in prime location...",
    "price": 7500000,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["Lift", "Gym", "Swimming Pool"],
    "location": {
      "fullAddress": "Skyline Heights, Andheri West, Mumbai",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400053",
      "latitude": 19.1356,
      "longitude": 72.8267
    },
    "media": [
      {
        "_id": "media001",
        "type": "exterior",
        "url": "http://localhost:7000/uploads/.../photo.webp",
        "isMain": true,
        "mimeType": "image/webp"
      }
    ],
    "mainImage": "http://localhost:7000/uploads/.../photo.webp",
    "saleDetails": {
      "possessionStatus": "Immediate Possession",
      "loanAvailability": "Available"
    },
    "publishedAt": "2026-06-01T10:00:00.000Z"
  }
}
```

> Draft, pending, inactive, or deleted properties return **404** with message `"Property not found"`.

---

## 6. Related Properties API

| | |
|---|---|
| **GET** | `/api/v1/user/properties/:id/related` |
| **Auth** | None |

Returns similar active listings based on:
- Same `listingType` and `propertyType`
- Same `location.city`
- Price within ±25% of source property
- Sorted by `publishedAt` desc

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | `6` | Max results (1–12) |

**Example:**
```
GET /api/v1/user/properties/6789abcdef1234567890abcd/related?limit=6
```

**Success response (200):**
```json
{
  "success": true,
  "message": "Related properties fetched successfully",
  "data": [
    {
      "_id": "6789abcdef1234567890abce",
      "listingId": "EA-44102-B7D3E9",
      "listingType": "For Sale",
      "propertyType": "Flat",
      "title": "Green Valley 2BHK",
      "price": 7200000,
      "mainImage": "http://localhost:7000/uploads/.../photo.webp",
      "location": { "city": "Mumbai", "state": "Maharashtra", "pincode": "400058" }
    }
  ]
}
```

---

## 7. Filter Reference

All filters below apply to `GET /api/v1/user/properties`.

### Core filters

| Param | Match | Example |
|-------|-------|---------|
| `search` | title, listingId, city, address (partial) | `skyline andheri` |
| `listingType` | exact | `For Sale`, `For Rent`, `BUY`, `PG` |
| `propertyType` | exact | `Flat`, `Villa`, `Independent House` |
| `city` | partial, case-insensitive | `Mumbai` |
| `state` | exact | `Maharashtra` |
| `pincode` | exact 6-digit | `400001` |

### Price & area

| Param | Field |
|-------|-------|
| `minPrice` / `maxPrice` | `price` range |
| `minArea` / `maxArea` | `area.value` (sqft) range |
| `minMaintenance` / `maxMaintenance` | `maintenance` range |

### Rooms & floors

| Param | Field |
|-------|-------|
| `bedrooms` | exact bedrooms |
| `minBedrooms` / `maxBedrooms` | bedrooms range |
| `bathrooms` | exact bathrooms |
| `minBathrooms` / `maxBathrooms` | bathrooms range |
| `floorNo` | exact floor |
| `minFloorNo` / `maxFloorNo` | floor range |
| `totalFloors` | exact total floors |

### Property attributes

| Param | Values |
|-------|--------|
| `ownershipType` | Freehold, Leasehold, POA, Co-operative Society |
| `condition` | Brand New, Excellent, Good, Average, Needs Renovation |
| `constructionStatus` | Ready to Move, Under Construction |
| `furnishing` | Unfurnished, Semi-Furnished, Fully Furnished |
| `facing` | North, South, East, West, North-East, North-West, South-East, South-West |
| `flooringType` | Marble, Granite, Wooden Flooring |
| `waterSupply` | Municipal Water, Borewell, Both |
| `powerBackup` | No Backup, Full Backup |
| `parkingType` | No Parking, Open Parking, Covered Parking, Basement Parking, Stilt Parking |

### Multi-select (comma-separated)

| Param | Mode param | Default match |
|-------|------------|---------------|
| `amenities` | `amenitiesMode` (`any` / `all`) | any (`$in`) |
| `securityFeatures` | `securityFeaturesMode` | any |
| `connectivity` | `connectivityMode` | any |
| `nearbyFacilities` | `nearbyFacilitiesMode` | any |

**Example:** `amenities=Lift,Gym` → properties with Lift **or** Gym  
**Strict:** `amenities=Lift,Gym&amenitiesMode=all` → properties with **both**

### Rental filters (For Rent / PG)

| Param | Field |
|-------|-------|
| `tenantTypeAllowed` | comma-separated tenant types |
| `availability` | Immediate, Within 15 Days, etc. |
| `foodPreference` | Vegetarian Only, etc. |
| `pets` / `smoking` / `alcohol` | Allowed, Not Allowed, Restricted |
| `securityDeposit` | 1 Month Rent, 2 Months Rent, etc. |
| `governmentEmployeePreferred` | `true` or `false` |

### Sale filters (For Sale / BUY)

| Param | Field |
|-------|-------|
| `possessionStatus` | Immediate Possession, Within 3 Months, etc. |
| `loanAvailability` | Available, Not Available |

---

## 8. Example Use Cases

### Homepage — latest listings
```
GET /api/v1/user/properties?page=1&limit=12&sortBy=publishedAt&sortOrder=desc
```

### Buy flats in Mumbai under ₹1 Cr
```
GET /api/v1/user/properties?listingType=For%20Sale&propertyType=Flat&city=Mumbai&maxPrice=10000000
```

### Rent — 2BHK furnished with lift
```
GET /api/v1/user/properties?listingType=For%20Rent&minBedrooms=2&furnishing=Fully%20Furnished&amenities=Lift
```

### Search by keyword
```
GET /api/v1/user/properties?search=skyline%20andheri
```

### Maharashtra villas ready to move
```
GET /api/v1/user/properties?propertyType=Villa&state=Maharashtra&constructionStatus=Ready%20to%20Move
```

### Property detail (website URL)
```
GET /api/v1/user/properties/listing/EA-88231-A3F2C1
```

### Similar properties on detail page
```
GET /api/v1/user/properties/6789abcdef1234567890abcd/related?limit=6
```

---

## 9. Enum Reference

All valid enum values are available at `GET /api/v1/constants`. Key groups:

- **listingType:** `For Sale`, `For Rent`, `BUY`, `PG`
- **propertyType:** Flat, Villa, Independent House, Builder Floor, etc. (17 types)
- **furnishing:** Unfurnished, Semi-Furnished, Fully Furnished
- **amenities:** Lift, Gym, Swimming Pool, Club House, etc.
- **connectivity:** Near Metro, Near Railway Station, Near Airport, etc.
- **state:** All 36 Indian states/UTs (exact name match)

See [ADMIN_API.md §11](./ADMIN_API.md#11-enum-reference) for the full enum list shared with admin APIs.

---

## Not Supported (Phase 1)

| Feature | Reason |
|---------|--------|
| Geo-radius search ("5km near me") | No `2dsphere` index on coordinates |
| Description full-text search | Text index covers title/city/address only |
| Documents | Admin-only sensitive data |
| Draft/pending/inactive listings | Admin-only; never exposed publicly |
| Write operations | User APIs are read-only |
