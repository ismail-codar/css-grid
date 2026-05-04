import type React from "react"
import { useMemo } from "react"
import type { SafeFixedArray } from "../../typings/type-utils"
import { useCssGridContext, type CssGridStyle } from "./CssGridContext"
import { createContainerStyle, createResponsiveStyle } from "./css-grid-responsive"

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

export const bpConfig = <const TBpLayout extends readonly (readonly string[])[]>(
  config: CssGridResponsiveConfig<TBpLayout>,
): CssGridResponsiveConfig<readonly (readonly string[])[]> => config

// `const TLayout` (TS 5.0+): infers the layout array with const semantics in JSX,
// giving literal tuple types and literal dimension lengths without requiring `as const`
export const CssGrid = <
  const TLayout extends readonly (readonly string[])[],
  TStyle extends CssGridStyle = CssGridStyle,
>(
  props: CssGridProps<TLayout, TStyle>,
) => {
  const { render, breakpoints } = useCssGridContext()

  const keys = useMemo(
    () => Object.keys(props.childs) as LayoutNames<TLayout>[],
    [props.childs],
  )

  const breakpointKeys = useMemo(
    () => Object.keys(breakpoints),
    [breakpoints],
  )

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

  const containerStyle = useMemo(() => {
    const baseStyle = createContainerStyle({
      layout: props.layout as readonly (readonly string[])[] | undefined,
      rows: props.rows as readonly string[] | undefined,
      columns: props.columns as readonly string[] | undefined,
      containerStyle: props.containerStyle,
    })

    return createResponsiveStyle<string, BpConfig>({
      baseStyle: { display: "grid", ...baseStyle },
      responsiveConfigs,
      breakpoints,
      createStyle: (config) =>
        createContainerStyle({
          layout: config.layout as readonly (readonly string[])[] | undefined,
          rows: config.rows as readonly string[] | undefined,
          columns: config.columns as readonly string[] | undefined,
          containerStyle: config.containerStyle,
        }),
    })
  }, [
    props.layout,
    props.rows,
    props.columns,
    props.containerStyle,
    responsiveConfigs,
    breakpoints,
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

      const responsiveChildStyle = createResponsiveStyle<string, BpConfig>({
        baseStyle: baseChildStyle,
        responsiveConfigs,
        breakpoints,
        createStyle: (config) => ({
          ...config.childstyle,
          ...config.childStyles?.[key],
        }),
      })

      return render({
        element: "child",
        key,
        style: responsiveChildStyle,
        children: props.childs[key],
      })
    }),
  })
}
