---
name: css-grid
description: "css-grid React kütüphanesi ile responsive CSS Grid layout oluşturma rehberi. TRIGGER: kullanıcı CssGrid komponentini, grid template areas tabanlı layout, responsive breakpoint (xs/sm/md/lg/xl) yapısını, CssGridProvider veya özel renderer kullanmak istediğinde; içe aktarımlarda `css-grid` veya yerel `src/components/CssGrid`, kolonlara ayırma, farklı cihaz boyutları görüldüğünde."
---

# css-grid Kullanım Rehberi

CSS Grid `grid-template-areas` tabanlı, type-safe responsive layout React kütüphanesidir. Tek bir bildirimle layout matrisi, satır/sütun ölçüleri ve breakpoint override'ları tanımlanır.

## Genel Mimari

- `CssGrid<TLayout>` — tek komponent. `layout` 2D string dizisi olarak alan adlarını verir; her alan `childs` objesinde aynı isimle eşlenmiş bir React node'a karşılık gelir.
- `CssGridProvider` — `render` (özel renderer) ve `breakpoints` (Record<string,string>) sağlar. Sarmalanmazsa default `<div>` renderer ve `xs/sm/md/lg/xl` default'ları kullanılır.
- Breakpoint algılama `window.matchMedia` ile yapılır; en geniş eşleşen breakpoint aktif olur. SSR'de `window` yoksa undefined döner ve sadece base props uygulanır.

## Tip Sözleşmesi (önemli)

`CssGrid` generic'leri `const TLayout`, `const TXs`, ... şeklinde işaretlenmiştir. Bu yüzden:

- `layout`, `xs.layout`, ... **inline** literal yazılmalıdır. `as const` veya wrapper helper gerekmez.
- `rows` uzunluğu `layout.length`, `columns` uzunluğu `layout[0].length` ile sabittir (`SafeFixedArray`).
- `childs` propu, `layout` içindeki tüm alan adları için **eksiksiz** key sağlamak zorundadır — eksik key TS hatası verir.
- Breakpoint layoutlarındaki (xs/sm/md/lg/xl) hücre değerleri **parent layout** alan adlarının alt kümesi olmalıdır. Yeni alan adı eklenemez (TS hatası).
- `childStyles` keyleri parent layout alan adlarına kısıtlıdır.

## Temel Kullanım

```tsx
import { CssGrid } from "css-grid"

export function PageLayout() {
  return (
    <CssGrid
      layout={[
        ["header", "header"],
        ["sidebar", "main"],
        ["footer", "footer"],
      ]}
      columns={["220px", "1fr"]}
      rows={["56px", "1fr", "78px"]}
      containerStyle={{ minHeight: "100vh", gap: "8px" }}
      childstyle={{ borderRadius: 6 }}
      childs={{
        header: <Header />,
        sidebar: <Sidebar />,
        main: <Main />,
        footer: <Footer />,
      }}
    />
  )
}
```

## Responsive Breakpoint Kullanımı

Breakpoint propları (`xs`, `sm`, `md`, `lg`, `xl`) base konfigürasyonun bir alt kümesini override eder. Aktif breakpoint base ile **shallow merge** edilir (`gridTemplateAreas`, `gridTemplateRows`, `gridTemplateColumns` ve `containerStyle`/`childstyle`/`childStyles` ayrı ayrı birleştirilir).

```tsx
<CssGrid
  layout={[
    ["header", "header"],
    ["sidebar", "main"],
    ["footer", "footer"],
  ]}
  columns={["220px", "1fr"]}
  rows={["56px", "1fr", "78px"]}
  childs={{ header, sidebar, main, footer }}
  xs={{
    layout: [["header"], ["main"], ["footer"]], // sidebar gizleniyor
    columns: ["1fr"],
    rows: ["56px", "1fr", "78px"],
    containerStyle: { gap: 8 },
  }}
/>
```

Önemli davranışlar:

- Aktif breakpoint'in `layout`'unda **adı geçmeyen** alanlar render edilmez. Üstteki örnekte xs altında `sidebar` DOM'a basılmaz.
- Bir breakpoint config'inde sadece `containerStyle` veya sadece `childStyles` override edilebilir; layout vermek zorunlu değildir.
- Default breakpoint sınırları: `xs:480px, sm:640px, md:768px, lg:1024px, xl:1280px` — `min-width` ile karşılaştırılır.

## Özel Renderer / Breakpoint Sağlama

