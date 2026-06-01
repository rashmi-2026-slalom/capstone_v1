# UI Guidelines - Grocery Price Comparison Tracker

## Design Philosophy
- **Clean & Simple**: Minimize clutter, focus on the data
- **Easy to Scan**: Use clear visual hierarchy and spacing
- **Action-Oriented**: Make it easy to add items and prices quickly
- **Mobile-Friendly**: Responsive design that works on all devices

## Color Palette

### Primary Colors
- **Primary Blue**: `#2563eb` - For primary buttons and links
- **Dark Blue**: `#1e40af` - For hover states
- **Light Blue**: `#dbeafe` - For backgrounds and highlights

### Semantic Colors (Price Indicators)
- **Success Green**: `#22c55e` - Best/lowest price indicator
- **Warning Yellow**: `#eab308` - Mid-range price indicator
- **Danger Red**: `#ef4444` - Highest price indicator
- **Info Blue**: `#3b82f6` - Informational messages

### Neutral Colors
- **White**: `#ffffff` - Main background
- **Light Gray**: `#f3f4f6` - Secondary backgrounds, card backgrounds
- **Medium Gray**: `#6b7280` - Secondary text, borders
- **Dark Gray**: `#1f2937` - Primary text
- **Border Gray**: `#e5e7eb` - Borders and dividers

## Typography

### Font Family
- **Primary**: System fonts for performance and readability
  ```css
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  ```

### Font Sizes
- **Heading 1**: `32px` / `2rem` - Page titles
- **Heading 2**: `24px` / `1.5rem` - Section headers
- **Heading 3**: `20px` / `1.25rem` - Card titles
- **Body**: `16px` / `1rem` - Regular text
- **Small**: `14px` / `0.875rem` - Secondary information
- **Extra Small**: `12px` / `0.75rem` - Labels, hints

### Font Weights
- **Bold**: `700` - Headings, emphasis
- **Semi-bold**: `600` - Subheadings, labels
- **Regular**: `400` - Body text

## Spacing

### Spacing Scale (using 4px base unit)
- **xs**: `4px` - Tight spacing
- **sm**: `8px` - Compact spacing
- **md**: `16px` - Default spacing
- **lg**: `24px` - Generous spacing
- **xl**: `32px` - Large spacing
- **2xl**: `48px` - Extra large spacing

### Layout Spacing
- **Page padding**: `24px` (desktop), `16px` (mobile)
- **Section spacing**: `32px` between major sections
- **Card padding**: `16px` - `24px`
- **Form field spacing**: `16px` between fields

## Components

### Buttons

#### Primary Button
- Background: Primary Blue (`#2563eb`)
- Text: White
- Padding: `12px 24px`
- Border radius: `6px`
- Hover: Dark Blue (`#1e40af`)
- Font weight: Semi-bold (600)

#### Secondary Button
- Background: White
- Text: Primary Blue
- Border: `1px solid #e5e7eb`
- Padding: `12px 24px`
- Border radius: `6px`
- Hover: Light Gray background (`#f3f4f6`)

#### Danger Button
- Background: Danger Red (`#ef4444`)
- Text: White
- Padding: `12px 24px`
- Border radius: `6px`

### Forms

#### Input Fields
- Border: `1px solid #e5e7eb`
- Border radius: `6px`
- Padding: `10px 12px`
- Font size: `16px` (body)
- Focus border: Primary Blue (`#2563eb`)
- Background: White
- Placeholder color: Medium Gray (`#6b7280`)

#### Labels
- Font size: `14px` (small)
- Font weight: Semi-bold (600)
- Color: Dark Gray (`#1f2937`)
- Margin bottom: `6px`

#### Select Dropdowns
- Same styling as input fields
- Add down arrow icon on right

### Cards

#### Standard Card
- Background: White
- Border: `1px solid #e5e7eb`
- Border radius: `8px`
- Padding: `20px`
- Box shadow: `0 1px 3px rgba(0, 0, 0, 0.1)`
- Hover: Subtle shadow increase

#### Price Card
- Include color-coded left border (4px width) for price indicators:
  - Green for best price
  - Yellow for mid-range
  - Red for highest price

### Tables

#### Price Comparison Table
- Header background: Light Gray (`#f3f4f6`)
- Header text: Dark Gray, bold
- Border: `1px solid #e5e7eb`
- Row hover: Light Blue background (`#dbeafe`)
- Cell padding: `12px`
- Alternating row background: White / Very Light Gray (`#f9fafb`)

### Price Indicators

#### Best Price Badge
- Background: Success Green (`#22c55e`) with 20% opacity
- Text: Dark green
- Border: `1px solid #22c55e`
- Padding: `4px 8px`
- Border radius: `4px`
- Font size: Small (14px)
- Font weight: Semi-bold

#### Price Trend Icons
- ↓ Down arrow: Green (price decreased)
- ↑ Up arrow: Red (price increased)
- → Right arrow: Gray (no change)

## Layout Structure

### Main Layout
- Max width: `1200px` (desktop)
- Centered on page
- Full width on mobile (with padding)

### Grid System
- Use CSS Grid or Flexbox for layouts
- Responsive breakpoints:
  - Mobile: `< 640px`
  - Tablet: `640px - 1024px`
  - Desktop: `> 1024px`

### Navigation
- Fixed header on mobile
- Sticky on desktop
- Height: `64px`
- Background: White with bottom border
- Box shadow: `0 1px 3px rgba(0, 0, 0, 0.1)`

## Responsive Design

### Mobile (< 640px)
- Single column layout
- Stack cards vertically
- Full-width buttons
- Larger touch targets (min 44px height)
- Reduce padding/spacing by 25%

### Tablet (640px - 1024px)
- Two-column layout where appropriate
- Maintain comfortable touch targets

### Desktop (> 1024px)
- Multi-column layouts
- Hover states visible
- More generous spacing

## Icons
- Use simple, consistent icon set (Font Awesome, Heroicons, or Material Icons)
- Icon size: `20px` for inline, `24px` for buttons
- Color: Inherit from parent or use Medium Gray

## Accessibility

### Contrast Ratios
- Maintain WCAG AA standards (minimum 4.5:1 for normal text)
- All text colors meet contrast requirements

### Interactive Elements
- Focus states: `2px solid` Primary Blue outline with `2px` offset
- Keyboard navigation support
- Screen reader friendly labels

### Touch Targets
- Minimum size: `44px x 44px` for mobile
- Adequate spacing between interactive elements

## Animation & Transitions
- Subtle transitions for better UX
- Duration: `150ms - 300ms`
- Easing: `ease-in-out`
- Examples:
  - Button hover: `transition: background-color 200ms ease-in-out`
  - Modal entry: `transition: opacity 200ms ease-in-out`

## Error States
- Error text color: Danger Red (`#ef4444`)
- Error border: Danger Red (`#ef4444`)
- Display error messages below form fields
- Use clear, helpful error messages

## Loading States
- Spinner: Primary Blue
- Skeleton loaders for data tables
- Disable buttons during submission with loading indicator

## Empty States
- Center aligned
- Gray icon
- Helpful message
- Call-to-action button to add first item
