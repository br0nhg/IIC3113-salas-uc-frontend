import { useState, type FormEvent } from 'react'
import { useToast } from '../../context/toast-context'
import { ApiError, createReport } from '../../services'
import type { Building, Report, ReportType, Room } from '../../types'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import TextField from '../ui/TextField'
import { REPORT_TYPE_LABELS } from './reportPresentation'

const DETAIL_MAX_LENGTH = 300
const REPORT_TYPES = Object.keys(REPORT_TYPE_LABELS) as ReportType[]

interface ReportModalProps {
  open: boolean
  onClose: () => void
  /** Sala fija (desde el detalle). Si se omite, se elige de `rooms`. */
  roomId?: string
  /** Salas seleccionables para el reporte rápido. */
  rooms?: Room[]
  /** Para agrupar las salas por edificio en el selector. */
  buildings?: Building[]
  onCreated?: (report: Report) => void
}

/** Modal para reportar un problema o discrepancia en una sala. */
export default function ReportModal({ open, onClose, ...formProps }: ReportModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reportar estado de sala"
      icon="flag"
      iconClassName="text-error"
    >
      {/* El formulario se desmonta al cerrar, así cada apertura parte en blanco. */}
      <ReportForm onClose={onClose} {...formProps} />
    </Modal>
  )
}

function ReportForm({
  roomId: fixedRoomId,
  rooms = [],
  buildings = [],
  onClose,
  onCreated,
}: Omit<ReportModalProps, 'open'>) {
  const { showToast } = useToast()
  const [roomId, setRoomId] = useState(fixedRoomId ?? '')
  const [roomError, setRoomError] = useState<string | undefined>()
  const [type, setType] = useState<ReportType>('shown-free-but-busy')
  const [detail, setDetail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!roomId) {
      setRoomError('Elige la sala que quieres reportar.')
      return
    }
    setSending(true)
    setError(null)
    try {
      const report = await createReport({ roomId, type, detail })
      showToast(`Reporte de ${roomId} enviado. ¡Gracias por avisar!`)
      onCreated?.(report)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el reporte.')
      setSending(false)
    }
  }

  return (
    <form className="space-y-4 p-5" onSubmit={handleSubmit} noValidate>
      {error && <Alert variant="error">{error}</Alert>}
      {fixedRoomId ? (
        <TextField
          label="Sala afectada"
          value={fixedRoomId}
          readOnly
          className="[&_input]:font-semibold [&_input]:text-primary"
        />
      ) : (
        <Select
          label="Sala afectada"
          value={roomId}
          error={roomError}
          onChange={(event) => {
            setRoomId(event.target.value)
            setRoomError(undefined)
          }}
        >
          <option value="">Selecciona una sala</option>
          {buildings.map((building) => (
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
      <Select
        label="Tipo de problema"
        value={type}
        onChange={(event) => setType(event.target.value as ReportType)}
      >
        {REPORT_TYPES.map((value) => (
          <option key={value} value={value}>
            {REPORT_TYPE_LABELS[value]}
          </option>
        ))}
      </Select>
      <Textarea
        label="Detalle (opcional)"
        rows={3}
        maxLength={DETAIL_MAX_LENGTH}
        placeholder="Ej.: hay una ayudantía no programada usando la sala."
        value={detail}
        onChange={(event) => setDetail(event.target.value)}
      />
      <Alert>
        Tu reporte ayuda a advertir a otros usuarios mientras se verifica con BuscaCursos y el
        campus.
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
