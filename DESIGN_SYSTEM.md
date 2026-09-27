# DESIGN_SYSTEM.md — Visual Design System

**Version:** 1.0

**Last Updated:** 2026-09-24

**Project:** ZP School ERP

---

## 1. Design Philosophy

ZP School ERP is used by school principals, teachers, and students in Zilla Parishad schools — including rural environments with limited digital literacy. The visual design must be:

- **Professional** — It must look like real institutional software
- **Calm and trustworthy** — Education software should not feel aggressive or loud
- **Highly readable** — Text clarity is critical
- **Consistent** — Every screen should feel like it belongs to the same product
- **Simple to use** — Complex architecture hidden behind a simple interface
- **Mobile-friendly** — Teachers may use smartphones for attendance

### What to Avoid

- Excessive gradients or rainbow color schemes
- Neon or highly saturated accent colors
- Glassmorphism used as decoration (use it sparingly and purposefully)
- Massive decorative illustrations
- Visually noisy dashboards with too many widgets
- Random animations that don't serve UX
- Template-like generic admin dashboard layouts
- Inconsistent component styling across pages

---

## 2. Color System

### 2.1 Brand Palette

The primary brand color is a deep, trustworthy blue — conveying authority, education, and calm.

```css
/* Primary — Deep Institutional Blue */
--color-primary-50:  #EFF6FF;
--color-primary-100: #DBEAFE;
--color-primary-200: #BFDBFE;
--color-primary-300: #93C5FD;
--color-primary-400: #60A5FA;
--color-primary-500: #3B82F6;
--color-primary-600: #2563EB;   /* Primary action color */
--color-primary-700: #1D4ED8;   /* Primary hover */
--color-primary-800: #1E40AF;
--color-primary-900: #1E3A8A;   /* Dark brand */
--color-primary-950: #172554;
```

### 2.2 Neutral Palette (Primary text and backgrounds)

```css
--color-neutral-0:   #FFFFFF;
--color-neutral-50:  #F8FAFC;
--color-neutral-100: #F1F5F9;
--color-neutral-200: #E2E8F0;
--color-neutral-300: #CBD5E1;
--color-neutral-400: #94A3B8;
--color-neutral-500: #64748B;
--color-neutral-600: #475569;
--color-neutral-700: #334155;
--color-neutral-800: #1E293B;
--color-neutral-900: #0F172A;
```

### 2.3 Semantic Colors

```css
/* Success */
--color-success-50:  #F0FDF4;
--color-success-100: #DCFCE7;
--color-success-500: #22C55E;
--color-success-600: #16A34A;
--color-success-700: #15803D;

/* Warning */
--color-warning-50:  #FFFBEB;
--color-warning-100: #FEF3C7;
--color-warning-500: #F59E0B;
--color-warning-600: #D97706;
--color-warning-700: #B45309;

/* Danger */
--color-danger-50:   #FFF1F2;
--color-danger-100:  #FFE4E6;
--color-danger-500:  #EF4444;
--color-danger-600:  #DC2626;
--color-danger-700:  #B91C1C;

/* Info */
--color-info-50:     #EFF6FF;
--color-info-500:    #3B82F6;
--color-info-600:    #2563EB;
```

### 2.4 Application Background System

```css
/* Page backgrounds */
--bg-page:           var(--color-neutral-50);    /* Main page background */
--bg-surface:        var(--color-neutral-0);      /* Cards, panels */
--bg-surface-raised: var(--color-neutral-0);      /* Modals, dropdowns */
--bg-sidebar:        var(--color-neutral-900);    /* Sidebar */
--bg-sidebar-hover:  var(--color-neutral-800);
--bg-header:         var(--color-neutral-0);
```

---

## 3. Typography

### 3.1 Font Families

```css
/* Load from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

--font-family-base:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-family-mono:    'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### 3.2 Type Scale

```css
--text-xs:   0.75rem;    /* 12px */
--text-sm:   0.875rem;   /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg:   1.125rem;   /* 18px */
--text-xl:   1.25rem;    /* 20px */
--text-2xl:  1.5rem;     /* 24px */
--text-3xl:  1.875rem;   /* 30px */
--text-4xl:  2.25rem;    /* 36px */
```

### 3.3 Font Weights

```css
--font-light:    300;
--font-regular:  400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

### 3.4 Line Heights

