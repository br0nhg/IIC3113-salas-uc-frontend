/** Marca de la consola: cuadro UC + "Salas UC / Consola de operaciones". */
export default function AdminBrand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded bg-primary text-xs font-bold text-on-primary">
        UC
      </div>
      <div>
        <div className="text-headline-sm leading-tight font-bold text-primary">Salas UC</div>
        <div className="text-[11px] text-outline">Consola de operaciones</div>
      </div>
    </div>
  )
}
