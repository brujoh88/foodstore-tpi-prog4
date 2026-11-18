import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError, SkeletonFilas } from '@/shared/components/Estados'
import { TablaDatos } from '@/shared/components/TablaDatos'
import { Badge } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useUsuarioMutations, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types/usuario'

export const AdminUsuariosPage = () => {
  const { data = [], isPending, isError, error, refetch } = useUsuarios()
  const { activar, desactivar } = useUsuarioMutations()
  const yo = useAuthStore((s) => s.usuario?.id)
  const [busqueda, setBusqueda] = useState('')

  const columnas = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: 'username', header: 'Usuario' },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ getValue }) => (getValue<string>() === 'admin' ? <Badge color="ambar">admin</Badge> : 'user'),
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: ({ getValue }) => (getValue<boolean>() ? <Badge color="gris">Desactivado</Badge> : <Badge color="verde">Activo</Badge>),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original
          // El admin no puede desactivarse a sí mismo: en su fila no aparece el botón.
          if (u.id === yo) return <span className="text-xs text-stone-400">Sesión actual</span>
          return u.disabled ? (
            <Button variante="secundario" tamano="sm" disabled={activar.isPending} onClick={() => activar.mutate(u.id)}>
              Activar
            </Button>
          ) : (
            <Button
              variante="texto"
              tamano="sm"
              className="text-red-600 hover:bg-red-50"
              disabled={desactivar.isPending}
              onClick={() => desactivar.mutate(u.id)}
            >
              Desactivar
            </Button>
          )
        },
      },
    ],
    [yo, activar, desactivar],
  )

  const table = useReactTable({
    data,
    columns: columnas,
    state: { globalFilter: busqueda },
    onGlobalFilterChange: setBusqueda,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const errorMutacion = activar.error ?? desactivar.error

  return (
    <section className="flex flex-col gap-4">
      <h1 className="titulo-pagina">Usuarios</h1>
      <p className="text-sm text-stone-500">
        Un usuario desactivado no puede iniciar sesión, y si tenía una abierta deja de funcionar en su próxima acción.
      </p>
      {errorMutacion && (
        <p role="alert" className="alerta-error">
          {handleApiError(errorMutacion)}
        </p>
      )}
      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        <TablaDatos table={table} textoBusqueda="Buscar usuario, nombre o email…" mensajeVacio="No hay usuarios." />
      )}
    </section>
  )
}