```css
--leading-tight:  1.25;
--leading-snug:   1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### 3.5 Typographic Hierarchy

| Element | Size | Weight | Color |
|---|---|---|---|
| Page Title (h1) | 2xl (24px) | semibold | neutral-900 |
| Section Title (h2) | xl (20px) | semibold | neutral-800 |
| Card Title (h3) | lg (18px) | medium | neutral-800 |
| Subsection (h4) | base (16px) | medium | neutral-700 |
| Body | base (16px) | regular | neutral-700 |
| Secondary text | sm (14px) | regular | neutral-500 |
| Caption / Label | xs (12px) | medium | neutral-500 |

---

## 4. Spacing System

```css
--space-0:   0;
--space-1:   0.25rem;   /* 4px */
--space-2:   0.5rem;    /* 8px */
--space-3:   0.75rem;   /* 12px */
--space-4:   1rem;      /* 16px */
--space-5:   1.25rem;   /* 20px */
--space-6:   1.5rem;    /* 24px */
--space-8:   2rem;      /* 32px */
--space-10:  2.5rem;    /* 40px */
--space-12:  3rem;      /* 48px */
--space-16:  4rem;      /* 64px */
--space-20:  5rem;      /* 80px */
--space-24:  6rem;      /* 96px */
```

---

## 5. Border Radius

```css
--radius-sm:   0.25rem;  /* 4px — small elements */
--radius-md:   0.375rem; /* 6px — inputs, small cards */
--radius-lg:   0.5rem;   /* 8px — cards, panels */
--radius-xl:   0.75rem;  /* 12px — large cards */
--radius-2xl:  1rem;     /* 16px — modals */
--radius-full: 9999px;   /* Pills, avatars */
```

---

## 6. Shadows

```css
--shadow-xs:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.10);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10);
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.10);
```

---

## 7. Layout

### 7.1 Application Shell

```
┌──────────────────────────────────────────────────────────────┐
│                    Top Header (64px)                         │
├─────────────┬────────────────────────────────────────────────┤
│   Sidebar   │                                                │
│   (240px    │            Main Content Area                   │
│   desktop)  │                                                │
│             │                                                │
│  Collapses  │                                                │
│  on mobile  │                                                │
└─────────────┴────────────────────────────────────────────────┘
```

### 7.2 Breakpoints

```css
--bp-sm:  640px;
--bp-md:  768px;
--bp-lg:  1024px;
--bp-xl:  1280px;
--bp-2xl: 1536px;
```

### 7.3 Content Maximum Width

```css
--content-max:       1280px;
--content-max-narrow: 768px;  /* Forms, single-column content */
```

### 7.4 Sidebar Dimensions

```css
--sidebar-width:           240px;
--sidebar-width-collapsed: 64px;   /* Icon-only mode */
```

---

## 8. Component Specifications

### 8.1 Buttons

Four variants: `primary`, `secondary`, `ghost`, `danger`

Three sizes: `sm`, `md`, `lg`

```css
/* Primary Button */
.btn-primary {
  background: var(--color-primary-600);
  color: #fff;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: background 150ms ease;
}
.btn-primary:hover  { background: var(--color-primary-700); }
.btn-primary:active { background: var(--color-primary-800); }

/* Secondary Button */
.btn-secondary {
  background: var(--color-neutral-0);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-200);
}
.btn-secondary:hover { background: var(--color-neutral-50); }

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--color-primary-600);
}
.btn-ghost:hover { background: var(--color-primary-50); }

/* Danger Button */
.btn-danger {
  background: var(--color-danger-600);
  color: #fff;
}
.btn-danger:hover { background: var(--color-danger-700); }
```

Button sizes:
```css
.btn-sm  { padding: 6px 12px;  font-size: var(--text-sm); }
.btn-md  { padding: 8px 16px;  font-size: var(--text-sm); }
.btn-lg  { padding: 10px 20px; font-size: var(--text-base); }
```

### 8.2 Inputs

```css
.input {
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  background: var(--color-neutral-0);
  color: var(--color-neutral-900);
  font-size: var(--text-sm);
  padding: 8px 12px;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}
