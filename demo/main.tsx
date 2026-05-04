import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CssGrid, CssGridProvider } from '../src'
import { mediaRenderer } from './renderer'
import { breakPointConfig } from '../src/components/CssGrid/CssGrid'

// Inject global base styles
const globalStyle = document.createElement('style')
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; color: #0f172a; }
  h1, h2, h3 { margin: 0; }
  p { margin: 0; }
`
document.head.prepend(globalStyle)

const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function useBreakpoint() {
  const [bp, setBp] = useState('xs')
  useEffect(() => {
    const map = [
      { name: 'xl', mq: matchMedia('(min-width: 1280px)') },
      { name: 'lg', mq: matchMedia('(min-width: 1024px) and (max-width: 1279px)') },
      { name: 'md', mq: matchMedia('(min-width: 768px) and (max-width: 1023px)') },
      { name: 'sm', mq: matchMedia('(min-width: 640px) and (max-width: 767px)') },
      { name: 'xs', mq: matchMedia('(max-width: 639px)') },
    ]
    const update = () => {
      for (const { name, mq } of map) {
        if (mq.matches) { setBp(name); return }
      }
    }
    update()
    map.forEach(({ mq }) => mq.addEventListener('change', update))
    return () => map.forEach(({ mq }) => mq.removeEventListener('change', update))
  }, [])
  return bp
}

// ── Shared components ──────────────────────────────────────────────────────────

function Area({
  name,
  bg = '#334155',
  height,
  children,
}: {
  name: string
  bg?: string
  height?: string
  children?: React.ReactNode
}) {
  return (
    <div
      style={{
        background: bg,
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '6px',
        minHeight: height ?? '56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '4px',
      }}
    >
      <span style={{ fontSize: '11px', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
        {name}
      </span>
      {children && <span style={{ fontSize: '13px', fontWeight: 500, opacity: 0.9 }}>{children}</span>}
    </div>
  )
}

function DemoSection({ title, description, breakpointNote, children }: {
  title: string
  description: string
  breakpointNote?: string
  children: React.ReactNode
}) {
  return (
    <section style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '4px' }}>{title}</h2>
      <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: breakpointNote ? '2px' : '16px' }}>
        {description}
      </p>
      {breakpointNote && (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '16px', fontStyle: 'italic' }}>
          {breakpointNote}
        </p>
      )}
      {children}
    </section>
  )
}

// ── Demo 1: Classic Page Layout ────────────────────────────────────────────────

function PageLayoutDemo() {
  return (
    <CssGrid
      layout={[
        ['header', 'header'],
        ['sidebar', 'main'],
        ['footer', 'footer'],
      ]}
      columns={['220px', '1fr']}
      rows={['56px', '1fr', '78px']}
      containerStyle={{ minHeight: '320px', gap: '8px' }}
      childstyle={{ borderRadius: '6px' }}
      childs={{
        header: <Area name="header" bg="#4f46e5">Site Header</Area>,
        sidebar: <Area name="sidebar" bg="#0891b2" height="100%">Sidebar Nav</Area>,
        main: <Area name="main" bg="#1e40af" height="100%">Main Content</Area>,
        footer: <Area name="footer" bg="#475569">Footer</Area>,
      }}
      xs={breakPointConfig({
        layout: [
          ["header"],
          ["main"],
          ["footer"]
        ],
        columns: ['1fr'],
        rows: ['56px', '1fr', '78px'],
        containerStyle: { gap: '8px', background: "red" },
        childstyle: { border: 'solid 2px black' },
      })}
    />
  )
}

// ── Demo 2: Dashboard Layout ───────────────────────────────────────────────────

function DashboardDemo() {
  return (
    <CssGrid
      layout={[
        ['topbar', 'topbar', 'topbar'],
        ['stat1',  'stat2',  'stat3'],
        ['chart',  'chart',  'feed'],
      ]}
      columns={['1fr', '1fr', '280px']}
      rows={['56px', '88px', '220px']}
      containerStyle={{ gap: '10px' }}
      childstyle={{ borderRadius: '6px' }}
      childs={{
        topbar: <Area name="topbar" bg="#1e293b">Dashboard</Area>,
        stat1: <Area name="stat1" bg="#059669" height="100%">Revenue<span style={{ fontSize: '20px', fontWeight: 700 }}>$48,200</span></Area>,
        stat2: <Area name="stat2" bg="#d97706" height="100%">Orders<span style={{ fontSize: '20px', fontWeight: 700 }}>1,340</span></Area>,
        stat3: <Area name="stat3" bg="#dc2626" height="100%">Churn<span style={{ fontSize: '20px', fontWeight: 700 }}>2.4%</span></Area>,
        chart: <Area name="chart" bg="#7c3aed" height="100%">Revenue Chart</Area>,
        feed: <Area name="feed" bg="#be185d" height="100%">Activity Feed</Area>,
      }}
    />
  )
}

// ── Demo 3: App Shell ──────────────────────────────────────────────────────────

function AppShellDemo() {
  return (
    <CssGrid
      layout={[
        ['topnav',  'topnav',  'topnav'],
        ['sidenav', 'content', 'aside'],
      ]}
      columns={['200px', '1fr', '260px']}
      rows={['56px', '1fr']}
      containerStyle={{ minHeight: '360px', gap: '8px' }}
      childstyle={{ borderRadius: '6px' }}
      childs={{
        topnav:  <Area name="topnav"  bg="#0f172a">App Navigation</Area>,
        sidenav: <Area name="sidenav" bg="#1e3a5f" height="100%">Side Menu</Area>,
        content: <Area name="content" bg="#1e293b" height="100%">Workspace</Area>,
        aside:   <Area name="aside"   bg="#312e81" height="100%">Properties Panel</Area>,
      }}
    />
  )
}

// ── Demo 4: Landing Page ───────────────────────────────────────────────────────

function LandingPageDemo() {
  return (
    <CssGrid
      layout={[
        ['hero',  'hero',  'hero'],
        ['feat1', 'feat2', 'feat3'],
        ['cta',   'cta',   'cta'],
      ]}
      columns={['1fr', '1fr', '1fr']}
      rows={['160px', '120px', '64px']}
      containerStyle={{ gap: '10px' }}
      childstyle={{ borderRadius: '6px' }}
      childs={{
        hero:  <Area name="hero"  bg="#1d4ed8" height="100%">Hero Section</Area>,
        feat1: <Area name="feat1" bg="#065f46" height="100%">Feature 1</Area>,
        feat2: <Area name="feat2" bg="#7c2d12" height="100%">Feature 2</Area>,
        feat3: <Area name="feat3" bg="#3730a3" height="100%">Feature 3</Area>,
        cta:   <Area name="cta"   bg="#9f1239" height="100%">Call to Action</Area>,
      }}
    />
  )
}

// ── Demo 5: Magazine Layout ────────────────────────────────────────────────────

function MagazineDemo() {
  return (
    <CssGrid
      layout={[
        ['lead',    'lead',    'sidebar'],
        ['article', 'related', 'sidebar'],
      ]}
      columns={['1fr', '260px', '200px']}
      rows={['220px', '1fr']}
      containerStyle={{ minHeight: '420px', gap: '10px' }}
      childstyle={{ borderRadius: '6px' }}
      childs={{
        lead:    <Area name="lead"    bg="#0c4a6e" height="100%">Lead Story</Area>,
        article: <Area name="article" bg="#1a3a1a" height="100%">Article Body</Area>,
        related: <Area name="related" bg="#2d1b4e" height="100%">Related Articles</Area>,
        sidebar: <Area name="sidebar" bg="#7c2d12" height="100%">Sidebar</Area>,
      }}
    />
  )
}

// ── App ────────────────────────────────────────────────────────────────────────

const BP_COLORS: Record<string, string> = {
  xs: '#6b7280',
  sm: '#2563eb',
  md: '#7c3aed',
  lg: '#059669',
  xl: '#d97706',
}

function App() {
  const bp = useBreakpoint()

  return (
    <CssGridProvider value={{ render: mediaRenderer, breakpoints }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: '8px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            CSS Grid Responsive Demos
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Resize the window to see layouts adapt across breakpoints.
          </p>
        </div>

        {/* Breakpoint indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Active breakpoint:</span>
          {Object.entries(BP_COLORS).map(([name, color]) => (
            <span
              key={name}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: '999px',
                background: bp === name ? color : 'transparent',
                color: bp === name ? '#fff' : '#94a3b8',
                border: `1.5px solid ${bp === name ? color : '#e2e8f0'}`,
                transition: 'all 0.15s',
              }}
            >
              {name}
            </span>
          ))}
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            ({breakpoints[bp as keyof typeof breakpoints] ? `≥ ${breakpoints[bp as keyof typeof breakpoints]}` : '< 480px'})
          </span>
        </div>

        {/* Demos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <DemoSection
            title="Classic Page Layout"
            description="Header, sidebar, main content, and footer. Single column on mobile, two-column on md+."
            breakpointNote="md (768px): sidebar appears left · lg (1024px): wider sidebar"
          >
            <PageLayoutDemo />
          </DemoSection>

          <DemoSection
            title="Dashboard Layout"
            description="Stats row with chart and activity feed. Stacks vertically on small screens."
            breakpointNote="sm (640px): 3-column stats + chart/feed row · lg (1024px): wider feed panel"
          >
            <DashboardDemo />
          </DemoSection>

          <DemoSection
            title="App Shell"
            description="Full-application layout with navigation bar, sidebar, workspace, and properties panel."
            breakpointNote="Mobile: stacked navigation · lg (1024px): three-column shell with top bar"
          >
            <AppShellDemo />
          </DemoSection>

          <DemoSection
            title="Landing Page"
            description="Marketing page with full-width hero, feature columns, and call-to-action."
            breakpointNote="md (768px): hero + 3-column features + full-width CTA · xl (1280px): taller sections"
          >
            <LandingPageDemo />
          </DemoSection>

          <DemoSection
            title="Magazine Layout"
            description="Editorial layout with a lead story, article body, sidebar, and related content."
            breakpointNote="sm (640px): lead + article/sidebar · lg (1024px): three-column with tall sidebar"
          >
            <MagazineDemo />
          </DemoSection>

        </div>

        {/* Footer note */}
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '32px', marginBottom: '8px' }}>
          @icodar/css-grid — responsive layouts via CSS Grid template areas
        </p>
      </div>
    </CssGridProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
