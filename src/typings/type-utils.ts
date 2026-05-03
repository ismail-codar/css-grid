export type FixedArray<T, N extends number, A extends T[] = []> = A["length"] extends N
  ? A
  : FixedArray<T, N, [...A, T]>

export type SafeFixedArray<T, N extends number> = number extends N ? T[] : FixedArray<T, N>
