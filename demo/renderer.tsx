import React from 'react'
import type { CssGridRenderer } from '../src'

let _el: HTMLStyleElement | null = null
const _done = new Set<string>()

function _css(): HTMLStyleElement {
  if (!_el) {
    _el = document.createElement('style')
    _el.id = '__cg-r'
    document.head.appendChild(_el)
  }
  return _el
}

function _h(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

const _k = (s: string) => s.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)

function _inject(id: string, declarations: string, wrapper?: string): void {
  if (_done.has(id)) return
  _done.add(id)
  const rule = wrapper ? `${wrapper}{.${id}{${declarations}}}` : `.${id}{${declarations}}`
  _css().textContent += '\n' + rule
}

/**
 * CssGrid renderer that converts @media keys in style objects to actual CSS rules.
 * Base styles are also injected as CSS classes so media queries can override them.
 */
export const mediaRenderer: CssGridRenderer = ({ className, style, children, key }) => {
  const classes: string[] = className ? [className] : []
  const prefix = `cg-${key != null ? `${key}-` : ''}`

  if (style) {
    const base: [string, string][] = []

    for (const [k, v] of Object.entries(style)) {
      if (k.startsWith('@media') && v && typeof v === 'object') {
        const decls = Object.entries(v as Record<string, string>)
          .map(([p, val]) => `${_k(p)}:${val}`)
          .join(';')
        const id = `${prefix}${_h(k + decls)}`
        classes.push(id)
        _inject(id, decls, k)
      } else {
        base.push([_k(k), String(v)])
      }
    }

    if (base.length) {
      const decls = base.map(([p, v]) => `${p}:${v}`).join(';')
      const id = `${prefix}${_h(decls)}`
      classes.push(id)
      _inject(id, decls)
    }
  }

  return (
    <div key={key} className={classes.join(' ') || undefined}>
      {children}
    </div>
  )
}
