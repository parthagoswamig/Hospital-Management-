# Staff Module - Quick Testing Guide

## 🚀 How to Test the Staff Module

### Prerequisites
1. Backend running on `http://localhost:3001` (or your configured API URL)
2. Frontend running on `http://localhost:3000`
3. User logged in with valid JWT token
4. TenantId set in localStorage

---

## 📝 Test 1: Add New Staff Member

### Steps:
1. Navigate to `/dashboard/staff`
2. Click **"Add Staff"** button (top right)
3. Fill in the form:
   ```
   First Name: John
   Last Name: Doe
   Email: john.doe@hospital.com
   Password: Password123!
   Role: Doctor
   Designation: Senior Cardiologist
   Specialization: Cardiology
   License Number: MED12345
   Qualification: MBBS, MD Cardiology
   Experience: 8 years in cardiac care
   ```
4. Click **"Add Staff"** button

### Expected Result:
- ✅ Success toast: "Staff member added successfully"
- ✅ Modal closes
- ✅ Staff list refreshes and shows new member
- ✅ Statistics update (Total Staff +1, Active Staff +1)
- ✅ New staff appears in "Active Staff" tab

### Possible Errors:
- ❌ **400 Bad Request**: Check if all required fields filled
- ❌ **401 Unauthorized**: Check JWT token in localStorage
- ❌ **403 Forbidden**: User doesn't have permission (check role)

---

## ✏️ Test 2: Edit Staff Member

### Steps:
1. On staff list, click **Edit icon** (green pencil) on any staff member
2. Modify some fields:
   ```
   Designation: Chief Cardiologist
   Specialization: Interventional Cardiology
   Experience: 10 years
   Role: Doctor (can be changed)
   ```
3. Click **"Update Staff"** button

### Expected Result:
- ✅ Success toast: "Staff member updated successfully"
- ✅ Modal closes
- ✅ Staff list refreshes with updated data
- ✅ Changes visible immediately in the list

### Possible Errors:
- ❌ **404 Not Found**: Staff member doesn't exist
- ❌ **400 Bad Request**: Validation failed (check name length)

---

## 🗑️ Test 3: Delete (Deactivate) Staff

### Steps:
1. On "Active Staff" tab, click **Delete icon** (red trash) on staff member
2. Confirm deletion in the browser alert
3. Wait for operation to complete

### Expected Result:
- ✅ Success toast: "Staff member deactivated successfully"
- ✅ Staff disappears from "Active Staff" tab
- ✅ Statistics update (Active Staff -1, Deactivated +1)
- ✅ Switch to "Deactivated" tab - staff member appears there

### Note:
- Staff is **soft deleted** (isActive: false)
- Data is NOT permanently removed
- Can be reactivated via Edit form (toggle "Active Status")

---

## 🔄 Test 4: Tab Switching

### Steps:
1. Click **"Active Staff"** tab
2. Note the staff list
3. Click **"Deactivated"** tab
4. Note the deactivated staff
5. Switch back to **"Active Staff"** tab

### Expected Result:
- ✅ Active tab shows only `isActive: true` staff
- ✅ Deactivated tab shows only `isActive: false` staff
- ✅ Data refreshes on each tab switch
- ✅ Count badges show correct numbers

---

## 🔍 Test 5: Search & Filters

### Search Test:
1. Enter a staff name in search box
2. Press Enter or click **"Search"** button
3. Verify filtered results

### Role Filter Test:
1. Select "Doctor" from Role dropdown
2. Click **"Search"**
3. Verify only doctors shown

### Clear Filters:
1. Click **"Clear"** button
2. Verify all filters reset
3. Verify all staff shown

### Expected Result:
- ✅ Search filters by name, email, employeeId
- ✅ Role filter works correctly
- ✅ Filters can be combined
- ✅ Clear button resets everything

---

## 📊 Test 6: Statistics Display

### Check Stats Cards:
1. Note the 4 stat cards at top
2. Add a new staff member
3. Verify "Total Staff" increases
4. Verify "Active Staff" increases
5. Delete a staff member
6. Verify "Active Staff" decreases
7. Verify "Deactivated" increases

### Expected Result:
- ✅ Total Staff = active + inactive
- ✅ Active Staff count matches tab badge
- ✅ Deactivated count matches tab badge
- ✅ Doctor count shows only doctors
- ✅ Stats update after every mutation

