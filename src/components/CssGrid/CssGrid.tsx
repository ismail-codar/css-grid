import type React from "react"
import { useEffect, useMemo, useState } from "react"
import type { SafeFixedArray } from "../../typings/type-utils"
import { useCssGridContext, type CssGridStyle } from "./CssGridContext"
import { createContainerStyle } from "./css-grid-responsive"

// Union of all area names in the layout
type LayoutNames<TLayout extends readonly (readonly string[])[]> = TLayout[number][number]

type AnyLayout = readonly (readonly string[])[]

// Layout shape constrained to a given set of area names. Breakpoint layouts use
// this so their cell values must be a subset of the parent layout's names.
type LayoutOf<TNames extends string> = readonly (readonly TNames[])[]

export type CssGridResponsiveConfig<
  TLayout extends AnyLayout = AnyLayout,
  TStyle extends CssGridStyle = CssGridStyle,
> = Partial<{
  layout: TLayout
  rows: SafeFixedArray<string, TLayout["length"]>
  columns: SafeFixedArray<string, TLayout[0]["length"]>
  containerStyle: TStyle
  childstyle: TStyle
  childStyles: { [key in LayoutNames<TLayout>]?: TStyle }
}>

export type CssGridBreakpointProps<
  TLayout extends AnyLayout = AnyLayout,
  TXs extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  TSm extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  TMd extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  TLg extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  TXl extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  TStyle extends CssGridStyle = CssGridStyle,
> = {
  xs?: CssGridResponsiveConfig<TXs, TStyle>
  sm?: CssGridResponsiveConfig<TSm, TStyle>
  md?: CssGridResponsiveConfig<TMd, TStyle>
  lg?: CssGridResponsiveConfig<TLg, TStyle>
  xl?: CssGridResponsiveConfig<TXl, TStyle>
}

export type CssGridProps<
  TLayout extends AnyLayout = AnyLayout,
  TXs extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  TSm extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  TMd extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  TLg extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  TXl extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  TStyle extends CssGridStyle = CssGridStyle,
> = CssGridResponsiveConfig<TLayout, TStyle> &
  CssGridBreakpointProps<TLayout, TXs, TSm, TMd, TLg, TXl, TStyle> & {
    className?: string
    childs: { [key in LayoutNames<TLayout>]: React.ReactNode }
  }

const getActiveBreakpoint = (
  breakpointEntries: readonly (readonly [string, string])[],
): string | undefined => {
  if (typeof window === "undefined" || breakpointEntries.length === 0) {
    return undefined
  }

  if (breakpointEntries.length === 1) {
    return window.matchMedia(`(min-width: ${breakpointEntries[0][1]})`).matches
      ? breakpointEntries[0][0]
      : undefined
  }

  for (let index = 0; index < breakpointEntries.length - 1; index += 1) {
    const nextBreakpoint = breakpointEntries[index + 1]
    if (!window.matchMedia(`(min-width: ${nextBreakpoint[1]})`).matches) {
      return breakpointEntries[index][0]
    }
  }

  return breakpointEntries[breakpointEntries.length - 1][0]
}

const useActiveBreakpoint = (
  breakpointEntries: readonly (readonly [string, string])[],
) => {
  const [activeBreakpoint, setActiveBreakpoint] = useState(() =>
    getActiveBreakpoint(breakpointEntries),
  )

  useEffect(() => {
    if (typeof window === "undefined") return

    const updateActiveBreakpoint = () => {
      setActiveBreakpoint(getActiveBreakpoint(breakpointEntries))
    }

    updateActiveBreakpoint()
    window.addEventListener("resize", updateActiveBreakpoint)

    return () => {
      window.removeEventListener("resize", updateActiveBreakpoint)
    }
  }, [breakpointEntries])

  return activeBreakpoint
}

const getUniqueLayoutNames = (
  layout?: readonly (readonly string[])[],
): Set<string> | undefined => {
  if (!layout) return undefined

  return new Set(layout.flat())
}

// `const` modifier (TS 5.0+) on every layout-shaped generic preserves literal
// tuple types from inline JSX values, so each breakpoint config gets its own
// dimension-aware intellisense without a wrapping helper function.
export const CssGrid = <
  const TLayout extends AnyLayout,
  const TXs extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  const TSm extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  const TMd extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  const TLg extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  const TXl extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>,
  TStyle extends CssGridStyle = CssGridStyle,
>(
  props: CssGridProps<TLayout, TXs, TSm, TMd, TLg, TXl, TStyle>,
) => {
  const { render, breakpoints } = useCssGridContext()

  const breakpointKeys = useMemo(
    () => Object.keys(breakpoints),
    [breakpoints],
  )

  const breakpointEntries = useMemo(
    () => Object.entries(breakpoints),
    [breakpoints],
  )

  const activeBreakpoint = useActiveBreakpoint(breakpointEntries)

  type BpConfig = CssGridResponsiveConfig<AnyLayout, TStyle>

  const responsiveConfigs = useMemo(() => {
    const result: Partial<Record<string, BpConfig>> = {}
    breakpointKeys.forEach((breakpoint) => {
      const config = (props as Record<string, unknown>)[breakpoint]
      if (config) {
        result[breakpoint] = config as BpConfig
      }
    })
    return result
  }, [breakpointKeys, props])

  const activeConfig = activeBreakpoint
    ? responsiveConfigs[activeBreakpoint]
    : undefined

  const activeLayoutNames = useMemo(
    () =>
      getUniqueLayoutNames(
        (activeConfig?.layout ?? props.layout) as
        | readonly (readonly string[])[]
        | undefined,
      ),
    [activeConfig?.layout, props.layout],
  )

  const keys = useMemo(() => {
    const childKeys = Object.keys(props.childs) as LayoutNames<TLayout>[]
    if (!activeLayoutNames) return childKeys

    return childKeys.filter((key) => activeLayoutNames.has(key))
  }, [activeLayoutNames, props.childs])

  const containerStyle = useMemo(() => {
    const baseStyle = createContainerStyle({
      layout: props.layout as readonly (readonly string[])[] | undefined,
      rows: props.rows as readonly string[] | undefined,
      columns: props.columns as readonly string[] | undefined,
      containerStyle: props.containerStyle,
    })

    const breakpointStyle = activeConfig
      ? createContainerStyle({
        layout: activeConfig.layout as readonly (readonly string[])[] | undefined,
        rows: activeConfig.rows as readonly string[] | undefined,
        columns: activeConfig.columns as readonly string[] | undefined,
        containerStyle: activeConfig.containerStyle,
      })
      : {}

    return { display: "grid", ...baseStyle, ...breakpointStyle }
  }, [
    props.layout,
    props.rows,
    props.columns,
    props.containerStyle,
    activeConfig,
  ])

  return render({
    element: "container",
    className: props.className,
    style: containerStyle,
    children: keys.map((key) => {
      const baseChildStyle: CssGridStyle = {
        gridArea: key,
        ...props.childstyle,
        ...props.childStyles?.[key],
      }

      const breakpointChildStyle: CssGridStyle = activeConfig
        ? {
          ...activeConfig.childstyle,
          ...activeConfig.childStyles?.[key],
        }
        : {}

      return render({
        element: "child",
        key,
        style: { ...baseChildStyle, ...breakpointChildStyle },
        children: props.childs[key],
      })
    }),
  })
}
