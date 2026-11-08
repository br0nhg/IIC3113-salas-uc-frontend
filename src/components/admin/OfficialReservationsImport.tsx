import { useRef, useState, type ChangeEvent } from 'react'
import { useToast } from '../../context/toast-context'
import { ApiError, importOfficialReservations } from '../../services'
import type { OfficialReservationsImportResult } from '../../types'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Panel from '../ui/Panel'

const MAX_FILE_BYTES = 1_000_000

interface OfficialReservationsImportProps {
  onImported: () => void
}

export default function OfficialReservationsImport({ onImported }: OfficialReservationsImportProps) {
  const { showToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<OfficialReservationsImportResult | null>(null)

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null)
    setError(null)
    setResult(null)
  }

  async function upload() {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Selecciona un archivo con extensión .json.')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('El archivo no puede superar 1 MB.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = JSON.parse(await file.text()) as unknown
      const imported = await importOfficialReservations(data)
      setResult(imported)
      showToast('Reservas oficiales cargadas correctamente')
      onImported()
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (caught) {
      const message =
        caught instanceof SyntaxError
          ? 'El archivo no contiene un JSON válido.'
          : caught instanceof ApiError
            ? caught.message
            : 'No se pudieron cargar las reservas. Intenta nuevamente.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Panel id="reservas-oficiales" title="Reservas oficiales" icon="event_busy">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <div>
          <p className="text-body-sm text-on-surface-variant">
            Carga las interrogaciones, eventos y ayudantías extraordinarias de una o más semanas.
            Las semanas incluidas en el archivo reemplazan su carga anterior.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex min-h-11 flex-1 cursor-pointer items-center rounded border border-outline-variant bg-surface-container-lowest px-3 text-body-sm hover:border-secondary">
              <span className="truncate text-on-surface-variant">
                {file?.name ?? 'Seleccionar archivo JSON'}
              </span>
              <input
                ref={inputRef}
                type="file"
                accept="application/json,.json"
                onChange={selectFile}
                className="sr-only"
              />
            </label>
            <Button icon="upload_file" loading={loading} disabled={!file} onClick={() => void upload()}>
              Cargar reservas
            </Button>
          </div>
          {error && <Alert variant="error" className="mt-3">{error}</Alert>}
          {result && (
            <Alert className="mt-3">
              Se cargaron {result.importedReservations} reservas ({result.importedSlots} módulos)
              en {result.replacedWeeks.length} {result.replacedWeeks.length === 1 ? 'semana' : 'semanas'}.
              {result.unknownRooms.length > 0 && (
                <> No se encontraron estas salas: <strong>{result.unknownRooms.join(', ')}</strong>.</>
              )}
            </Alert>
          )}
        </div>

        <div className="rounded-lg bg-surface-container-low p-3">
          <p className="text-label-mono text-outline uppercase">Formato esperado</p>
          <pre className="custom-scroll mt-2 overflow-x-auto text-xs text-on-surface-variant">{`[
  {
    "sala": "B12",
    "fecha": "2026-11-10",
    "modulos": [5],
    "motivo": "Interrogación"
  },
  {
    "sala": "K201",
    "fecha": "2026-11-12",
    "modulos": "3-4",
    "motivo": "Evento"
  }
]`}</pre>
        </div>
      </div>
    </Panel>
  )
}
