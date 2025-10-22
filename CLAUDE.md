# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

MME Holding warehouse and factory management system for Windows POS touchscreen devices (1920x1080). Built with React 19, Vite, HashRouter, Zustand, Tailwind CSS. Supports multiple roles: Warehouse and Factory Manager.

## Commands

```bash
npm run dev                    # Dev server (http://0.0.0.0:5173)
npm run build                  # Production build → dist/
npm run electron:dev           # Electron dev mode (hot reload)
npm run electron:build         # Build NSIS installer for Windows
```

## Tech Stack

- **State**: Zustand with localStorage persistence (`authStore`, `languageStore`)
- **API**: Axios with custom `mme:{token}` auth header (base: `https://dastur.mme-holding.uz`)
- **Routing**: **HashRouter** (required for Electron `file://` protocol)
- **Styling**: Tailwind CSS v4 (no aggressive CSS resets!)
- **i18n**: Custom `useTranslation()` hook (uz/ru)
- **Electron**: CommonJS (`.cjs` files) with `package.json` `"type": "module"`

## Critical Rules

### 🚨 Electron Requirements

**MUST USE:**
- `HashRouter` (NOT BrowserRouter) - Electron uses `file://` protocol
- `.cjs` extension for Electron files (`electron/main.cjs`, `electron/preload.cjs`)
- `base: './'` in `vite.config.js` for relative asset paths

**WHY:**
- BrowserRouter needs web server → doesn't work with `file://`
- Package.json has `"type": "module"` but Electron needs CommonJS
- Absolute paths fail in Electron production builds

### 📱 Touch-First Design

This runs on **POS touchscreen kiosks (1920x1080)** - no physical keyboard/mouse.

