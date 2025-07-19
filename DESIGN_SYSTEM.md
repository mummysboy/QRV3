# QRewards Design System

## Overview
This document outlines the design tokens, components, and guidelines for maintaining consistent styling across all devices and components in the QRewards application.

## Design Tokens

### Colors

#### Primary Colors
- `primary-50`: #f0fdf4 (Lightest)
- `primary-100`: #dcfce7
- `primary-200`: #bbf7d0
- `primary-300`: #86efac
- `primary-400`: #4ade80
- `primary-500`: #22c55e (Base)
- `primary-600`: #16a34a (Main brand color)
- `primary-700`: #15803d
- `primary-800`: #166534
- `primary-900`: #14532d (Darkest)

#### Secondary Colors
- `secondary-50`: #f8fafc
- `secondary-100`: #f1f5f9
- `secondary-200`: #e2e8f0
- `secondary-300`: #cbd5e1
- `secondary-400`: #94a3b8
- `secondary-500`: #64748b
- `secondary-600`: #475569
- `secondary-700`: #334155
- `secondary-800`: #1e293b
- `secondary-900`: #0f172a

#### Status Colors
- `success-500`: #22c55e (Green)
- `warning-500`: #f59e0b (Yellow/Orange)
- `error-500`: #ef4444 (Red)
- `info-500`: #3b82f6 (Blue)

### Typography

#### Font Families
- **Primary**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Monospace**: `"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace`

#### Font Sizes
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)
- `text-5xl`: 3rem (48px)
- `text-6xl`: 3.75rem (60px)
- `text-7xl`: 4.5rem (72px)

#### Font Weights
- `font-light`: 300
- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700

### Spacing

#### Base Spacing Scale
- `space-1`: 0.25rem (4px)
- `space-2`: 0.5rem (8px)
- `space-3`: 0.75rem (12px)
- `space-4`: 1rem (16px)
- `space-5`: 1.25rem (20px)
- `space-6`: 1.5rem (24px)
- `space-8`: 2rem (32px)
- `space-10`: 2.5rem (40px)
- `space-12`: 3rem (48px)
- `space-16`: 4rem (64px)
- `space-20`: 5rem (80px)
- `space-24`: 6rem (96px)

### Border Radius
- `rounded-sm`: 0.25rem (4px)
- `rounded-md`: 0.375rem (6px)
- `rounded-lg`: 0.5rem (8px)
- `rounded-xl`: 0.75rem (12px)
- `rounded-2xl`: 1rem (16px)
- `rounded-3xl`: 1.5rem (24px)

### Shadows
- `shadow-sm`: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- `shadow-md`: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
- `shadow-lg`: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
- `shadow-xl`: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)

### Transitions
- `transition-fast`: 150ms ease-in-out
- `transition-normal`: 300ms ease-in-out
- `transition-slow`: 500ms ease-in-out

## Responsive Breakpoints

### Mobile First Approach
- **Default**: 0px and up
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

### Container Max Widths
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## Component Guidelines

### Buttons

#### Primary Button
```tsx
<button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-150">
  Button Text
</button>
```

#### Secondary Button
```tsx
<button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors duration-150">
  Button Text
</button>
```

#### Danger Button
```tsx
<button className="bg-error-600 hover:bg-error-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-150">
  Button Text
</button>
```

### Forms

#### Input Fields
```tsx
<input
  type="text"
  placeholder="Placeholder text"
  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150 text-gray-900 placeholder-gray-500"
/>
```

#### Textarea
```tsx
<textarea
  placeholder="Placeholder text"
  rows={4}
  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150 text-gray-900 placeholder-gray-500 resize-none"
/>
```

### Cards

#### Basic Card
```tsx
<div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
  Card Content
</div>
```

#### Interactive Card
```tsx
<div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
  Card Content
</div>
```

### Headers

#### Page Header
```tsx
<h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
  Page Title
</h1>
```

#### Section Header
```tsx
<h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
  Section Title
</h2>
```

### Navigation

#### Header Navigation
```tsx
<header className="w-full bg-primary-600 text-white shadow-md">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      Navigation Content
    </div>
  </div>
</header>
```

## Animation Guidelines

### Fade In
```tsx
<div className="animate-fade-in">
  Content
</div>
```

### Slide In
```tsx
<div className="animate-slide-in">
  Content
</div>
```

### Scale In
```tsx
<div className="animate-scale-in">
  Content
</div>
```

## Accessibility Guidelines

### Focus States
- All interactive elements must have visible focus states
- Use `focus:ring-2 focus:ring-primary-500` for consistent focus styling
- Ensure sufficient color contrast (minimum 4.5:1 for normal text)

### Screen Reader Support
- Use semantic HTML elements
- Include proper ARIA labels
- Provide alt text for images
- Use proper heading hierarchy

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Provide skip links for main content
- Test tab order is logical

## Dark Mode Support

The design system includes dark mode support through CSS custom properties. Dark mode colors are automatically applied when the user's system preference is set to dark mode.

### Dark Mode Colors
- Background: `#0a0a0a`
- Text: `#f9fafb`
- Gray scale is inverted for dark mode

## Best Practices

### 1. Use Design Tokens
Always use the predefined design tokens instead of hardcoded values:
```tsx
// ✅ Good
<div className="bg-primary-600 text-white p-4 rounded-lg">

// ❌ Bad
<div className="bg-green-600 text-white p-4 rounded">
```

### 2. Responsive Design
Use mobile-first responsive classes:
```tsx
// ✅ Good
<div className="text-lg md:text-xl lg:text-2xl">

// ❌ Bad
<div className="text-2xl lg:text-xl md:text-lg">
```

### 3. Consistent Spacing
Use the spacing scale consistently:
```tsx
// ✅ Good
<div className="p-4 md:p-6 lg:p-8">

// ❌ Bad
<div className="p-4 md:p-8 lg:p-12">
```

### 4. Semantic Colors
Use semantic color names for status and meaning:
```tsx
// ✅ Good
<div className="text-success-600">Success message</div>
<div className="text-error-600">Error message</div>

// ❌ Bad
<div className="text-green-600">Success message</div>
<div className="text-red-600">Error message</div>
```

### 5. Consistent Transitions
Use predefined transition durations:
```tsx
// ✅ Good
<div className="transition-colors duration-150">

// ❌ Bad
<div className="transition-all duration-300">
```

## Implementation Checklist

When creating or updating components, ensure:

- [ ] Uses design system colors
- [ ] Implements responsive design
- [ ] Includes proper focus states
- [ ] Has consistent spacing
- [ ] Uses semantic HTML
- [ ] Includes proper ARIA labels
- [ ] Tests on multiple screen sizes
- [ ] Follows accessibility guidelines
- [ ] Uses consistent typography
- [ ] Implements smooth transitions

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/) 