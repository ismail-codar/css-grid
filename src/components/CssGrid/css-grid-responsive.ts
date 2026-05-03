import type { FixedArray } from "../../typings/type-utils"
import type { CssGridBreakpoints, CssGridStyle } from "./CssGridContext"

export const createGridTemplateAreas = (layout: string[][]): string => {
  return layout.map((row) => `"${row.join(" ")}"`).join("\n")
}

export const createContainerStyle = <
  N extends string,
  C extends number,
  R extends number,
  TStyle extends CssGridStyle,
>(config: {
  layout?: FixedArray<FixedArray<N, C>, R>
  rows?: FixedArray<string, R>
  columns?: FixedArray<string, C>
  containerStyle?: TStyle
}): CssGridStyle => {
  return {
    ...(config.layout
      ? { gridTemplateAreas: createGridTemplateAreas(config.layout as unknown as string[][]) }
      : {}),
    ...(config.rows
      ? { gridTemplateRows: (config.rows as unknown as string[]).join(" ") }
      : {}),
    ...(config.columns
      ? { gridTemplateColumns: (config.columns as unknown as string[]).join(" ") }
      : {}),
    ...config.containerStyle,
  }
}

export const createResponsiveStyle = <
  TBreakpoint extends string,
  TConfig extends object,
>(params: {
  baseStyle: CssGridStyle
  responsiveConfigs: Partial<Record<TBreakpoint, TConfig>>
  breakpoints: Record<TBreakpoint, string>
  createStyle: (config: TConfig) => CssGridStyle
}): CssGridStyle => {
  const result: CssGridStyle = { ...params.baseStyle }

  Object.entries(params.responsiveConfigs).forEach(([breakpoint, config]) => {
    if (!config) return
    const breakpointValue = params.breakpoints[breakpoint as TBreakpoint]
    if (!breakpointValue) return
    result[`@media (min-width: ${breakpointValue})`] = params.createStyle(
      config as TConfig,
    )
  })

  return result
}