**RULES:**
- ❌ NO `hover:` states (don't work on touch)
- ✅ USE `active:` states (`active:scale-[0.98]`, `active:border-blue-500`)
- ✅ Permanent shadows (`shadow-md` always, not just on hover)
- ✅ Large touch targets (minimum 56px height = `h-14`)
- ✅ Compact headers (`py-3` not `py-6`, `text-2xl` not `text-3xl`)

**Example:**
```jsx
<button className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md
  active:scale-[0.98] active:border-blue-500 transition-all">
  {content}
</button>
```

### ⌨️ On-Screen Keyboards

**ALL inputs MUST use on-screen keyboards** (no physical keyboards on kiosks).

**Implementation:**
```jsx
import { useKeyboard } from '../context/KeyboardContext';

const { showKeyboard } = useKeyboard();

<input
  type="text"
  value={value}
  readOnly  // Prevents native keyboard
  onFocus={(e) => {
    e.target.blur();
    showKeyboard('text', value, setValue, () => {});  // or 'number', 'decimal'
  }}
  onClick={() => showKeyboard('text', value, setValue, () => {})}
  className="cursor-pointer"
/>
```

**Types:**
- `text` - Full QWERTY (EN/UZ/RU)
- `number` - Integer only (0-9)
- `decimal` - Decimals allowed (0-9 + .)

### 🎨 Styling Standards

**Spacing (optimized for 1920x1080):**
- Headers: `px-8 py-3` (compact)
- Titles: `text-2xl` (not larger)
- Avatars: `w-14 h-14`
- Buttons: `h-14` (56px minimum)
- Cards: `p-6`, `gap-6`

**Colors:**
- Borders: `border-gray-200`
- Active/focus: `border-blue-500`
- Shadows: `shadow-md` (always visible)
- Backgrounds: `bg-gray-50` (page), `bg-white` (cards)

**⚠️ NO CSS ZOOM!** - Causes overflow issues. Use proper spacing instead.

### 🔐 Authentication

**Flow:**
1. Phone input (format: `998901234567` without `+`)
2. `POST /login/phone` → OTP sent
3. User enters OTP
4. `POST /login/code` → Returns `{token, userID, userRole, selected_language}`
5. All requests include `Authorization: mme:{token}` header (NOT Bearer!)

**Role Codes:**
- `"2"` = WAREHOUSE
- `"6"` = FACTORY_MANAGER

**Role Routing:** `OTPVerify.jsx` redirects based on role:
```javascript
if (response.userRole === 'FACTORY_MANAGER') {
  navigate('/factory-manager/home');
} else {
  navigate('/home');
}
```

### 🏭 Multi-Role Architecture

**Warehouse Role:**
- Homepage, Inventory (types → products), Supplying (role → employee → project → products)

**Factory Manager Role:**
- Orders management (accepted/pending)
- Dress management (list → details → edit/delete)
- Idea management (completed ideas → approve/reject)
- Reports (ViewReport, DressesList, IdeasList)

**Key Pattern:** All navigation, API services, and translations are role-aware.

## Common Patterns

**Making API calls:**
```javascript
import api from '../services/api';
const response = await api.get('/endpoint');
const response = await api.post('/endpoint', data);
```

**Translations:**
```javascript
import { useTranslation } from '../hooks/useTranslation';
const t = useTranslation();
return <button>{t.save}</button>;
```

**Auth state:**
```javascript
import useAuthStore from '../store/authStore';
const { isAuthenticated, user, token, logout } = useAuthStore();
```

**Image URLs:**
```javascript
import { getImageUrl } from '../services/api';
<img src={getImageUrl(dress.dress_image)} />
```

## Critical Issues Solved

### Issue #1: White/Blank Screen in Electron
**Cause:** Using BrowserRouter (needs web server)
**Solution:** Use `HashRouter` for Electron `file://` protocol compatibility

### Issue #2: Module System Errors
**Cause:** Package.json has `"type": "module"` but Electron needs CommonJS
**Solution:** Use `.cjs` extension for all Electron files

### Issue #3: Asset Loading Failures
**Cause:** Vite default `base: '/'` creates absolute paths
**Solution:** Set `base: './'` in `vite.config.js` for relative paths

### Issue #4: Tailwind Utilities Not Working
**Cause:** Aggressive CSS reset with `* { margin: 0; padding: 0; }`
**Solution:** Remove universal reset, rely on Tailwind's preflight normalization

### Issue #5: Author Dropdown Not Saving
**Cause:** Using `/dress/authors` API (no IDs) instead of `/employee/all?role=DESIGNER`
**Solution:** Use `/employee/all?role=DESIGNER` and track by `employee.id`, not name

## Development Workflow

**Header Template (for new pages):**
```jsx
<div className="sticky top-0 z-10 bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
    <h1 className="text-2xl font-semibold text-gray-900">{t.pageTitle}</h1>
    <button onClick={() => navigate('/profile')}
      className="w-14 h-14 rounded-full bg-gray-900
        flex items-center justify-center text-2xl">
      👤
    </button>
  </div>
</div>
```

**Testing Checklist:**
- [ ] Test on actual POS hardware (1920x1080 touchscreen)
- [ ] Login screen fits without scrolling
- [ ] All inputs have on-screen keyboards
- [ ] Touch interactions work (active states)
- [ ] Both roles route correctly
- [ ] API connectivity verified

**Debugging Pattern:**
Use emoji prefixes for easy log scanning:
```javascript
console.log('📋 Selected Role:', role);
console.log('👥 Employees:', data);
console.log('📁 Projects:', projects);
console.log('✅ Success:', result);
console.error('❌ Error:', error);
```

## Electron Build & Deployment

**Build NSIS Installer (Recommended):**
```bash
npm run electron:build
```
- Output: `release/MME Warehouse Setup 1.0.0.exe` (~78 MB)
- Works cross-platform (macOS → Windows)
- Standard Windows installation wizard
- Creates shortcuts automatically

**Alternative Formats:**
- `npm run electron:build:7z` - 7z archive (extract before use)
- `npm run electron:build:portable` - Portable EXE (may be blocked by SmartScreen)

**Deployment Steps:**
1. Build installer: `npm run electron:build`
2. Copy `.exe` from `release/` folder
3. Transfer to POS system
4. Run installer → Next → Install → Launch

**Troubleshooting:**
- White screen → Check HashRouter is used (not BrowserRouter)
- Won't open → Use 7z archive instead of portable EXE
- SmartScreen warning → Click "More info" → "Run anyway" (unsigned app)
- See `TROUBLESHOOTING.md` for complete guide

## Key API Endpoints

**Authentication:**
- `POST /login/phone` - Send OTP
- `POST /login/code` - Verify OTP

**Warehouse:**
- `GET /product/types` - Product categories
- `GET /product/all?typeId={}` - Products by type
- `POST /supply/create` - Create supply

**Factory Manager:**
- `GET /order/all?accepted=true/false` - Orders by status
- `GET /dress/all` - All dresses
- `GET /dress/{id}` - Dress details
- `PUT /dress/update` - Update dress (needs `dress_author` + `dress_author_id`)
- `GET /employee/all?role=DESIGNER` - Get designers (for author dropdown)
- `GET /designer/completed/ideas` - Completed ideas
- `PATCH /designer/transfer/to/dress` - Approve/reject idea

**Note:** All authenticated requests require `Authorization: mme:{token}` header.

## Key Takeaways

1. **Always use HashRouter** - BrowserRouter doesn't work in Electron
2. **No hover states** - Touch-only interface, use `active:` instead
3. **All inputs need keyboards** - On-screen keyboard system is mandatory
4. **Electron files must be .cjs** - When package.json has `"type": "module"`
5. **Check iOS app implementation** - When API behavior differs from expectations
6. **Compact UI for POS** - Smaller spacing/fonts than typical web apps
7. **Role-aware everything** - Navigation, APIs, translations all depend on user role
8. **Test on actual hardware** - Desktop browser ≠ touchscreen kiosk

---

**Reference Files:**
- Complete API docs: `api.md`, `api2.md`, `api3.md`
- Electron setup: `ELECTRON_README.md`
- Debugging: `TROUBLESHOOTING.md`
