import React from "react";

//#region src/typings/type-utils.d.ts
type FixedArray<T, N extends number, A extends T[] = []> = A["length"] extends N ? A : FixedArray<T, N, [...A, T]>;
type SafeFixedArray<T, N extends number> = number extends N ? T[] : FixedArray<T, N>;
//# sourceMappingURL=type-utils.d.ts.map
//#endregion
//#region src/components/CssGrid/CssGridContext.d.ts
type CssGridStyle = Record<string, unknown>;
type CssGridBreakpoints = Record<string, string>;
interface CssGridRenderOptions {
  element: "container" | "child";
  className?: string;
  style?: CssGridStyle;
  children?: React.ReactNode;
  key?: React.Key;
}
type CssGridRenderer = (options: CssGridRenderOptions) => React.ReactElement;
interface CssGridContextValue {
  render: CssGridRenderer;
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
  breakpoints: CssGridBreakpoints;
}
declare const CssGridContext: React.Context<CssGridContextValue>;
declare const CssGridProvider: React.Provider<CssGridContextValue>;
declare const useCssGridContext: () => CssGridContextValue;
//# sourceMappingURL=CssGridContext.d.ts.map
//#endregion
//#region src/components/CssGrid/CssGrid.d.ts
type LayoutNames<TLayout extends readonly (readonly string[])[]> = TLayout[number][number];
type AnyLayout = readonly (readonly string[])[];
type LayoutOf<TNames extends string> = readonly (readonly TNames[])[];
type CssGridResponsiveConfig<TLayout extends AnyLayout = AnyLayout, TStyle extends CssGridStyle = CssGridStyle> = Partial<{
  layout: TLayout;
  rows: SafeFixedArray<string, TLayout["length"]>;
  columns: SafeFixedArray<string, TLayout[0]["length"]>;
  containerStyle: TStyle;
  childstyle: TStyle;
  childStyles: { [key in LayoutNames<TLayout>]?: TStyle };
}>;
type CssGridBreakpointProps<TLayout extends AnyLayout = AnyLayout, TXs extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, TSm extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, TMd extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, TLg extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, TXl extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, TStyle extends CssGridStyle = CssGridStyle> = {
  xs?: CssGridResponsiveConfig<TXs, TStyle>;
  sm?: CssGridResponsiveConfig<TSm, TStyle>;
  md?: CssGridResponsiveConfig<TMd, TStyle>;
  lg?: CssGridResponsiveConfig<TLg, TStyle>;
  xl?: CssGridResponsiveConfig<TXl, TStyle>;
};
type CssGridProps<TLayout extends AnyLayout = AnyLayout, TXs extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, TSm extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, TMd extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, TLg extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, TXl extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, TStyle extends CssGridStyle = CssGridStyle> = CssGridResponsiveConfig<TLayout, TStyle> & CssGridBreakpointProps<TLayout, TXs, TSm, TMd, TLg, TXl, TStyle> & {
  className?: string;
  childs: { [key in LayoutNames<TLayout>]: React.ReactNode };
};
declare const CssGrid: <const TLayout extends AnyLayout, const TXs extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, const TSm extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, const TMd extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, const TLg extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, const TXl extends LayoutOf<LayoutNames<TLayout>> = LayoutOf<LayoutNames<TLayout>>, TStyle extends CssGridStyle = CssGridStyle>(props: CssGridProps<TLayout, TXs, TSm, TMd, TLg, TXl, TStyle>) => React.ReactElement<unknown, string | React.JSXElementConstructor<any>>;
//#endregion
//#region src/components/CssGrid/css-grid-responsive.d.ts
declare const createGridTemplateAreas: (layout: string[][]) => string;
declare const createContainerStyle: (config: {
  layout?: readonly (readonly string[])[];
  rows?: readonly string[];
  columns?: readonly string[];
  containerStyle?: CssGridStyle;
}) => CssGridStyle;
declare const createResponsiveStyle: <TBreakpoint extends string, TConfig extends object>(params: {
  baseStyle: CssGridStyle;
  responsiveConfigs: Partial<Record<TBreakpoint, TConfig>>;
  breakpoints: Record<TBreakpoint, string>;
  createStyle: (config: TConfig) => CssGridStyle;
}) => CssGridStyle;
//# sourceMappingURL=css-grid-responsive.d.ts.map

//#endregion
export { CssGrid, CssGridBreakpointProps, CssGridBreakpoints, CssGridContext, CssGridContextValue, CssGridProps, CssGridProvider, CssGridRenderOptions, CssGridRenderer, CssGridResponsiveConfig, CssGridStyle, type FixedArray, createContainerStyle, createGridTemplateAreas, createResponsiveStyle, useCssGridContext };
//# sourceMappingURL=index-C9r1Dt7h.d.cts.map