`CssGridProvider` ile `render` ve `breakpoints` özelleştirilir. `render` her container ve her child için çağrılır (`element: "container" | "child"`).

```tsx
import { CssGridProvider, type CssGridRenderer } from "css-grid"

const myRenderer: CssGridRenderer = ({ element, className, style, children, key }) => (
  <div key={key} data-cg={element} className={className} style={style as React.CSSProperties}>
    {children}
  </div>
)

<CssGridProvider value={{ render: myRenderer, breakpoints: { sm: "600px", lg: "1100px" } }}>
  <App />
</CssGridProvider>
```

`style` objesinde `@media (...)` anahtarları varsa default renderer bunları **işlemez** (inline style olarak React'e geçer ve React tarafından yok sayılır). Gerçek media query çıktısı isteyen agent'lar custom renderer yazmalıdır; `demo/renderer.tsx` içindeki `mediaRenderer` referans örnektir (style hash'i alıp `<style>` etiketine class olarak inject eder).

## Yardımcı Fonksiyonlar

- `createGridTemplateAreas(layout)` — 2D diziyi `"a a"\n"b c"` string'ine çevirir.
- `createContainerStyle({ layout, rows, columns, containerStyle })` — birleşik container style üretir.
- `createResponsiveStyle({ baseStyle, responsiveConfigs, breakpoints, createStyle })` — `@media (min-width: ...)` anahtarlı style objesi üretir; custom renderer ile birlikte kullanılır.

`CssGrid` komponenti zaten `createContainerStyle`'ı dahili kullanır — manuel çağırmaya genelde gerek yoktur.

## Dışa Aktarılan Tip ve Semboller

```ts
import {
  CssGrid,
  CssGridProvider,
  CssGridContext,
  useCssGridContext,
  createContainerStyle,
  createGridTemplateAreas,
  createResponsiveStyle,
  type CssGridProps,
  type CssGridResponsiveConfig,
  type CssGridBreakpointProps,
  type CssGridBreakpoints,
  type CssGridContextValue,
  type CssGridRenderOptions,
  type CssGridRenderer,
  type CssGridStyle,
  type FixedArray,
} from "css-grid"
```

## Sık Yapılan Hatalar (kaçınılması gerekenler)

- **`as const` ekleme:** Generic'ler `const` modifier ile literal'i koruduğu için gereksiz; agent yazmamalı.
- **Eksik `childs` keyi:** `layout` içinde geçen her alan için node verilmeli.
- **Breakpoint layout'unda yeni alan adı:** Parent `layout`'ta olmayan bir isim breakpoint layout'una eklenemez (TS engeller). Yeni içerik gerekiyorsa parent layout'a alan eklenip diğer breakpoint'lerde gizlenmeli.
- **`rows`/`columns` uzunluk uyumsuzluğu:** Sırasıyla `layout.length` ve `layout[0].length` olmak zorunda. Tek satırlı layout için bile 1 elemanlı dizi.
- **Ragged layout:** Tüm satırların aynı sütun sayısına sahip olduğu varsayılır; aynı alanı kapsayacaksa o alan adını yan yana tekrar et (`["header","header"]`).
- **Provider eksikse media query bekleme:** Default renderer `@media` anahtarlarını CSS'e çevirmez. Gerçek media query çıkışı için custom renderer şart.
- **SSR'de breakpoint:** İlk render'da `window` yoksa aktif breakpoint `undefined`'dır; mismatch'i önlemek için sunucu/istemci arasında base layout görünür olmalı.

## Kütüphaneye Katkı (geliştirici notları)

- `npm run dev` — demo (Vite) çalıştırır (`demo/main.tsx`).
- `npm run build` — `tsdown` ile dist üretir + `scripts/rename-dts.mjs` `.d.ts` adlandırmasını düzenler.
- `npm run typecheck` — sadece TS kontrolü.
- Kaynak yapısı:
  - `src/components/CssGrid/CssGrid.tsx` — komponent, breakpoint hook, merge mantığı.
  - `src/components/CssGrid/CssGridContext.tsx` — Provider, default renderer, default breakpoints.
  - `src/components/CssGrid/css-grid-responsive.ts` — saf style üretici fonksiyonlar.
  - `src/typings/type-utils.ts` — `FixedArray`, `SafeFixedArray`.
- Demo `demo/main.tsx` ve `demo/renderer.tsx` gerçek kullanım kalıpları için referans.
