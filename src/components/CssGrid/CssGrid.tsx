import type React from "react"
import { useMemo } from "react"
import type { FixedArray } from "../../typings/type-utils"
import { useCssGridContext, type CssGridStyle } from "./CssGridContext"
import { createContainerStyle, createResponsiveStyle } from "./css-grid-responsive"

export type CssGridResponsiveConfig<
  N extends string,
  C extends number,
  R extends number,
  TStyle extends CssGridStyle = CssGridStyle,
> = Partial<{
  layout: FixedArray<FixedArray<N, C>, R>
  rows: FixedArray<string, R>
  columns: FixedArray<string, C>
  containerStyle: TStyle
  childstyle: TStyle
  childStyles: { [key in N]?: TStyle }
}>

export type CssGridProps<
  N extends string,
  C extends number,
  R extends number,
  TStyle extends CssGridStyle = CssGridStyle,
  TBreakpoint extends string = "xs" | "sm" | "md" | "lg" | "xl",
> = CssGridResponsiveConfig<N, C, R, TStyle> &
  Partial<Record<TBreakpoint, CssGridResponsiveConfig<N, C, R, TStyle>>> & {
    className?: string
    childs: { [key in N]: React.ReactNode }
  }

export const CssGrid = <
  N extends string,
  C extends number,
  R extends number,
  TStyle extends CssGridStyle = CssGridStyle,
  TBreakpoint extends string = "xs" | "sm" | "md" | "lg" | "xl",
>(
  props: CssGridProps<N, C, R, TStyle, TBreakpoint>,
) => {
  const { render, breakpoints } = useCssGridContext()

  const keys = useMemo(() => Object.keys(props.childs) as N[], [props.childs])

  const breakpointKeys = useMemo(
    () => Object.keys(breakpoints) as TBreakpoint[],
    [breakpoints],
  )

  const responsiveConfigs = useMemo(() => {
    const result = {} as Partial<
      Record<TBreakpoint, CssGridResponsiveConfig<N, C, R, TStyle>>
    >
    breakpointKeys.forEach((breakpoint) => {
      const config = (props as Record<string, unknown>)[breakpoint]
      if (config) {
        result[breakpoint] = config as CssGridResponsiveConfig<N, C, R, TStyle>
      }
    })
    return result
  }, [breakpointKeys, props])

  const containerStyle = useMemo(() => {
    const baseStyle = createContainerStyle<N, C, R, TStyle>({
      layout: props.layout,
      rows: props.rows,
      columns: props.columns,
      containerStyle: props.containerStyle,
    })

    return createResponsiveStyle<
      TBreakpoint,
      CssGridResponsiveConfig<N, C, R, TStyle>
    >({
      baseStyle: { display: "grid", ...baseStyle },
      responsiveConfigs,
      breakpoints: breakpoints as Record<TBreakpoint, string>,
      createStyle: (config) => createContainerStyle<N, C, R, TStyle>(config),
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
        CssGridResponsiveConfig<N, C, R, TStyle>
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
