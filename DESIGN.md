# Food Biosciences Design System

**Based on:** shadcn/ui + Tremor + Recharts best practices  
**Last Updated:** 2026-07-29

---

## Color System

### Base Colors (HSL)

**Light Mode:**
```css
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--primary: 204 100% 41%        /* #0075CF */
--muted: 210 40% 96.1%
--border: 214.3 31.8% 91.4%
```

**Dark Mode:**
```css
--background: 211 24% 22%      /* #2D3A47 */
--foreground: 210 40% 98%
--primary: 203 100% 80%        /* #9AD3FF */
--muted: 211 24% 28%
--border: 211 20% 44%
```

### Chart Palette (8 colors)

**Light Mode:**
```javascript
[
  'hsl(204 100% 41%)',  // Blue #0075CF
  'hsl(142 71% 45%)',   // Green
  'hsl(38 92% 50%)',    // Orange
  'hsl(262 83% 58%)',   // Purple
  'hsl(340 82% 52%)',   // Pink
  'hsl(180 100% 35%)',  // Teal
  'hsl(25 95% 53%)',    // Red-Orange
  'hsl(220 70% 50%)',   // Indigo
]
```

**Dark Mode:**
```javascript
[
  'hsl(203 100% 80%)',  // Light Blue #9AD3FF
  'hsl(142 76% 56%)',   // Light Green
  'hsl(38 92% 60%)',    // Light Orange
  'hsl(262 83% 70%)',   // Light Purple
  'hsl(340 82% 65%)',   // Light Pink
  'hsl(180 70% 50%)',   // Light Teal
  'hsl(25 95% 65%)',    // Light Red-Orange
  'hsl(220 70% 65%)',   // Light Indigo
]
```

---

## Typography

```css
/* Headings */
.text-h1 { font-size: 2.25rem; font-weight: 800; }
.text-h2 { font-size: 1.875rem; font-weight: 600; }
.text-h3 { font-size: 1.5rem; font-weight: 600; }
.text-h4 { font-size: 1.25rem; font-weight: 600; }

/* Body */
.text-base { font-size: 1rem; line-height: 1.75; }
.text-small { font-size: 0.875rem; font-weight: 500; }
.text-muted { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }

/* Chart Labels */
.chart-label { font-size: 0.75rem; font-weight: 500; }
.chart-value { font-size: 0.875rem; font-weight: 600; }
```

---

## Spacing Scale

```
xs:  0.25rem  (4px)
sm:  0.5rem   (8px)
md:  1rem     (16px)
lg:  1.5rem   (24px)
xl:  2rem     (32px)
2xl: 3rem     (48px)
```

**Card Padding:** 1.5rem (24px)  
**Chart Margins:** { top: 20, right: 30, left: 0, bottom: 5 }  
**Grid Gap:** 1rem (16px)

---

## Chart Specifications

### Card Layout
```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Chart Title</h3>
    <p className="card-description">Optional description</p>
  </div>
  <div className="card-content">
    <ResponsiveContainer width="100%" height={300}>
      {/* Chart */}
    </ResponsiveContainer>
  </div>
</div>
```

### Bar Charts
- **Height:** 300px
- **Bar Radius:** [4, 4, 0, 0]
- **Bar Size:** 32px max
- **Grid:** Horizontal only, strokeDasharray="3 3"

### Pie/Donut Charts
- **Height:** 300px
- **Inner Radius (Donut):** 60%
- **Outer Radius:** 100px
- **Padding Angle:** 2
- **Label:** Outside, offsetRadius={10}

### Line Charts
- **Height:** 300px
- **Stroke Width:** 2px
- **Dot Radius:** 4px
- **Grid:** Both axes, strokeDasharray="3 3"

### Tooltips
```tsx
<Tooltip
  contentStyle={{
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
  }}
  labelStyle={{
    color: 'hsl(var(--foreground))',
    fontWeight: 600,
    marginBottom: '4px',
  }}
  itemStyle={{
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.875rem',
  }}
/>
```

---

## Component Patterns

### Stat Card
```tsx
<div className="card">
  <div className="card-header p-6 pb-3">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">Label</p>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
  </div>
  <div className="card-content p-6 pt-0">
    <div className="text-2xl font-bold">1,234</div>
    <p className="text-xs text-muted-foreground">+12% from last month</p>
  </div>
</div>
```

### Collapsible Section
```tsx
<Collapsible>
  <CollapsibleTrigger className="flex w-full items-center justify-between">
    <h3>Section Title</h3>
    <ChevronDown className="h-4 w-4" />
  </CollapsibleTrigger>
  <CollapsibleContent>
    {/* Content */}
  </CollapsibleContent>
</Collapsible>
```

---

## Responsive Breakpoints

```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Wide screens */
```

**Dashboard Grid:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 5 columns (stats), 2 columns (charts)

---

## Animation

```css
/* Transitions */
transition: all 0.2s ease;

/* Hover states */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Chart animations */
animationDuration: 800ms
animationEasing: "ease-in-out"
```

---

## Accessibility

- **Focus rings:** 2px solid hsl(var(--ring))
- **Contrast ratio:** Minimum 4.5:1 for text
- **Touch targets:** Minimum 44x44px
- **ARIA labels:** All interactive elements
- **Keyboard navigation:** Tab order, Enter/Space to activate

---

## Empty States

```tsx
<div className="flex h-[300px] items-center justify-center">
  <div className="text-center">
    <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
    <p className="mt-2 text-sm text-muted-foreground">No data available</p>
  </div>
</div>
```

---

## Loading States

```tsx
<div className="flex h-[300px] items-center justify-center">
  <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
</div>
```

---

## Data Formatting

```typescript
// Numbers: 1,234
(n: number) => n.toLocaleString('en-US')

// Percentages: 45.2%
(n: number) => `${n.toFixed(1)}%`

// Compact: 1.2K, 3.4M
(n: number) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toString()
}
```
