# 🧪 Testing Guide - Mobile Responsive Features

## Quick Testing Checklist

### 1. Saved Services Filter Test

#### Steps:
1. **Admin Panel**:
   - Login as admin
   - Go to service management
   - Block or reject a service
   - Note the service name

2. **User Panel**:
   - Login as user who saved that service
   - Go to "Saved Services"
   - **Expected**: Blocked/rejected service should NOT appear
   - **Verify**: Only active, approved services visible

#### Test Cases:
```
✅ Service with status='blocked' → Hidden
✅ Service with status='rejected' → Hidden
✅ Service with isApproved=false → Hidden
✅ Service with status='approved' → Visible
✅ Service with no status issues → Visible
```

---

### 2. Dashboard Mobile Responsiveness Test

#### Desktop (≥ 992px):
```
✅ Sidebar always visible on left
✅ No hamburger menu button
✅ Content area takes remaining space
✅ All menu items accessible
```

#### Mobile (< 992px):
```
✅ Hamburger button visible (top-left, ☰)
✅ Sidebar hidden by default
✅ Click hamburger → Sidebar slides in
✅ Backdrop appears behind sidebar
✅ Click backdrop → Sidebar closes
✅ Select menu item → Sidebar auto-closes
✅ Content takes full width
```

#### Testing Steps:
1. Open Dashboard
2. Resize browser to < 992px
3. Click hamburger (☰) button
4. Verify sidebar slides in from left
5. Click outside sidebar (backdrop)
6. Verify sidebar closes
7. Open sidebar again
8. Click any menu item
9. Verify sidebar closes automatically

---

### 3. Account Settings Mobile Test

#### Desktop View (≥ 992px):
```
✅ Avatar: 100x100px
✅ Banner: 100px height
✅ Buttons: Full text ("Edit Profile", "Change Password")
✅ Info grid: 2 columns side-by-side
✅ Modal: 520px width
```

#### Mobile View (< 768px):
```
✅ Avatar: 80x80px
✅ Banner: 80px height
✅ Buttons: Short text ("Edit", "Password", "Delete")
✅ Info grid: Single column stacked
✅ Modal: 95% width
✅ All text readable (no overflow)
```

#### Testing Steps:
1. Open Account Settings
2. Check avatar size
3. Check button text
4. Verify info cards layout
5. Click "Edit Profile"
6. Check modal width
7. Verify form fields fit properly
8. Test on different screen sizes:
   - 375px (iPhone SE)
   - 390px (iPhone 12)
   - 768px (iPad)

---

### 4. Saved Service Cards Mobile Test

#### Desktop (≥ 992px):
```
✅ 3 cards per row (col-lg-4)
✅ Full padding (p-4)
✅ All slots visible
```

#### Tablet (768px - 991px):
```
✅ 2 cards per row (col-md-6)
✅ Medium padding (p-md-4)
```

#### Mobile (< 768px):
```
✅ 1 card per row (col-12)
✅ Compact padding (p-3)
✅ Only 3 slots shown + "+X more"
✅ Badges instead of list items
✅ Scrollable slot container
✅ Readable font sizes
```

#### Testing Steps:
1. Go to Saved Services
2. Resize browser:
   - 1200px → 3 columns
   - 900px → 2 columns
   - 600px → 1 column
3. Verify card layout adjusts
4. Check slot display (max 3 on mobile)
5. Verify badges are readable
6. Test scroll on slot container

---

### 5. Navbar Mobile Menu Test

#### Desktop (≥ 992px):
```
✅ Horizontal menu bar
✅ All links visible
✅ Dropdown for user menu
✅ No hamburger button
```

#### Mobile (< 992px):
```
✅ Hamburger button visible (☰)
✅ Menu hidden by default
✅ Click hamburger → Menu slides from right
✅ Menu width: 75vw (max 320px)
✅ Scrollable if many items
✅ Touch-friendly spacing (12px padding)
✅ Visual separators between items
✅ Close button (✖) at top
```

#### Testing Steps:
1. Open home page or dashboard
2. Resize to mobile (< 992px)
3. Click hamburger (☰)
4. Verify menu slides in from right
5. Check menu items spacing
6. Verify scrolling works (if many items)
7. Click close (✖) button
8. Verify menu closes
9. Test on different widths:
   - 375px → 85vw menu
   - 768px → 75vw menu (max 320px)

---

## Browser Testing Matrix

### Desktop Browsers
| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Test |
| Firefox | Latest | ✅ Test |
| Edge | Latest | ✅ Test |
| Safari | Latest | ✅ Test |

### Mobile Browsers
| Browser | Device | Status |
|---------|--------|--------|
| Chrome Mobile | Android | ✅ Test |
| Safari Mobile | iOS | ✅ Test |
| Firefox Mobile | Android | ✅ Test |
| Samsung Internet | Android | ✅ Test |

---

## Device Testing Matrix

### Mobile Devices (Portrait)
| Device | Width | Test Status |
|--------|-------|-------------|
| iPhone SE | 375px | ✅ Priority |
| iPhone 12/13 | 390px | ✅ Priority |
| iPhone 12 Pro Max | 428px | ✅ Test |
| Samsung Galaxy S20 | 360px | ✅ Test |
| Pixel 5 | 393px | ✅ Test |

