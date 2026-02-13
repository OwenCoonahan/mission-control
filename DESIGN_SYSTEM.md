# Design System

## Colors

### Backgrounds
```
Page:    bg-zinc-950  (#09090b)
Card:    bg-zinc-900  (#18181b)
Input:   bg-zinc-900  (#18181b)
Hover:   bg-zinc-800  (#27272a)
```

### Borders
```
Default: border-zinc-800 (#27272a)
Hover:   border-zinc-700 (#3f3f46)
Focus:   border-violet-500
```

### Text
```
Primary:   text-zinc-100 (#f4f4f5)
Secondary: text-zinc-400 (#a1a1aa)
Muted:     text-zinc-500 (#71717a)
```

### Accent Colors
```
Violet (primary): violet-400/500/600
Emerald (success/business): emerald-400/500
Amber (warning/in-progress): amber-400/500
Red (high priority): red-400/500
Blue (info): blue-400/500
Orange (body goal): orange-400/500
```

## Typography

### Font
- System font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

### Sizes
```
Page title: text-2xl font-bold
Section title: text-lg font-semibold
Card title: text-base font-medium
Body: text-sm
Small/meta: text-xs
```

## Spacing

### Padding
```
Page: p-6
Card: p-4
Section gap: space-y-6 or gap-6
Item gap: space-y-2 or gap-2
```

### Card Border Radius
```
Card: rounded-xl (12px)
Button: rounded-lg (8px)
Badge: rounded-full
```

## Components

### Card
```tsx
<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
  {children}
</div>
```

### Button (Primary)
```tsx
<button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
  {children}
</button>
```

### Button (Ghost)
```tsx
<button className="text-zinc-400 hover:text-white hover:bg-zinc-800 px-3 py-2 rounded-lg transition-colors">
  {children}
</button>
```

### Badge
```tsx
// Priority badges
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">High</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">Medium</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">Low</span>
```

### Progress Bar
```tsx
<div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
  <div className="h-full bg-violet-500 rounded-full" style={{ width: '72%' }} />
</div>
```

### Input
```tsx
<input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500" />
```

## Sidebar

Width: `w-64` (256px)
Background: `bg-zinc-950`
Border: `border-r border-zinc-800`

### Nav Item (inactive)
```tsx
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
  <Icon className="h-5 w-5" />
  <span>Label</span>
</a>
```

### Nav Item (active)
```tsx
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-violet-400 bg-violet-500/10">
  <Icon className="h-5 w-5" />
  <span>Label</span>
</a>
```

## Icons
Use lucide-react icons:
- Home, CheckSquare, Target, Brain, Zap, Calendar, Clock, Plus, Settings

## Animations
```
transition-colors: for hover states
transition-all duration-200: for transforms
```

## Responsive
- Mobile: sidebar collapses to icons or off-canvas
- Desktop: full sidebar visible
