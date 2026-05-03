import type React from "react"
import { createContext, useContext } from "react"

export type CssGridStyle = Record<string, unknown>

export type CssGridBreakpoints = Record<string, string>

export interface CssGridRenderOptions {
  element: "container" | "child"
  className?: string
  style?: CssGridStyle
  children?: React.ReactNode
  key?: React.Key
}

export type CssGridRenderer = (options: CssGridRenderOptions) => React.ReactElement

export interface CssGridContextValue {
  render: CssGridRenderer
  /**
   * Örnek:
   * {
   *   xs: "480px",
   *   sm: "640px",
   *   md: "768px",
   *   lg: "1024px",
   *   xl: "1280px"
   * }
   */
  breakpoints: CssGridBreakpoints
}

const defaultRenderer: CssGridRenderer = ({ className, style, children, key }) => {
  return (
    <div key={key} className={className} style={style as React.CSSProperties}>
      {children}
    </div>
  )
}

const defaultBreakpoints: CssGridBreakpoints = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
}

export const CssGridContext = createContext<CssGridContextValue>({
  render: defaultRenderer,
  breakpoints: defaultBreakpoints,
})

export const CssGridProvider = CssGridContext.Provider

export const useCssGridContext = () => {
  return useContext(CssGridContext)
}