.input.error {
  border-color: var(--color-danger-500);
}
```

### 8.3 Cards

```css
.card {
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}
```

### 8.4 Badges / Status Pills

```css
/* Usage: attendance status, student status, notice status */
.badge { padding: 2px 8px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--font-medium); }
.badge-success { background: var(--color-success-50); color: var(--color-success-700); }
.badge-warning { background: var(--color-warning-50); color: var(--color-warning-700); }
.badge-danger  { background: var(--color-danger-50);  color: var(--color-danger-700);  }
.badge-info    { background: var(--color-primary-50); color: var(--color-primary-700); }
.badge-neutral { background: var(--color-neutral-100); color: var(--color-neutral-700); }
```

### 8.5 Data Tables

```css
.table-container { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
.table th { background: var(--color-neutral-50); color: var(--color-neutral-600); font-weight: var(--font-medium); text-transform: uppercase; letter-spacing: 0.05em; font-size: var(--text-xs); padding: 10px 16px; border-bottom: 1px solid var(--color-neutral-200); text-align: left; }
.table td { padding: 12px 16px; border-bottom: 1px solid var(--color-neutral-100); color: var(--color-neutral-800); }
.table tr:last-child td { border-bottom: none; }
.table tr:hover td { background: var(--color-neutral-50); }
```

### 8.6 Sidebar

```css
.sidebar { background: var(--color-neutral-900); width: var(--sidebar-width); color: var(--color-neutral-300); }
.sidebar-item { padding: 8px 12px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 12px; font-size: var(--text-sm); font-weight: var(--font-medium); transition: background 150ms; }
.sidebar-item:hover { background: var(--bg-sidebar-hover); color: var(--color-neutral-0); }
.sidebar-item.active { background: var(--color-primary-600); color: var(--color-neutral-0); }
```

### 8.7 Modals

```css
.modal-overlay { position: fixed; inset: 0; background: rgb(0 0 0 / 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--color-neutral-0); border-radius: var(--radius-2xl); padding: var(--space-6); width: min(560px, 90vw); box-shadow: var(--shadow-xl); }
```

---

## 9. States

### 9.1 Loading State

Use skeleton screens, not spinners, for main content areas.

```
[████████████     ]  ← Skeleton bar, animated shimmer
```

For buttons and small actions, use an inline spinner.

### 9.2 Empty State

```
[icon]
No students have been added yet.
[Add First Student]  ← CTA button
```

- Use a simple, neutral icon (not decorative illustrations)
- Provide a helpful message
- Provide a CTA if the user can take action

### 9.3 Error State

```
[⚠ icon]
Unable to load students.
Please try again.
[Try Again]  ← retry button
```

### 9.4 Success / Toast

Toasts appear at top-right. Auto-dismiss after 4 seconds.

- Success: green left border
- Error: red left border
- Warning: yellow left border
- Info: blue left border

---

## 10. Iconography

Use **Lucide React** for all icons. It is a clean, consistent, lightweight icon set that suits the professional aesthetic.

- Do not mix icon libraries
- Icon size: 16px inline, 20px standard, 24px feature icons
- Icons must have accessible `aria-label` or be paired with visible text

---

## 11. Motion & Animation

Animations must be purposeful, not decorative.

```css
/* Standard transition */
--transition-fast:   150ms ease;
--transition-base:   200ms ease;
--transition-slow:   300ms ease;
```

Use transitions for:
- Button hover/active states
- Sidebar collapse/expand
- Modal open/close (fade + slight scale)
- Toast slide-in
- Tab switching (content fade)

Do NOT animate:
- Table rows on scroll
- Card appearances on page load (avoid gratuitous entrance animations)
- Background elements

---

## 12. School Branding Areas

The school logo appears in:
- Sidebar header (within the dark sidebar — use a contained region)
- TC PDF header
- Report PDF header
- School profile page header

The school logo must NOT override the global CSS or layout of any shared UI element.
Logo display is contained within designated branded regions only.

---

## 13. Responsive Behavior

### Desktop (≥ 1024px)
- Full sidebar visible (240px)
- Main content occupies remaining width
- Data tables visible in full
- Cards in multi-column grid

### Tablet (768px – 1023px)
- Sidebar collapses to icon-only (64px)
- Cards stack or go to 2-column
- Tables scroll horizontally

### Mobile (< 768px)
- Sidebar becomes bottom nav or slide-over drawer
- Single-column layout
- Touch-friendly tap targets (minimum 44px)
- Tables scroll horizontally or stack as data lists

---

## 14. Accessibility

- Color contrast ratio ≥ 4.5:1 for body text (WCAG AA)
- All interactive elements keyboard-accessible
- Focus rings visible (do not remove `outline` without a custom replacement)
- Form inputs have associated labels
- Images have `alt` text
- ARIA roles where semantic HTML is insufficient

---

## 15. What Requires Design Approval

The following changes require updating this document and user approval:

- Adding a new color outside the defined palette
- Changing the primary brand color
- Adding a new animation type
- Changing typography base settings
- Introducing a new layout pattern not documented here

---

*This document is the source of truth for visual design. Do not introduce styles not defined here without updating this document.*
