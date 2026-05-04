import type React from "react"
import { useEffect, useMemo, useState } from "react"
import type { SafeFixedArray } from "../../typings/type-utils"
import { useCssGridContext, type CssGridStyle } from "./CssGridContext"
import { createContainerStyle } from "./css-grid-responsive"

// Union of all area names in the layout
type LayoutNames<TLayout extends readonly (readonly string[])[]> = TLayout[number][number]

export type CssGridResponsiveConfig<
  TLayout extends readonly (readonly string[])[] = readonly (readonly string[])[],
  TStyle extends CssGridStyle = CssGridStyle,
> = Partial<{
  layout: TLayout
  rows: SafeFixedArray<string, TLayout["length"]>
  columns: SafeFixedArray<string, TLayout[0]["length"]>
  containerStyle: TStyle
  childstyle: TStyle
  childStyles: { [key in LayoutNames<TLayout>]?: TStyle }
}>

export type CssGridBreakpointProps<TStyle extends CssGridStyle = CssGridStyle> = {
  xs?: CssGridResponsiveConfig<readonly (readonly string[])[], TStyle>
  sm?: CssGridResponsiveConfig<readonly (readonly string[])[], TStyle>
  md?: CssGridResponsiveConfig<readonly (readonly string[])[], TStyle>
  lg?: CssGridResponsiveConfig<readonly (readonly string[])[], TStyle>
  xl?: CssGridResponsiveConfig<readonly (readonly string[])[], TStyle>
}

export type CssGridProps<
  TLayout extends readonly (readonly string[])[] = readonly (readonly string[])[],
  TStyle extends CssGridStyle = CssGridStyle,
> = CssGridResponsiveConfig<TLayout, TStyle> &
  CssGridBreakpointProps<TStyle> & {
    className?: string
    childs: { [key in LayoutNames<TLayout>]: React.ReactNode }
  }

export const breakPointConfig = <const TBpLayout extends readonly (readonly string[])[]>(
  config: CssGridResponsiveConfig<TBpLayout>,
): CssGridResponsiveConfig<readonly (readonly string[])[]> => config

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

// `const TLayout` (TS 5.0+): infers the layout array with const semantics in JSX,
// giving literal tuple types and literal dimension lengths without requiring `as const`
export const CssGrid = <
  const TLayout extends readonly (readonly string[])[],
  TStyle extends CssGridStyle = CssGridStyle,
>(
  props: CssGridProps<TLayout, TStyle>,
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

  type BpConfig = CssGridResponsiveConfig<readonly (readonly string[])[], TStyle>

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
