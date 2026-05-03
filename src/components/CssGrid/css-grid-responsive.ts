import type { CssGridStyle } from "./CssGridContext"

export const createGridTemplateAreas = (layout: string[][]): string => {
  return layout.map((row) => `"${row.join(" ")}"`).join("\n")
}

export const createContainerStyle = (config: {
  layout?: readonly (readonly string[])[]
  rows?: string[]
  columns?: string[]
  containerStyle?: CssGridStyle
}): CssGridStyle => {
  return {
    ...(config.layout
      ? { gridTemplateAreas: createGridTemplateAreas(config.layout as string[][]) }
      : {}),
    ...(config.rows ? { gridTemplateRows: config.rows.join(" ") } : {}),
    ...(config.columns ? { gridTemplateColumns: config.columns.join(" ") } : {}),
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
    result[`@media (min-width: ${breakpointValue})`] = params.createStyle(config as TConfig)
  })

  return result
}
