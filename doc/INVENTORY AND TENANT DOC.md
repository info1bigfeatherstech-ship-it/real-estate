UTHENTICATION
All APIs (except auth) require Bearer Token:

text
Authorization: Bearer <accessToken>
📦 PART 1: MASTER INVENTORY (Admin Only)
1.1 Create Master Inventory Item
text
POST /api/v1/admin/inventory-items
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
Request Body:

json
{
  "name": "Bed",
  "category": "Furniture"
}
Valid Categories: Furniture, Appliance, Key, Accessory, Other

Response:

json
{
  "success": true,
  "message": "Inventory item created successfully",
  "data": {
    "_id": "67a1b2c3d4e5f67890123460",
    "name": "Bed",
    "category": "Furniture",
    "isActive": true,
    "createdBy": { "_id": "...", "name": "Super Admin" },
    "createdAt": "2026-01-01T10:00:00.000Z"
  }
}
1.2 List Master Inventory Items
text
GET /api/v1/admin/inventory-items?page=1&limit=10&category=Furniture&isActive=true
Authorization: Bearer <adminAccessToken>
Query Params:

Param	Type	Default	Description
page	number	1	Page number
limit	number	20	Items per page
search	string	-	Search by name
category	string	-	Filter by category
isActive	boolean	-	Filter by status
sortBy	string	name	name, category, createdAt
sortOrder	string	asc	asc, desc
Response:

json
{
  "success": true,
  "message": "Inventory items fetched successfully",
  "data": [
    {
      "_id": "67a1b2c3d4e5f67890123460",
      "name": "Bed",
      "category": "Furniture",
      "isActive": true,
      "createdBy": { "_id": "...", "name": "Super Admin" },
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 }
}
1.3 Get Single Master Inventory Item
text
GET /api/v1/admin/inventory-items/67a1b2c3d4e5f67890123460
Authorization: Bearer <adminAccessToken>
Response:

json
{
  "success": true,
  "message": "Inventory item fetched successfully",
  "data": {
    "_id": "67a1b2c3d4e5f67890123460",
    "name": "Bed",
    "category": "Furniture",
    "isActive": true,
    "createdBy": { "_id": "...", "name": "Super Admin" },
    "createdAt": "2026-01-01T10:00:00.000Z"
  }
}
1.4 Update Master Inventory Item
text
PUT /api/v1/admin/inventory-items/67a1b2c3d4e5f67890123460
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
Request Body:

json
{
  "name": "Single Bed",
  "category": "Furniture"
}
Response:

json
{
  "success": true,
  "message": "Inventory item updated successfully",
  "data": {
    "_id": "67a1b2c3d4e5f67890123460",
    "name": "Single Bed",
    "category": "Furniture",
    "isActive": true,
    "updatedAt": "2026-01-01T11:00:00.000Z"
  }
}
1.5 Toggle Master Inventory Item Status
text
PATCH /api/v1/admin/inventory-items/67a1b2c3d4e5f67890123460/status
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
Request Body:

json
{
  "isActive": false
}
Response:

json
{
  "success": true,
  "message": "Inventory item deactivated successfully",
  "data": {
    "_id": "67a1b2c3d4e5f67890123460",
    "name": "Single Bed",
    "isActive": false
  }
}
1.6 Delete Master Inventory Item
text
DELETE /api/v1/admin/inventory-items/67a1b2c3d4e5f67890123460
Authorization: Bearer <adminAccessToken>
Response:

json
{
  "success": true,
  "message": "Inventory item deleted successfully"
}
1.7 Seed Default Inventory Items
text
POST /api/v1/admin/inventory-items/seed
Authorization: Bearer <adminAccessToken>
Response:

json
{
  "success": true,
  "message": "Seeded 27 default inventory items successfully",
  "data": [
    { "name": "Bed", "category": "Furniture" },
    { "name": "Mattress", "category": "Furniture" }
  ]
}
📦 PART 2: PROPERTY INVENTORY (Owner Only)
2.1 Create/Update Property Inventory
text
POST /api/v1/customer/inventory
Authorization: Bearer <ownerAccessToken>
Content-Type: application/json
Request Body:

json
{
  "propertyId": "67a1b2c3d4e5f67890123457",
  "items": [
    {
      "masterItemId": "67a1b2c3d4e5f67890123460",
      "name": "Bed",
      "totalQuantity": 10,
      "availableQuantity": 10,
      "inUseQuantity": 0,
      "condition": "Good",
      "remarks": "10 new beds purchased"
    },
    {
      "masterItemId": "67a1b2c3d4e5f67890123461",
      "name": "Mattress",
      "totalQuantity": 10,
      "availableQuantity": 10,
      "inUseQuantity": 0,
      "condition": "Good"
    },
    {
      "masterItemId": "67a1b2c3d4e5f67890123462",
      "name": "Chair",
      "totalQuantity": 10,
      "availableQuantity": 10,
      "inUseQuantity": 0
    },
    {
      "masterItemId": "67a1b2c3d4e5f67890123463",
      "name": "AC",
      "totalQuantity": 5,
      "availableQuantity": 5,
      "inUseQuantity": 0,
      "condition": "Excellent"
    },
    {
      "masterItemId": "67a1b2c3d4e5f67890123464",
      "name": "Main Door Key",
      "totalQuantity": 2,
      "availableQuantity": 2,
      "inUseQuantity": 0
    },
    {
      "masterItemId": "67a1b2c3d4e5f67890123465",
      "name": "Room Key",
      "totalQuantity": 10,
      "availableQuantity": 10,
      "inUseQuantity": 0
    }
  ]
}
Response:

json
{
  "success": true,
  "message": "Inventory created successfully",
  "data": {
    "_id": "67a1b2c3d4e5f67890123470",
    "propertyId": {
      "_id": "67a1b2c3d4e5f67890123457",
      "title": "Vikas PG Andheri"
    },
    "items": [
      {
        "_id": "67a1b2c3d4e5f67890123471",
        "masterItemId": { "_id": "...", "name": "Bed" },
        "name": "Bed",
        "totalQuantity": 10,
        "availableQuantity": 10,
        "inUseQuantity": 0,
        "condition": "Good"
      }
    ],
    "createdBy": { "_id": "...", "fullName": "Vikas Owner" },
    "createdAt": "2026-01-01T10:00:00.000Z"
  }
}
2.2 Get Inventory by Property ID
text
GET /api/v1/customer/inventory/property/67a1b2c3d4e5f67890123457
Authorization: Bearer <ownerAccessToken>
Response:

json
{
  "success": true,
  "message": "Inventory fetched successfully",
  "data": {
    "_id": "67a1b2c3d4e5f67890123470",
    "propertyId": {
      "_id": "67a1b2c3d4e5f67890123457",
      "title": "Vikas PG Andheri"
    },
    "items": [
      {
        "_id": "67a1b2c3d4e5f67890123471",
        "name": "Bed",
        "totalQuantity": 10,
        "availableQuantity": 10,
        "inUseQuantity": 0
      }
    ]
  }
}
2.3 Get Single Inventory by ID
text
GET /api/v1/customer/inventory/67a1b2c3d4e5f67890123470
Authorization: Bearer <ownerAccessToken>
2.4 Update Single Inventory Item
text
PATCH /api/v1/customer/inventory/67a1b2c3d4e5f67890123470/items/67a1b2c3d4e5f67890123471
Authorization: Bearer <ownerAccessToken>
Content-Type: application/json
Request Body:

json
{
  "totalQuantity": 12,
  "availableQuantity": 12,
  "inUseQuantity": 0,
  "condition": "Excellent",
  "remarks": "Added 2 more beds"
}
Response:

json
{
  "success": true,
  "message": "Inventory item updated successfully",
  "data": {
    "_id": "67a1b2c3d4e5f67890123470",
    "items": [
      {
        "_id": "67a1b2c3d4e5f67890123471",
        "name": "Bed",
        "totalQuantity": 12,
        "availableQuantity": 12,
        "inUseQuantity": 0
      }
    ]
  }
}
2.5 Delete Single Inventory Item
text
DELETE /api/v1/customer/inventory/67a1b2c3d4e5f67890123470/items/67a1b2c3d4e5f67890123471
Authorization: Bearer <ownerAccessToken>
Response:

json
{
  "success": true,
  "message": "Inventory item deleted successfully",
  "data": { ... }
}
2.6 Delete Entire Property Inventory
text
DELETE /api/v1/customer/inventory/67a1b2c3d4e5f67890123470
Authorization: Bearer <ownerAccessToken>
Response:

json
{
  "success": true,
  "message": "Inventory deleted successfully"
}
2.7 Get Inventory Summary
text
GET /api/v1/customer/inventory/summary
Authorization: Bearer <ownerAccessToken>
Response:

json
{
  "success": true,
  "message": "Inventory summary fetched successfully",
  "data": {
    "totalInventories": 1,
    "totalItems": 47,
    "totalAvailable": 47,
    "totalInUse": 0,
    "inventories": [...]
  }
}
📦 PART 3: TENANT ENTRY (Owner Only)
3.1 Create Tenant Entry
text
POST /api/v1/customer/tenants
Authorization: Bearer <ownerAccessToken>
Content-Type: multipart/form-data
Form Data Fields:

Field	Type	Required	Description
tenantName	Text	✅	Tenant full name
mobile	Text	✅	Mobile number
email	Text	❌	Email address
occupantType	Text	✅	Family, Bachelor, Student, Working Professional
propertyId	Text	✅	Property ID
roomNumber	Text	❌	Room/flat number
bedNumber	Text	❌	Bed number (PG/Co-Living)
agreementStartDate	Text	✅	YYYY-MM-DD
agreementEndDate	Text	✅	YYYY-MM-DD
monthlyRent	Text	✅	Monthly rent amount
securityDeposit	Text	✅	Security deposit amount
lockInPeriod	Text	❌	Lock-in period
keys[mainDoor][count]	Text	❌	Main door keys count
keys[room][count]	Text	❌	Room keys count
keys[cupboard][count]	Text	❌	Cupboard keys count
keys[drawer][count]	Text	❌	Drawer keys count
keys[accessCard][count]	Text	❌	Access cards count
keys[parkingRemote][count]	Text	❌	Parking remotes count
keys[other]	Text	❌	Other keys description
meters[electricity]	Text	❌	Electricity meter reading
meters[water]	Text	❌	Water meter reading
meters[gas]	Text	❌	Gas meter reading
furniture[0][inventoryItemId]	Text	❌	Master inventory item ID
furniture[0][name]	Text	❌	Item name
furniture[0][quantity]	Text	❌	Quantity
furniture[0][condition]	Text	❌	Condition
appliances[0][inventoryItemId]	Text	❌	Master inventory item ID
appliances[0][name]	Text	❌	Item name
appliances[0][quantity]	Text	❌	Quantity
appliances[0][condition]	Text	❌	Condition
propertyCondition[walls]	Text	❌	Walls condition
propertyCondition[floor]	Text	❌	Floor condition
propertyCondition[doors]	Text	❌	Doors condition
propertyCondition[windows]	Text	❌	Windows condition
propertyCondition[bathroom]	Text	❌	Bathroom condition
propertyCondition[kitchen]	Text	❌	Kitchen condition
remarks[existingDamage]	Text	❌	Existing damage notes
remarks[missingItems]	Text	❌	Missing items notes
tenantSignature	Text	❌	Tenant signature
signatureDate	Text	❌	Signature date
roomPhotos	File	❌	Room photos (multiple)
furniturePhotos	File	❌	Furniture photos (multiple)
appliancePhotos	File	❌	Appliance photos (multiple)
meterPhotos	File	❌	Meter photos (multiple)
Example Form Data in Postman:

text
tenantName: Rahul Sharma
mobile: +919876543210
email: rahul@example.com
occupantType: Bachelor
propertyId: 67a1b2c3d4e5f67890123457
roomNumber: 101
bedNumber: B-01
agreementStartDate: 2026-01-01
agreementEndDate: 2026-12-31
monthlyRent: 15000
securityDeposit: 30000
lockInPeriod: 11 Months
keys[mainDoor][count]: 2
keys[room][count]: 1
keys[cupboard][count]: 1
meters[electricity]: 1000
meters[water]: 500
meters[gas]: 200
furniture[0][inventoryItemId]: 67a1b2c3d4e5f67890123460
furniture[0][name]: Bed
furniture[0][quantity]: 1
furniture[1][inventoryItemId]: 67a1b2c3d4e5f67890123461
furniture[1][name]: Mattress
furniture[1][quantity]: 1
appliances[0][inventoryItemId]: 67a1b2c3d4e5f67890123463
appliances[0][name]: AC
appliances[0][quantity]: 1
propertyCondition[walls]: Good
propertyCondition[floor]: Good
roomPhotos: [file1.jpg, file2.jpg]
furniturePhotos: [file1.jpg]
Response:

json
{
  "success": true,
  "message": "Tenant entry created successfully",
  "data": {
    "_id": "67a1b2c3d4e5f67890123480",
    "tenantId": "TEN-12345-ABCDEF",
    "tenantName": "Rahul Sharma",
    "mobile": "+919876543210",
    "occupantType": "Bachelor",
    "propertyId": {
      "_id": "67a1b2c3d4e5f67890123457",
      "title": "Vikas PG Andheri"
    },
    "roomNumber": "101",
    "status": "active",
    "createdAt": "2026-01-01T10:00:00.000Z"
  }
}
3.2 List Tenant Entries
text
GET /api/v1/customer/tenants?page=1&limit=10&status=active&occupantType=Bachelor
Authorization: Bearer <ownerAccessToken>
Query Params:

Param	Type	Default	Description
page	number	1	Page number
limit	number	20	Items per page
search	string	-	Search by name, mobile, tenantId
propertyId	string	-	Filter by property
status	string	-	active, completed, disputed
occupantType	string	-	Family, Bachelor, etc.
sortBy	string	createdAt	tenantName, createdAt, status
sortOrder	string	desc	asc, desc
Response:

json
{
  "success": true,
  "message": "Tenant entries fetched successfully",
  "data": [
    {
      "_id": "67a1b2c3d4e5f67890123480",
      "tenantId": "TEN-12345-ABCDEF",
      "tenantName": "Rahul Sharma",
      "mobile": "+919876543210",
      "occupantType": "Bachelor",
      "propertyId": { "_id": "...", "title": "Vikas PG Andheri" },
      "roomNumber": "101",
      "status": "active",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
}
3.3 Get Single Tenant Entry
text
GET /api/v1/customer/tenants/67a1b2c3d4e5f67890123480
Authorization: Bearer <ownerAccessToken>
Response: Full tenant entry with all details.

3.4 Get Tenants by Property
text
GET /api/v1/customer/tenants/property/67a1b2c3d4e5f67890123457
Authorization: Bearer <ownerAccessToken>
Response: List of active tenants for that property.

3.5 Update Tenant Entry
text
PUT /api/v1/customer/tenants/67a1b2c3d4e5f67890123480
Authorization: Bearer <ownerAccessToken>
Content-Type: application/json
Request Body:

json
{
  "monthlyRent": 16000,
  "tenantName": "Rahul Kumar Sharma",
  "roomNumber": "102"
}
Response:

json
{
  "success": true,
  "message": "Tenant entry updated successfully",
  "data": {
    "_id": "67a1b2c3d4e5f67890123480",
    "tenantName": "Rahul Kumar Sharma",
    "monthlyRent": 16000,
    "roomNumber": "102",
    "updatedAt": "2026-01-01T11:00:00.000Z"
  }
}
3.6 Delete Tenant Entry
text
DELETE /api/v1/customer/tenants/67a1b2c3d4e5f67890123480
Authorization: Bearer <ownerAccessToken>
Response:

json
{
  "success": true,
  "message": "Tenant entry deleted successfully"
}
3.7 Get Tenant Summary
text
GET /api/v1/customer/tenants/summary
Authorization: Bearer <ownerAccessToken>
Response:

json
{
  "success": true,
  "message": "Tenant summary fetched successfully",
  "data": {
    "totalTenants": 5,
    "activeTenants": 3,
    "completedTenants": 1,
    "disputedTenants": 1,
    "totalMonthlyRent": 75000,
    "totalSecurityDeposit": 150000,
    "recentEntries": [...]
  }
}
📦 PART 4: TENANT EXIT (Owner Only)
4.1 Get Entry for Auto-fill
text
GET /api/v1/customer/exits/entry/67a1b2c3d4e5f67890123480
Authorization: Bearer <ownerAccessToken>
Response: Entry record data auto-filled for exit form.

4.2 Get Exit by Entry
text
GET /api/v1/customer/exits/entry/67a1b2c3d4e5f67890123480/exit
Authorization: Bearer <ownerAccessToken>
Response: Exit record linked to this entry.

4.3 Create Tenant Exit
text
POST /api/v1/customer/exits
Authorization: Bearer <ownerAccessToken>
Content-Type: multipart/form-data
Form Data Fields:

Field	Type	Required	Description
entryRecordId	Text	✅	Tenant entry ID
exitDate	Text	✅	YYYY-MM-DD
exitTime	Text	❌	Exit time
reasonForLeaving	Text	✅	Lease End, Relocation, Upgrade, Personal Reasons, Other
reasonOther	Text	❌	If reason is Other
exitMeters[electricity]	Text	❌	Electricity reading
exitMeters[water]	Text	❌	Water reading
exitMeters[gas]	Text	❌	Gas reading
charges[pendingRent]	Text	❌	Pending rent
charges[electricityCharges]	Text	❌	Electricity charges
charges[waterCharges]	Text	❌	Water charges
charges[maintenanceCharges]	Text	❌	Maintenance charges
charges[damageCharges]	Text	❌	Damage charges
charges[cleaningCharges]	Text	❌	Cleaning charges
charges[otherCharges]	Text	❌	Other charges
charges[totalDeductions]	Text	❌	Total deductions
securityDeposit[depositAmount]	Text	❌	Original deposit
securityDeposit[amountDeducted]	Text	❌	Amount deducted
securityDeposit[refundAmount]	Text	❌	Refund amount
missingItemsList	Text	❌	Missing items
damageNotes	Text	❌	Damage description
handoverStatus	Text	❌	Pending Verification, Completed Successfully, Damage Dispute, Deposit Hold
tenantSignature	Text	❌	Tenant signature
propertyManagerSignature	Text	❌	Manager signature
handoverDate	Text	❌	Handover date
exitRoomPhotos	File	❌	Room photos
exitDamagePhotos	File	❌	Damage photos
exitMeterPhotos	File	❌	Meter photos
Example Form Data:

text
entryRecordId: 67a1b2c3d4e5f67890123480
exitDate: 2026-06-30
exitTime: 11:00 AM
reasonForLeaving: Lease End
exitMeters[electricity]: 1500
exitMeters[water]: 600
exitMeters[gas]: 250
charges[pendingRent]: 0
charges[electricityCharges]: 500
charges[waterCharges]: 100
charges[damageCharges]: 2000
charges[cleaningCharges]: 1000
charges[totalDeductions]: 3600
securityDeposit[depositAmount]: 30000
securityDeposit[amountDeducted]: 3600
securityDeposit[refundAmount]: 26400
missingItemsList: None
damageNotes: Minor scratch on wall
handoverStatus: Pending Verification
tenantSignature: Rahul Sharma
propertyManagerSignature: Vikas Owner
handoverDate: 2026-06-30
Response:

json
{
  "success": true,
  "message": "Tenant exit created successfully",
  "data": {
    "_id": "67a1b2c3d4e5f67890123490",
    "entryRecordId": "67a1b2c3d4e5f67890123480",
    "tenantName": "Rahul Sharma",
    "mobile": "+919876543210",
    "exitDate": "2026-06-30",
    "reasonForLeaving": "Lease End",
    "handoverStatus": "Pending Verification",
    "charges": { "totalDeductions": 3600 },
    "securityDeposit": { "depositAmount": 30000, "refundAmount": 26400 },
    "createdAt": "2026-06-22T10:00:00.000Z"
  }
}
4.4 List Tenant Exits
text
GET /api/v1/customer/exits?page=1&limit=10&handoverStatus=Pending Verification
Authorization: Bearer <ownerAccessToken>
Query Params:

Param	Type	Default	Description
page	number	1	Page number
limit	number	20	Items per page
search	string	-	Search by tenant name, mobile
propertyId	string	-	Filter by property
handoverStatus	string	-	Pending Verification, Completed Successfully, etc.
sortBy	string	createdAt	tenantName, exitDate, createdAt
sortOrder	string	desc	asc, desc
Response:

json
{
  "success": true,
  "message": "Tenant exits fetched successfully",
  "data": [
    {
      "_id": "67a1b2c3d4e5f67890123490",
      "entryRecordId": { "_id": "...", "tenantName": "Rahul Sharma" },
      "tenantName": "Rahul Sharma",
      "exitDate": "2026-06-30",
      "handoverStatus": "Pending Verification",
      "charges": { "totalDeductions": 3600 },
      "createdAt": "2026-06-22T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
4.5 Get Single Tenant Exit
text
GET /api/v1/customer/exits/67a1b2c3d4e5f67890123490
Authorization: Bearer <ownerAccessToken>
Response: Full tenant exit with all details.

4.6 Update Tenant Exit
text
PUT /api/v1/customer/exits/67a1b2c3d4e5f67890123490
Authorization: Bearer <ownerAccessToken>
Content-Type: application/json
Request Body:

json
{
  "handoverStatus": "Completed Successfully",
  "handoverDate": "2026-06-30",
  "propertyManagerSignature": "Vikas Owner"
}
Response:

json
{
  "success": true,
  "message": "Tenant exit updated successfully",
  "data": {
    "_id": "67a1b2c3d4e5f67890123490",
    "handoverStatus": "Completed Successfully",
    "handoverDate": "2026-06-30",
    "updatedAt": "2026-06-22T11:00:00.000Z"
  }
}
4.7 Delete Tenant Exit
text
DELETE /api/v1/customer/exits/67a1b2c3d4e5f67890123490
Authorization: Bearer <ownerAccessToken>
Response:

json
{
  "success": true,
  "message": "Tenant exit deleted successfully"
}
4.8 Get Tenant Exit Summary
text
GET /api/v1/customer/exits/summary
Authorization: Bearer <ownerAccessToken>
Response:

json
{
  "success": true,
  "message": "Tenant exit summary fetched successfully",
  "data": {
    "totalExits": 3,
    "pendingExits": 1,
    "completedExits": 1,
    "disputedExits": 1,
    "totalRefundAmount": 26400,
    "totalDeductions": 3600,
    "recentExits": [...]
  }
}
📋 API SUMMARY TABLE
#	Method	Endpoint	Auth	Purpose
MASTER INVENTORY (Admin)				
1	POST	/api/v1/admin/inventory-items	Admin	Create master item
2	GET	/api/v1/admin/inventory-items	Admin	List master items
3	GET	/api/v1/admin/inventory-items/:id	Admin	Get master item
4	PUT	/api/v1/admin/inventory-items/:id	Admin	Update master item
5	PATCH	/api/v1/admin/inventory-items/:id/status	Admin	Toggle status
6	DELETE	/api/v1/admin/inventory-items/:id	Admin	Delete master item
7	POST	/api/v1/admin/inventory-items/seed	Admin	Seed default items
PROPERTY INVENTORY (Owner)				
8	POST	/api/v1/customer/inventory	Owner	Create/Update property inventory
9	GET	/api/v1/customer/inventory/property/:propertyId	Owner	Get by property
10	GET	/api/v1/customer/inventory/:id	Owner	Get single inventory
11	PATCH	/api/v1/customer/inventory/:id/items/:itemId	Owner	Update item
12	DELETE	/api/v1/customer/inventory/:id/items/:itemId	Owner	Delete item
13	DELETE	/api/v1/customer/inventory/:id	Owner	Delete entire inventory
14	GET	/api/v1/customer/inventory/summary	Owner	Get summary
TENANT ENTRY (Owner)				
15	POST	/api/v1/customer/tenants	Owner	Create tenant entry
16	GET	/api/v1/customer/tenants	Owner	List tenants
17	GET	/api/v1/customer/tenants/:id	Owner	Get tenant
18	GET	/api/v1/customer/tenants/property/:propertyId	Owner	Get by property
19	PUT	/api/v1/customer/tenants/:id	Owner	Update tenant
20	DELETE	/api/v1/customer/tenants/:id	Owner	Delete tenant
21	GET	/api/v1/customer/tenants/summary	Owner	Get summary
TENANT EXIT (Owner)				
22	GET	/api/v1/customer/exits/entry/:entryId	Owner	Get entry for auto-fill
23	GET	/api/v1/customer/exits/entry/:entryId/exit	Owner	Get exit by entry
24	POST	/api/v1/customer/exits	Owner	Create tenant exit
25	GET	/api/v1/customer/exits	Owner	List exits
26	GET	/api/v1/customer/exits/:id	Owner	Get exit
27	PUT	/api/v1/customer/exits/:id	Owner	Update exit
28	DELETE	/api/v1/customer/exits/:id	Owner	Delete exit
29	GET	/api/v1/customer/exits/summary	Owner	Get summary
🚀 NEXT STEP
