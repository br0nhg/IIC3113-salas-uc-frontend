import { useOutletContext } from 'react-router-dom'

/** Contexto que AdminLayout entrega a las páginas de la consola. */
export interface AdminOutletContext {
  /** Vuelve a contar los reportes pendientes (insignia del menú). */
  refreshOpenReports: () => void
}

export function useAdminOutlet(): AdminOutletContext {
  return useOutletContext<AdminOutletContext>()
}
