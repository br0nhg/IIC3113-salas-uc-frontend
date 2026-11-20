import { useState, type FormEvent } from 'react'
import { useToast } from '../../context/toast-context'
import type { Catalog } from '../../hooks/useCatalog'
import { ApiError, createReport } from '../../services'
import type { DayCode, ModuleNumber, Report, ReportReason, Room } from '../../types'
import { dateForDay, formatModuleRange, isModulePast, todayIsoDate } from '../../utils/schedule'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import TextField from '../ui/TextField'
import { REPORT_REASON_LABELS } from './reportPresentation'

const DETAIL_MAX_LENGTH = 300
const REPORT_REASONS = Object.keys(REPORT_REASON_LABELS) as ReportReason[]

interface ReportModalProps {
  open: boolean
  onClose: () => void
  catalog: Catalog
  /** Sala fija (desde el detalle). Si se omite, se elige de `rooms`. */
  roomId?: string
  /** Salas seleccionables para el reporte rápido. */
  rooms?: Room[]
  /** Día y módulo sugeridos (los que el usuario está consultando). */
  day?: DayCode
  module?: ModuleNumber
  onCreated?: (report: Report) => void
}

/** Modal para avisar que una sala que aparece libre está ocupada. */
export default function ReportModal({ open, onClose, ...formProps }: ReportModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Reportar sala ocupada" icon="flag" iconClassName="text-error">
      {/* El formulario se desmonta al cerrar, así cada apertura parte en blanco. */}
      <ReportForm onClose={onClose} {...formProps} />
    </Modal>
  )
}

/** Módulos de un día que aún no terminan (en días pasados de la semana, ninguno). */
function openModules(catalog: Catalog, day: DayCode) {
  if (dateForDay(day) < todayIsoDate()) return []
  return catalog.modules.filter((module) => !isModulePast(module, day))
}

function ReportForm({
  catalog,
  roomId: fixedRoomId,
  rooms = [],
  day: suggestedDay,
  module: suggestedModule,
  onClose,
  onCreated,
}: Omit<ReportModalProps, 'open'>) {
  const { showToast } = useToast()
  const days = catalog.days.filter((day) => openModules(catalog, day.code).length > 0)
  const initialDay = days.find((day) => day.code === suggestedDay)?.code ?? days[0]?.code
  const initialModules = initialDay ? openModules(catalog, initialDay) : []
  const initialModule =
    initialModules.find((module) => module.number === suggestedModule)?.number ?? initialModules[0]?.number

  const [roomId, setRoomId] = useState(fixedRoomId ?? '')
  const [roomError, setRoomError] = useState<string | undefined>()
  const [day, setDay] = useState(initialDay)
  const [module, setModule] = useState(initialModule)
  const [reason, setReason] = useState<ReportReason>('class')
  const [detail, setDetail] = useState('')
  const [detailError, setDetailError] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const modules = day ? openModules(catalog, day) : []

  function changeDay(next: DayCode) {
    setDay(next)
    // Mantiene el módulo si sigue disponible ese día; si no, el primero disponible.
    const available = openModules(catalog, next)
    if (!available.some((m) => m.number === module)) setModule(available[0]?.number)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!roomId) {
      setRoomError('Elige la sala que quieres reportar.')
      return
    }
    if (reason === 'other' && !detail.trim()) {
      setDetailError('Describe el motivo.')
      return
    }
    if (!day || !module) return
    setSending(true)
    setError(null)
    try {
      const report = await createReport({ roomId, date: dateForDay(day), module, reason, detail })
      showToast(`Reporte de ${roomId} enviado. Un administrador lo revisará.`)
      onCreated?.(report)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el reporte.')
      setSending(false)
    }
  }

  if (!day || !module) {
    return (
      <div className="space-y-4 p-5">
        <Alert>No quedan módulos por reportar esta semana. Vuelve a intentarlo el lunes.</Alert>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form className="space-y-4 p-5" onSubmit={handleSubmit} noValidate>
      {error && <Alert variant="error">{error}</Alert>}
      {fixedRoomId ? (
        <TextField
          label="Sala"
          value={fixedRoomId}
          readOnly
          className="[&_input]:font-semibold [&_input]:text-primary"
        />
      ) : (
        <Select
          label="Sala"
          value={roomId}
          error={roomError}
          onChange={(event) => {
            setRoomId(event.target.value)
            setRoomError(undefined)
          }}
        >
          <option value="">Selecciona una sala</option>
          {catalog.buildings.map((building) => (
            <optgroup key={building.code} label={building.name}>
              {rooms
                .filter((room) => room.buildingCode === building.code)
                .map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </Select>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Select label="Día" value={day} onChange={(event) => changeDay(event.target.value as DayCode)}>
          {days.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </Select>
        <Select
          label="Módulo"
          value={module}
          onChange={(event) => setModule(Number(event.target.value) as ModuleNumber)}
        >
          {modules.map((option) => (
            <option key={option.number} value={option.number}>
              M{option.number} · {formatModuleRange(option)}
            </option>
          ))}
        </Select>
      </div>
      <Select
        label="¿Por qué no está disponible?"
        value={reason}
        onChange={(event) => {
          setReason(event.target.value as ReportReason)
          setDetailError(undefined)
        }}
      >
        {REPORT_REASONS.map((value) => (
          <option key={value} value={value}>
            {REPORT_REASON_LABELS[value]}
          </option>
        ))}
      </Select>
      <Textarea
        label={reason === 'other' ? 'Detalle' : 'Detalle (opcional)'}
        rows={3}
        maxLength={DETAIL_MAX_LENGTH}
        placeholder="Ej.: hay una ayudantía no programada usando la sala."
        value={detail}
        error={detailError}
        onChange={(event) => {
          setDetail(event.target.value)
          setDetailError(undefined)
        }}
      />
      <Alert>
        Un administrador revisará tu reporte. Si lo acepta, la sala se mostrará como ocupada durante el
        tiempo que indique.
      </Alert>
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="danger" icon="send" loading={sending}>
          Enviar reporte
        </Button>
      </div>
    </form>
  )
}