### Tablets (Portrait)
| Device | Width | Test Status |
|--------|-------|-------------|
| iPad Mini | 768px | ✅ Test |
| iPad | 810px | ✅ Test |
| iPad Pro | 1024px | ✅ Test |

### Tablets (Landscape)
| Device | Width | Test Status |
|--------|-------|-------------|
| iPad Mini | 1024px | ✅ Test |
| iPad | 1080px | ✅ Test |
| iPad Pro | 1366px | ✅ Test |

---

## Chrome DevTools Testing

### Setup:
1. Open Chrome
2. Press `F12` (DevTools)
3. Press `Ctrl+Shift+M` (Device Toolbar)
4. Select device from dropdown

### Recommended Test Devices:
```
1. iPhone SE (375x667) - Smallest modern phone
2. iPhone 12 Pro (390x844) - Common size
3. iPad (768x1024) - Tablet portrait
4. iPad Pro (1024x1366) - Large tablet
5. Responsive (drag to resize) - Custom sizes
```

### Testing Workflow:
```
For each device:
1. Test Dashboard
   - Open/close sidebar
   - Navigate sections
   - Check layout

2. Test Account Settings
   - View profile
   - Edit profile
   - Change password

3. Test Saved Services
   - View cards
   - Check layout
   - Verify filtering

4. Test Navbar
   - Open menu
   - Navigate links
   - Close menu

5. Test Orientation
   - Portrait mode
   - Landscape mode
```

---

## Automated Testing Commands

### Build Test:
```bash
cd frontend/clsp
npm run build
```
**Expected**: Build successful with warnings only (no errors)

### Lint Test:
```bash
npm run lint
```
**Expected**: Same warnings as before (no new issues)

### Start Dev Server:
```bash
npm start
```
**Expected**: App runs on http://localhost:3000

---

## Visual Regression Testing

### Screenshots to Capture:

#### Dashboard:
- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] Mobile with sidebar open

#### Account Settings:
- [ ] Desktop profile view
- [ ] Mobile profile view
- [ ] Desktop edit modal
- [ ] Mobile edit modal

#### Saved Services:
- [ ] Desktop 3-column layout
- [ ] Tablet 2-column layout
- [ ] Mobile 1-column layout

#### Navbar:
- [ ] Desktop horizontal menu
- [ ] Mobile closed state
- [ ] Mobile open state

---

## Performance Testing

### Metrics to Check:

#### Load Time:
```
✅ First Contentful Paint < 1.5s
✅ Largest Contentful Paint < 2.5s
✅ Time to Interactive < 3.5s
```

#### Mobile Performance:
```
✅ Lighthouse Mobile Score > 90
✅ No layout shifts (CLS < 0.1)
✅ Smooth animations (60fps)
```

#### Network:
```
✅ Test on 3G throttling
✅ Test on 4G throttling
✅ Test offline behavior
```

---

## Accessibility Testing

### Keyboard Navigation:
```
✅ Tab through all interactive elements
✅ Enter/Space to activate buttons
✅ Escape to close modals/menus
✅ Arrow keys for navigation (if applicable)
```

### Screen Reader:
```
✅ All images have alt text
✅ Buttons have descriptive labels
✅ Form fields have labels
✅ Headings in logical order
```

### Touch Targets:
```
✅ Minimum 44x44px (Apple guidelines)
✅ Adequate spacing between targets
✅ No overlapping touch areas
```

---

## Bug Reporting Template

If you find any issues, report using this format:

```markdown
### Bug Title
Brief description of the issue

**Device**: iPhone 12 Pro (390x844)
**Browser**: Chrome Mobile 120
**Page**: Dashboard

**Steps to Reproduce**:
1. Open dashboard
2. Click hamburger menu
3. Select "Account Settings"

**Expected Behavior**:
Sidebar should close and navigate to account settings

**Actual Behavior**:
Sidebar stays open after navigation

**Screenshot**: [Attach if possible]

**Priority**: High/Medium/Low
```

---

## Success Criteria

### All Tests Pass When:
```
✅ No console errors
✅ All features work on mobile
✅ Layouts don't break at any width
✅ Text is readable (no overflow)
✅ Buttons are touchable (44px min)
✅ Animations are smooth
✅ No horizontal scroll
✅ Images load properly
✅ Forms are usable
✅ Navigation works correctly
```

---

## Quick Test Script

Run this checklist in 5 minutes:

```
1. Desktop (1920px):
   ✅ Dashboard sidebar visible
   ✅ Account settings 2-column
   ✅ Saved services 3-column

2. Tablet (768px):
   ✅ Dashboard hamburger works
   ✅ Account settings 2-column
   ✅ Saved services 2-column

3. Mobile (375px):
   ✅ Dashboard hamburger works
   ✅ Account settings 1-column
   ✅ Saved services 1-column
   ✅ Navbar menu works
   ✅ No horizontal scroll

4. Functionality:
   ✅ Saved services filter works
   ✅ All buttons clickable
   ✅ Forms submittable
   ✅ Navigation works
```

---

**Testing Status**: Ready for QA  
**Estimated Testing Time**: 30-45 minutes  
**Priority**: High (Mobile responsiveness is critical)
