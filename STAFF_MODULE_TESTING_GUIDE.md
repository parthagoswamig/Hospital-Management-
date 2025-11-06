# Staff Management Module - Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
1. Backend server running on `http://localhost:3001`
2. Frontend server running on `http://localhost:3000`
3. Valid user account with appropriate role
4. Tenant ID available in localStorage

---

## 📝 Test Scenarios

### 1. Create Staff Member

**Steps:**
1. Navigate to `/dashboard/staff`
2. Click "Add Staff" button
3. Fill in the form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@hospital.com`
   - Password: `Password123!`
   - Role: `DOCTOR`
   - Designation: `Senior Cardiologist` (optional)
   - Specialization: `Cardiology` (optional)
   - License Number: `MED123456` (optional)
   - Qualification: `MBBS, MD` (optional)
   - Experience: `5 years` (optional)
   - Joining Date: `2024-01-15` (optional)

**Expected Results:**
- ✅ Form validates all required fields
- ✅ Email format is validated
- ✅ Password length is validated (min 8 chars)
- ✅ Success notification appears
- ✅ Modal closes automatically
- ✅ Staff list refreshes with new member
- ✅ Stats update (total staff count increases)

**API Call:**
```http
POST http://localhost:3001/staff
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@hospital.com",
  "password": "Password123!",
  "role": "DOCTOR",
  "designation": "Senior Cardiologist",
  "specialization": "Cardiology",
  "licenseNumber": "MED123456",
  "qualification": "MBBS, MD",
  "experience": "5 years",
  "joiningDate": "2024-01-15"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Staff member added successfully",
  "data": {
    "id": "uuid",
    "employeeId": "EMP20240001",
    "userId": "user-uuid",
    "designation": "Senior Cardiologist",
    "joiningDate": "2024-01-15T00:00:00.000Z",
    "qualification": "MBBS, MD",
    "experience": "5 years",
    "isActive": true,
    "user": {
      "id": "user-uuid",
      "email": "john.doe@hospital.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "DOCTOR",
      "specialization": "Cardiology",
      "licenseNumber": "MED123456"
    },
    "department": null,
    "tenantId": "tenant-uuid",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### 2. View Staff List

**Steps:**
1. Navigate to `/dashboard/staff`
2. Observe the staff list table

**Expected Results:**
- ✅ List loads from API
- ✅ Shows all staff members for current tenant only
- ✅ Displays: Name, Employee ID, Role, Department, Experience, Status
- ✅ Shows empty state if no staff members
- ✅ Pagination works (if more than 10 staff)

**API Call:**
```http
GET http://localhost:3001/staff?page=1&limit=10
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "id": "uuid",
        "employeeId": "EMP20240001",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@hospital.com",
          "role": "DOCTOR"
        },
        "isActive": true
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 3. Search Staff

**Steps:**
1. Navigate to `/dashboard/staff`
2. Enter search query in search box: `John`
3. Observe filtered results

**Expected Results:**
- ✅ List filters to show only matching staff
- ✅ Searches by: firstName, lastName, email, employeeId
- ✅ Case-insensitive search

**API Call:**
```http
GET http://localhost:3001/staff?search=John
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
```

---

### 4. Filter by Role

**Steps:**
1. Navigate to `/dashboard/staff`
2. Select "Doctor" from Role dropdown
3. Observe filtered results

**Expected Results:**
- ✅ Shows only doctors
- ✅ Other roles hidden

**API Call:**
```http
GET http://localhost:3001/staff?role=DOCTOR
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
```

---

### 5. Filter by Status

**Steps:**
1. Navigate to `/dashboard/staff`
2. Select "Active" from Status dropdown
3. Observe filtered results

**Expected Results:**
- ✅ Shows only active staff
- ✅ Inactive staff hidden

**API Call:**
```http
GET http://localhost:3001/staff?status=active
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
```

---

### 6. Edit Staff Member

**Steps:**
1. Navigate to `/dashboard/staff`
2. Click edit icon (green pencil) on a staff member
3. Modify fields:
   - First Name: `Jane`
   - Designation: `Chief Cardiologist`
4. Click "Update Staff"

**Expected Results:**
- ✅ Form pre-populates with existing data
- ✅ Form validates required fields
- ✅ Success notification appears
- ✅ Modal closes automatically
- ✅ Staff list refreshes with updated data

**API Call:**
```http
PATCH http://localhost:3001/staff/{staffId}
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
Content-Type: application/json

{
  "firstName": "Jane",
  "designation": "Chief Cardiologist"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Staff member updated successfully",
  "data": {
    "id": "uuid",
    "employeeId": "EMP20240001",
    "designation": "Chief Cardiologist",
    "user": {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "john.doe@hospital.com",
      "role": "DOCTOR"
    },
    "isActive": true
  }
}
```

---

### 7. Delete Staff Member (Soft Delete)

**Steps:**
1. Navigate to `/dashboard/staff`
2. Click three dots menu on a staff member
3. Click "Delete"
4. Confirm deletion in confirmation dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Success notification appears
- ✅ Staff member removed from active list
- ✅ Staff appears when filtering by "Inactive" status
- ✅ Stats update (active staff count decreases)

**API Call:**
```http
DELETE http://localhost:3001/staff/{staffId}
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Staff member deactivated successfully"
}
```

---

### 8. View Staff Statistics

**Steps:**
1. Navigate to `/dashboard/staff`
2. Observe statistics cards at the top

**Expected Results:**
- ✅ Total Staff count displayed
- ✅ Active Staff count displayed
- ✅ Doctors count displayed
- ✅ Nurses count displayed
- ✅ Stats update after CRUD operations

**API Call:**
```http
GET http://localhost:3001/staff/stats
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalStaff": 10,
    "activeStaff": 8,
    "inactiveStaff": 2,
    "byRole": {
      "doctors": 5,
      "nurses": 3,
      "labTechnicians": 1,
      "pharmacists": 1
    }
  }
}
```

---

## 🔐 RBAC Testing

### Test Create Permission

**Allowed Roles:**
- SUPER_ADMIN ✅
- TENANT_ADMIN ✅
- HOSPITAL_ADMIN ✅
- HR_MANAGER ✅

**Denied Roles:**
- DOCTOR ❌
- NURSE ❌
- RECEPTIONIST ❌

**Test:**
1. Login as DOCTOR
2. Try to create staff
3. Should receive 403 Forbidden error

---

### Test Update Permission

**Allowed Roles:**
- SUPER_ADMIN ✅
- TENANT_ADMIN ✅
- HOSPITAL_ADMIN ✅
- HR_MANAGER ✅

**Denied Roles:**
- DOCTOR ❌
- NURSE ❌
- RECEPTIONIST ❌

---

### Test Delete Permission

**Allowed Roles:**
- SUPER_ADMIN ✅
- TENANT_ADMIN ✅
- HOSPITAL_ADMIN ✅

**Denied Roles:**
- HR_MANAGER ❌
- DOCTOR ❌
- NURSE ❌

---

## 🏢 Tenant Isolation Testing

### Test 1: Cross-Tenant Access Prevention

**Steps:**
1. Login as User A (Tenant 1)
2. Create a staff member
3. Note the staff ID
4. Login as User B (Tenant 2)
5. Try to access staff member from Tenant 1 using API

**Expected Result:**
- ❌ Should receive 403 Forbidden or 404 Not Found
- ✅ Cannot see staff from other tenants

### Test 2: Tenant Header Validation

**Steps:**
1. Make API request without `X-Tenant-Id` header
2. Make API request with wrong `X-Tenant-Id`

**Expected Result:**
- ✅ TenantGuard extracts tenant from JWT token
- ✅ Request succeeds with correct tenant context
- ❌ Cannot access data from other tenants

---

## ⚠️ Error Scenarios

### 1. Missing Required Fields

**Test:**
```json
POST /staff
{
  "email": "test@example.com"
  // Missing firstName, lastName, password, role
}
```

**Expected:**
```json
{
  "statusCode": 400,
  "message": [
    "firstName should not be empty",
    "lastName should not be empty",
    "password should not be empty",
    "role must be a valid enum value"
  ],
  "error": "Bad Request"
}
```

---

### 2. Invalid Email Format

**Test:**
```json
POST /staff
{
  "email": "invalid-email",
  "firstName": "John",
  "lastName": "Doe",
  "password": "Password123!",
  "role": "DOCTOR"
}
```

**Expected:**
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

---

### 3. Password Too Short

**Test:**
```json
POST /staff
{
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "123",
  "role": "DOCTOR"
}
```

**Expected:**
```json
{
  "statusCode": 400,
  "message": ["password must be longer than or equal to 8 characters"],
  "error": "Bad Request"
}
```

---

### 4. Unauthorized Access

**Test:**
```http
POST /staff
(No Authorization header)
```

**Expected:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### 5. Insufficient Permissions

**Test:**
```http
POST /staff
Authorization: Bearer <doctor-token>
```

**Expected:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## ✅ Success Criteria

All tests should pass:
- ✅ Create staff works with valid data
- ✅ List loads and displays correctly
- ✅ Search and filters work
- ✅ Edit updates data correctly
- ✅ Delete soft-deletes (sets isActive=false)
- ✅ RBAC enforced correctly
- ✅ Tenant isolation working
- ✅ Validation errors displayed properly
- ✅ Success notifications shown
- ✅ Data refreshes after operations
- ✅ No mock data used
- ✅ All API calls include tenant headers

---

## 🐛 Common Issues & Solutions

### Issue: "No staff members" shown but staff exists
**Solution:** Check if `X-Tenant-Id` header is being sent correctly

### Issue: 403 Forbidden when creating staff
**Solution:** Verify user has correct role (SUPER_ADMIN, TENANT_ADMIN, HOSPITAL_ADMIN, or HR_MANAGER)

### Issue: Form doesn't submit
**Solution:** Check browser console for validation errors

### Issue: Staff from other tenants visible
**Solution:** Verify TenantGuard is applied to controller

### Issue: Password validation fails
**Solution:** Ensure password is at least 8 characters

---

## 📊 Performance Benchmarks

- List load time: < 500ms
- Create operation: < 1s
- Update operation: < 1s
- Delete operation: < 500ms
- Search response: < 300ms

---

## 🔍 Debugging Tips

1. **Check Browser Console:** Look for API errors
2. **Check Network Tab:** Verify requests include headers
3. **Check Backend Logs:** Look for validation errors
4. **Verify Token:** Ensure JWT token is valid and not expired
5. **Check Tenant ID:** Verify tenantId in localStorage matches user's tenant
