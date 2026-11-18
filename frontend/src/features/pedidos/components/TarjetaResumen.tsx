type TarjetaResumenProps = {
  titulo: string
  valor: string | number
  detalle?: string
  color: 'ambar' | 'cielo' | 'verde' | 'gris' | 'naranja' | 'esmeralda'
}

const COLORES: Record<TarjetaResumenProps['color'], string> = {
  ambar: 'border-amber-300 bg-amber-50 text-amber-900',
  cielo: 'border-sky-300 bg-sky-50 text-sky-900',
  verde: 'border-green-300 bg-green-50 text-green-900',
  gris: 'border-stone-300 bg-stone-100 text-stone-700',
  naranja: 'border-orange-300 bg-orange-50 text-orange-900',
  esmeralda: 'border-emerald-300 bg-emerald-50 text-emerald-900',
}

export const TarjetaResumen = ({ titulo, valor, detalle, color }: TarjetaResumenProps) => (
  <div className={`flex flex-col gap-1 rounded-xl border-l-4 p-5 shadow-sm ${COLORES[color]}`}>
    <span className="text-sm font-semibold opacity-80">{titulo}</span>
    <span className="text-3xl font-extrabold">{valor}</span>
    {detalle && <span className="text-xs opacity-70">{detalle}</span>}
  </div>
)
