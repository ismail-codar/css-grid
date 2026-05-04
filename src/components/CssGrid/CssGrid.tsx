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

export type CssGridProps<
  TLayout extends readonly (readonly string[])[] = readonly (readonly string[])[],
  TStyle extends CssGridStyle = CssGridStyle,
  TBreakpoint extends string = "xs" | "sm" | "md" | "lg" | "xl",
> = CssGridResponsiveConfig<TLayout, TStyle> &
  Partial<Record<TBreakpoint, CssGridResponsiveConfig<readonly (readonly string[])[], TStyle>>> & {
    className?: string
    childs: { [key in LayoutNames<TLayout>]: React.ReactNode }
  }

// `const TLayout` (TS 5.0+): infers the layout array with const semantics in JSX,
// giving literal tuple types and literal dimension lengths without requiring `as const`
export const CssGrid = <
  const TLayout extends readonly (readonly string[])[],
  TStyle extends CssGridStyle = CssGridStyle,
  TBreakpoint extends string = "xs" | "sm" | "md" | "lg" | "xl",
>(
  props: CssGridProps<TLayout, TStyle, TBreakpoint>,
) => {
  const { render, breakpoints } = useCssGridContext()

  const keys = useMemo(
    () => Object.keys(props.childs) as LayoutNames<TLayout>[],
    [props.childs],
  )

  const breakpointKeys = useMemo(
    () => Object.keys(breakpoints) as TBreakpoint[],
    [breakpoints],
  )

  const responsiveConfigs = useMemo(() => {
    const result = {} as Partial<Record<TBreakpoint, CssGridResponsiveConfig<readonly (readonly string[])[], TStyle>>>
    breakpointKeys.forEach((breakpoint) => {
      const config = (props as Record<string, unknown>)[breakpoint]
      if (config) {
        result[breakpoint] = config as CssGridResponsiveConfig<readonly (readonly string[])[], TStyle>
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

    return createResponsiveStyle<TBreakpoint, CssGridResponsiveConfig<readonly (readonly string[])[], TStyle>>({
      baseStyle: { display: "grid", ...baseStyle },
      responsiveConfigs,
      breakpoints: breakpoints as Record<TBreakpoint, string>,
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

      const responsiveChildStyle = createResponsiveStyle<
        TBreakpoint,
        CssGridResponsiveConfig<readonly (readonly string[])[], TStyle>
      >({
        baseStyle: baseChildStyle,
        responsiveConfigs,
        breakpoints: breakpoints as Record<TBreakpoint, string>,
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
