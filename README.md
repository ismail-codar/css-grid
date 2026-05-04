# @icodar/css-grid

Type-safe CSS Grid layout component for React with responsive breakpoint support via grid template areas.

## Installation

```bash
npm install @icodar/css-grid
# or
yarn add @icodar/css-grid
```

**Peer dependencies:** `react >= 18`, `react-dom >= 18`

## Quick start

```tsx
import { CssGrid } from '@icodar/css-grid'

function PageLayout() {
  return (
    <CssGrid
      layout={[
        ['header', 'header'],
        ['sidebar', 'main'],
        ['footer', 'footer'],
      ]}
      columns={['220px', '1fr']}
      rows={['56px', '1fr', '48px']}
      containerStyle={{ gap: '8px', minHeight: '100vh' }}
      childs={{
        header: <Header />,
        sidebar: <Sidebar />,
        main: <Main />,
        footer: <Footer />,
      }}
    />
  )
}
```

TypeScript infers valid area names from `layout` — `childs` keys are type-checked automatically.

## Responsive layouts

Pass breakpoint configs (`xs`, `sm`, `md`, `lg`, `xl`) to override layout, columns, rows, and styles at each viewport width.

```tsx
<CssGrid
  layout={[
    ['topbar', 'topbar', 'topbar'],
    ['stat1',  'stat2',  'stat3'],
    ['chart',  'chart',  'feed'],
  ]}
  columns={['1fr', '1fr', '280px']}
  rows={['56px', '88px', '220px']}
  containerStyle={{ gap: '10px' }}
  childs={{ topbar, stat1, stat2, stat3, chart, feed }}

  xs={{
    layout: [['topbar'], ['stat1'], ['stat2'], ['stat3'], ['chart'], ['feed']],
    columns: ['1fr'],
    rows: ['56px', '88px', '88px', '88px', '200px', '200px'],
  }}
  md={{
    layout: [
      ['topbar', 'topbar'],
      ['stat1',  'stat2'],
      ['stat3',  'stat3'],
      ['chart',  'feed'],
    ],
    columns: ['1fr', '1fr'],
    rows: ['56px', '88px', '88px', '200px'],
  }}
/>
```

Breakpoint layouts must use only area names defined in the base `layout` — enforced at the type level.

### Default breakpoints

| Key  | Min width |
|------|-----------|
| `xs` | 480px     |
| `sm` | 640px     |
| `md` | 768px     |
| `lg` | 1024px    |
| `xl` | 1280px    |

## Props

### `CssGrid`

| Prop             | Type                          | Description                                      |
|------------------|-------------------------------|--------------------------------------------------|
| `layout`         | `string[][]`                  | Grid template areas (2D array of area names)     |
| `columns`        | `string[]`                    | `grid-template-columns` values per column        |
| `rows`           | `string[]`                    | `grid-template-rows` values per row              |
| `containerStyle` | `CssGridStyle`                | Extra styles on the grid container               |
| `childstyle`     | `CssGridStyle`                | Styles applied to every grid child               |
| `childStyles`    | `{ [area]: CssGridStyle }`    | Per-area child styles                            |
| `childs`         | `{ [area]: ReactNode }`       | Content for each named area (required)           |
| `className`      | `string`                      | Class name on the container element              |
| `xs/sm/md/lg/xl` | `CssGridResponsiveConfig`     | Breakpoint overrides (same shape as above)       |

### `CssGridResponsiveConfig`

Each breakpoint config accepts `layout`, `rows`, `columns`, `containerStyle`, `childstyle`, and `childStyles`.

## Customization via `CssGridProvider`

Override breakpoints and/or the renderer globally.

```tsx
import { CssGridProvider } from '@icodar/css-grid'

const breakpoints = {
  sm: '600px',
  lg: '1100px',
}

function App() {
  return (
    <CssGridProvider value={{ breakpoints }}>
      {/* all CssGrid components inherit these breakpoints */}
    </CssGridProvider>
  )
}
```

### Custom renderer

The default renderer outputs plain `<div>` elements with inline styles. Provide a custom renderer to inject CSS classes, support media queries, or use a different element type.

```tsx
import type { CssGridRenderer } from '@icodar/css-grid'

const myRenderer: CssGridRenderer = ({ element, className, style, children, key }) => {
  return (
    <div key={key} className={className} style={style as React.CSSProperties}>
      {children}
    </div>
  )
}

<CssGridProvider value={{ render: myRenderer, breakpoints }}>
  ...
</CssGridProvider>
```

`CssGridRenderOptions` fields:

| Field       | Type            | Value                   |
|-------------|-----------------|-------------------------|
| `element`   | `string`        | `"container"` or `"child"` |
| `className` | `string?`       | Passed from the `className` prop |
| `style`     | `CssGridStyle?` | Computed inline styles  |
| `children`  | `ReactNode?`    | Child content           |
| `key`       | `ReactKey?`     | Area name for child elements |

## Utilities

```ts
import {
  createGridTemplateAreas,
  createContainerStyle,
} from '@icodar/css-grid'

// "header header" / "sidebar main"
createGridTemplateAreas([['header', 'header'], ['sidebar', 'main']])

// { gridTemplateAreas, gridTemplateRows, gridTemplateColumns, ...containerStyle }
createContainerStyle({ layout, rows, columns, containerStyle })
```

## Building

```bash
npm run build        # library (dist/)
npm run build:demo   # demo app
npm run dev          # development server with demo
npm run typecheck    # TypeScript checks
```

## License

MIT