---

## ❌ Test 7: Validation Errors

### Test Invalid Email:
```
Email: notanemail
Expected: "Please enter a valid email address"
```

### Test Short Password:
```
Password: abc123
Expected: "Password must be at least 8 characters long"
```

### Test Missing Required Fields:
```
Leave firstName empty
Expected: "Please fill in all required fields"
```

### Test Short Names:
```
First Name: J
Expected: "First name must be at least 2 characters long"
```

---

## 🔐 Test 8: RBAC (Role-Based Access Control)

### Admin/HR Manager User:
- ✅ Can see "Add Staff" button
- ✅ Can edit staff
- ✅ Can delete staff

### Regular User (Doctor/Nurse):
- ❌ Should NOT see "Add Staff" button
- ❌ Should NOT see Edit/Delete icons
- ✅ CAN view staff list

### Test Method:
1. Login as admin → Verify all buttons visible
2. Login as doctor → Verify buttons hidden
3. Try direct API call as doctor → Should get 403 Forbidden

---

## 🐛 Common Issues & Solutions

### Issue: "No staff members found"
**Solution:** 
- Check if API is running
- Check browser console for errors
- Verify tenantId is set
- Try adding a new staff member

### Issue: "Failed to load staff list"
**Solution:**
- Check API URL in `.env.local`
- Verify JWT token in localStorage
- Check backend logs for errors
- Verify tenant has staff members

### Issue: 400 Bad Request on create
**Solution:**
- Check all required fields filled
- Verify email format is correct
- Ensure password is at least 8 characters
- Check browser console for validation errors

### Issue: 401 Unauthorized
**Solution:**
- Clear localStorage and login again
- Check token expiry
- Verify backend auth is working

### Issue: 403 Forbidden
**Solution:**
- User doesn't have required role
- Login with admin account
- Check user role in database

---

## 📱 API Testing with Postman/cURL

### Create Staff:
```bash
POST http://localhost:3001/staff
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  X-Tenant-Id: YOUR_TENANT_ID
  Content-Type: application/json
Body:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@hospital.com",
  "password": "SecurePass123!",
  "role": "NURSE",
  "designation": "Senior Nurse",
  "specialization": "ICU Care"
}
```

### Get Staff List:
```bash
GET http://localhost:3001/staff?status=active&page=1&limit=10
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  X-Tenant-Id: YOUR_TENANT_ID
```

### Update Staff:
```bash
PATCH http://localhost:3001/staff/{STAFF_ID}
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  X-Tenant-Id: YOUR_TENANT_ID
  Content-Type: application/json
Body:
{
  "designation": "Chief Nurse",
  "isActive": true
}
```

### Delete Staff:
```bash
DELETE http://localhost:3001/staff/{STAFF_ID}
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  X-Tenant-Id: YOUR_TENANT_ID
```

### Get Statistics:
```bash
GET http://localhost:3001/staff/stats
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  X-Tenant-Id: YOUR_TENANT_ID
```

---

## ✅ Success Criteria

All tests pass if:
- ✅ Can create staff with all required fields
- ✅ Staff appears in Active list immediately
- ✅ Can edit and see changes reflected
- ✅ Can switch between Active/Deactivated tabs
- ✅ Delete moves staff to Deactivated tab
- ✅ Statistics update in real-time
- ✅ Search and filters work correctly
- ✅ Validation catches errors
- ✅ RBAC enforces permissions
- ✅ No console errors
- ✅ All toasts appear correctly

---

## 🎯 Quick Smoke Test (5 minutes)

1. ✅ Load page - staff list appears
2. ✅ Click "Add Staff" - modal opens
3. ✅ Fill form and submit - success toast
4. ✅ New staff appears in list
5. ✅ Click Edit - form pre-fills
6. ✅ Change designation - updates successfully
7. ✅ Click Delete - staff moves to Deactivated
8. ✅ Switch tabs - data loads correctly
9. ✅ Search works - finds staff
10. ✅ Stats match actual counts

**If all 10 pass → Module is working correctly! 🎉**

---

## 📞 Support

If issues persist:
1. Check `STAFF_MODULE_FIX_SUMMARY.md` for detailed info
2. Review backend logs: `apps/api/logs/`
3. Check browser console for frontend errors
4. Verify database has proper schema
5. Ensure all migrations are run

**Happy Testing!** 🚀
