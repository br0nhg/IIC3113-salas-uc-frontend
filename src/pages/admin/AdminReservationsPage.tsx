import { useEffect, useState, type FormEvent } from 'react'
import OfficialReservationsImport from '../../components/admin/OfficialReservationsImport'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/ui/Icon'
import Modal from '../../components/ui/Modal'
import Panel from '../../components/ui/Panel'
import Skeleton from '../../components/ui/Skeleton'
import Textarea from '../../components/ui/Textarea'
import TextField from '../../components/ui/TextField'
import { useToast } from '../../context/toast-context'
import {
  ApiError,
  deleteOfficialReservation,
  getOfficialReservations,
  updateOfficialReservation,
} from '../../services'
import type { AdminOfficialReservation } from '../../types'

function todayIso(): string {
  const now = new Date()
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
}

const DATE = new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

export default function AdminReservationsPage() {
  const { showToast } = useToast()
  const [reservations, setReservations] = useState<AdminOfficialReservation[] | null>(null)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)
  const [editing, setEditing] = useState<AdminOfficialReservation | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getOfficialReservations(todayIso())
      .then((rows) => {
        if (!cancelled) {
          setReservations(rows)
          setError(false)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => { cancelled = true }
  }, [version])

  async function remove(reservation: AdminOfficialReservation) {
    if (!window.confirm(`¿Eliminar la reserva de ${reservation.roomName} del ${reservation.date}?`)) return
    setDeletingId(reservation.id)
    try {
      await deleteOfficialReservation(reservation.id)
      setReservations((rows) => rows?.filter((item) => item.id !== reservation.id) ?? null)
      showToast('Reserva oficial eliminada')
    } catch {
      showToast('No se pudo eliminar la reserva.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 p-margin md:p-margin-tablet lg:p-margin-desktop">
      <div>
        <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">ADMINISTRACIÓN</span>
        <h1 className="mt-1 text-headline-md text-primary md:text-headline-lg">Reservas oficiales</h1>
        <p className="text-body-sm text-outline">Carga, corrige o elimina reservas extraordinarias de salas.</p>
      </div>

      <OfficialReservationsImport onImported={() => setVersion((value) => value + 1)} />

      <Panel title="Próximas reservas" icon="calendar_month">
        {reservations === null && !error ? (
          <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
        ) : error ? (
          <Alert variant="error">No se pudieron cargar las reservas.</Alert>
        ) : reservations?.length === 0 ? (
          <EmptyState icon="event_available" title="No hay reservas próximas" description="Carga un archivo JSON para comenzar." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-body-sm">
              <thead className="border-b border-outline-variant text-label-mono text-outline uppercase">
                <tr><th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Sala</th><th className="px-3 py-2">Módulos</th><th className="px-3 py-2">Motivo</th><th className="px-3 py-2 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {reservations?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-3 capitalize">{DATE.format(new Date(`${item.date}T12:00:00`))}</td>
                    <td className="px-3 py-3 font-bold text-primary">{item.roomName}</td>
                    <td className="px-3 py-3">{item.modules.map((module) => `M${module}`).join(', ')}</td>
                    <td className="px-3 py-3">{item.reason}</td>
                    <td className="px-3 py-3"><div className="flex justify-end gap-1">
                      <button type="button" onClick={() => setEditing(item)} aria-label={`Editar reserva de ${item.roomName}`} className="flex size-10 items-center justify-center rounded text-secondary hover:bg-surface-container"><Icon name="edit" /></button>
                      <button type="button" disabled={deletingId === item.id} onClick={() => void remove(item)} aria-label={`Eliminar reserva de ${item.roomName}`} className="flex size-10 items-center justify-center rounded text-error hover:bg-error-container"><Icon name="delete" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <EditReservationModal
        reservation={editing}
        onClose={() => setEditing(null)}
        onSaved={(updated) => {
          setReservations((rows) => rows?.map((item) => item.id === updated.id ? updated : item) ?? null)
          setEditing(null)
        }}
      />
    </div>
  )
}

function EditReservationModal({ reservation, onClose, onSaved }: {
  reservation: AdminOfficialReservation | null
  onClose: () => void
  onSaved: (reservation: AdminOfficialReservation) => void
}) {
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!reservation) return null
  const current = reservation

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSaving(true)
    setError(null)
    try {
      const updated = await updateOfficialReservation(current.id, {
        sala: String(data.get('room') ?? ''),
        fecha: String(data.get('date') ?? ''),
        modulos: String(data.get('modules') ?? ''),
        motivo: String(data.get('reason') ?? ''),
      })
      onSaved(updated)
      showToast('Reserva oficial actualizada')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No se pudo actualizar la reserva.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open title={`Editar reserva · ${current.roomName}`} icon="edit_calendar" onClose={onClose}>
      <form onSubmit={(event) => void submit(event)} className="space-y-4 p-5">
        {error && <Alert variant="error">{error}</Alert>}
        <TextField name="room" label="Sala" defaultValue={current.roomName} required />
        <TextField name="date" type="date" label="Fecha" defaultValue={current.date} required />
        <TextField name="modules" label="Módulos" defaultValue={current.modules.join(',')} hint='Ejemplo: "3-4" o "3,4"' required />
        <Textarea name="reason" label="Motivo" defaultValue={current.reason} maxLength={200} rows={3} required />
        <div className="flex justify-end gap-2 border-t border-surface-container-high pt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving} icon="save">Guardar cambios</Button>
        </div>
      </form>
    </Modal>
  )
}
