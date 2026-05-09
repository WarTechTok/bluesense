# Complete Redesign: Admin/Receptionist Booking Form (Now Like Booking.jsx)

## Overview
Replaced the simple manual booking form in admin and receptionist dashboards with a **multi-step booking form** that matches the home page Booking.jsx flow.

---

## Files Created

### 1. **AdminBookingForm.jsx** (NEW)
**Path**: `frontend/src/pages/admin/AdminBookingForm.jsx`

A complete multi-step booking form component with 4 steps:

#### Step 1: Customer Information
- Customer name, contact number, email
- Location (Oasis) selector
- Package selector (dynamically fetched from API based on oasis)

#### Step 2: Booking Details
- Reservation date picker
- Session selector (only shows available sessions for selected package)
- Number of guests
- Special requests (optional)

#### Step 3: Payment Information
- **Live price calculation** (base price + extra guest charges)
- Payment method selector (GCash, Maya, GoTyme, SeaBank, **Cash**)
- Payment status selector (Pending, Partial, Paid, Rejected)
- Booking status selector (Pending, Confirmed, Cancelled)
- Down payment auto-calculated

#### Step 4: Review
- Display all entered information
- Summary of pricing breakdown
- Confirm and create/update booking

**Key Features**:
✅ Dynamic package loading from API (same source as home page)
✅ Session selector populated only with available sessions for package
✅ Real-time price calculation with extra guest charges
✅ Step indicator showing progress
✅ Form validation at each step
✅ Support for both creating new and editing existing bookings
✅ **Cash payment method included** (admin/receptionist only)

### 2. **AdminBookingForm.css** (NEW)
**Path**: `frontend/src/pages/admin/AdminBookingForm.css`

Complete styling for the multi-step form:
- Step indicator with progress visualization
- Form field styling matching the admin theme
- Price summary display
- Review section styling
- Responsive design for mobile

---

## Files Modified

### 1. **BookingManagement.jsx**
**Path**: `frontend/src/pages/admin/BookingManagement.jsx`

**Changes**:
- ❌ Removed: Simple manual form with text inputs
- ❌ Removed: Manual form state (formData, packages, loadingPackages)
- ❌ Removed: fetchPackagesForOasis function (no longer needed)
- ❌ Removed: handleSubmit function (moved to AdminBookingForm)
- ✅ Added: AdminBookingForm import
- ✅ Added: showBookingForm state (replaces isModalOpen)
- ✅ Added: handleBookingCreated callback function
- ✅ Updated: handleOpenModal (simplified)
- ✅ Updated: Modal rendering to use new AdminBookingForm component

**Result**: Bookings list view with new "Add Booking" button that opens multi-step form

### 2. **BookingManagement.css**
**Path**: `frontend/src/pages/admin/BookingManagement.css`

**Changes**:
- ✅ Added: Modal overlay styles (.modal-overlay)
- ✅ Added: Modal container styles (.modal-container)

---

## Data Flow

```
Admin/Receptionist clicks "Add Booking"
    ↓
AdminBookingForm opens in modal
    ↓
Step 1: Select Oasis
    ↓
Packages automatically fetched from API (/api/admin/packages/public)
    ↓
Step 1: Select Package + Customer Info
    ↓
Step 2: Select Date + Session + Guests
    ↓
Prices auto-calculated from package data
    ↓
Step 3: Select Payment Method (includes Cash) + Payment Status
    ↓
Step 4: Review all details
    ↓
Submit to backend via adminApi.createBooking() or updateBooking()
    ↓
Success modal + refresh bookings list
```

---

## Component Relationships

```
BookingManagement (list view)
├── Renders: AdminBookingForm (in modal when showBookingForm = true)
│   ├── Fetches: fetchAllPackages() from constants/packages.js
│   ├── Uses: getPriceFromPackage() from config/packageData.js
│   ├── Uses: getExtraGuestCharge() from config/packageData.js
│   ├── Uses: getDownpaymentAmount() from config/packageData.js
│   └── Calls: adminApi.createBooking() or updateBooking()
├── ConfirmationModal
└── PaymentVerificationModal
```

---

## Payment Methods

**Available in Admin/Receptionist**:
- GCash
- Maya
- GoTyme
- SeaBank
- **Cash** ✅ NEW

**Note**: Cash payment method is only available in admin/receptionist booking form, NOT in home page customer booking.

---

## Pricing & Capacity Handling

1. **Package Data** comes from API
   - Each package has `maxCapacity`, `minCapacity`
   - Capacity displayed as "Package Name (min-max pax)"

2. **Session-based Pricing**
   - Day/Night/22hrs each have different prices
   - Weekday/Weekend pricing variations

3. **Extra Guest Charges**
   - ₱150 per guest over maxCapacity
   - Automatically calculated and shown in Step 3

4. **Downpayment**
   - Auto-calculated based on session type
   - Can be overridden if needed

---

## User Experience

### Before
❌ Simple form with all fields on one view
❌ Package entered as free text (prone to typos)
❌ No validation feedback
❌ Manual price entry required
❌ No review step

### After
✅ Guided 4-step process
✅ Package selected from dynamic dropdown
✅ Validation at each step with error messages
✅ Automatic price calculation
✅ Review step before submission
✅ Step indicator shows progress
✅ Matches home page booking experience

---

## Used By

1. **Admin Dashboard** (`/admin/bookings`)
   - Add/edit bookings manually
   - Full access to all payment methods including Cash
   - Can set payment status and booking status

2. **Receptionist Dashboard** (`/receptionist/bookings`)
   - Same form and functionality
   - Uses same AdminBookingForm component
   - Full access to all payment methods including Cash

---

## Testing Checklist

- [ ] Click "Add Booking" opens multi-step form
- [ ] Oasis selection triggers package fetch
- [ ] Packages display with capacity info
- [ ] Session selector shows only available sessions
- [ ] Price calculation updates automatically
- [ ] Extra guest charges calculated correctly
- [ ] Downpayment auto-calculated based on session
- [ ] Cash payment method appears in dropdown
- [ ] Form validation works at each step
- [ ] Review page shows correct summary
- [ ] Booking created/updated successfully
- [ ] Bookings list refreshes after submission
- [ ] Edit booking pre-fills all fields correctly
- [ ] Works on mobile view
