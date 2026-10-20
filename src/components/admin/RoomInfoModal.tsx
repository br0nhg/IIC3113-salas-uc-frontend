import { useState, type FormEvent } from 'react'
import { useToast } from '../../context/toast-context'
import { ApiError, updateRoomInfo } from '../../services'
import type { Room } from '../../types'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import TextField from '../ui/TextField'

interface RoomInfoModalProps {
  /** Sala a editar; null mantiene el modal cerrado. */
  room: Room | null
  onClose: () => void
  onSaved?: () => void
}

/** Modal para que el administrador ingrese piso y capacidad (no vienen de BuscaCursos). */
export default function RoomInfoModal({ room, onClose, onSaved }: RoomInfoModalProps) {
  return (
    <Modal open={room !== null} onClose={onClose} title={`Editar sala ${room?.name ?? ''}`} icon="edit">
      {/* El formulario se desmonta al cerrar, así cada apertura parte con los datos de la sala. */}
      {room && <RoomInfoForm room={room} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  )
}

/** "" → null (sin información); entero >= 0 → número; otro valor → undefined (inválido). */
function parseField(value: string): number | null | undefined {
  if (value.trim() === '') return null
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 ? number : undefined
}

function RoomInfoForm({ room, onClose, onSaved }: { room: Room } & Omit<RoomInfoModalProps, 'room'>) {
  const { showToast } = useToast()
  const [floor, setFloor] = useState(room.floor?.toString() ?? '')
  const [capacity, setCapacity] = useState(room.capacity?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const parsedFloor = parseField(floor)
  const parsedCapacity = parseField(capacity)
  const invalid = 'Ingresa un número entero mayor o igual a 0, o déjalo vacío.'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (parsedFloor === undefined || parsedCapacity === undefined) return
    setSaving(true)
    setError(null)
    try {
      await updateRoomInfo(room.id, { floor: parsedFloor, capacity: parsedCapacity })
      showToast(`Sala ${room.name} actualizada`)
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la sala.')
      setSaving(false)
    }
  }

  return (
    <form className="space-y-4 p-5" onSubmit={handleSubmit} noValidate>
      {error && <Alert variant="error">{error}</Alert>}
      <TextField
        label="Piso"
        inputMode="numeric"
        value={floor}
        error={parsedFloor === undefined ? invalid : undefined}
        onChange={(event) => setFloor(event.target.value)}
      />
      <TextField
        label="Capacidad (personas)"
        inputMode="numeric"
        value={capacity}
        error={parsedCapacity === undefined ? invalid : undefined}
        onChange={(event) => setCapacity(event.target.value)}
      />
      <Alert>Estos datos no vienen de BuscaCursos. Deja un campo vacío si no lo conoces.</Alert>
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          icon="save"
          loading={saving}
          disabled={parsedFloor === undefined || parsedCapacity === undefined}
        >
          Guardar
        </Button>
      </div>
    </form>
  )
}
