import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Header from './components/Header'
import Table from './components/Table'

import type { DataCenter, DataCenterFormData, DataCenterStats } from './types/DataCenter'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const defaultForm: DataCenterFormData = {
  dataCenter: '',
  temperature: 24,
  sector: '',
  room: '',
  tags: [],
  rack: '',
  humidity: 45,
}

function App() {
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([])
  const [stats, setStats] = useState<DataCenterStats | null>(null)
  const [formData, setFormData] = useState<DataCenterFormData>(defaultForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filterTag, setFilterTag] = useState('')
  const [filterSector, setFilterSector] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function request<T>(path: string, options?: RequestInit) {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new Error(body?.details || body?.error || 'Nao foi possivel completar a acao')
    }

    if (response.status === 204) {
      return null as T
    }

    return response.json() as Promise<T>
  }

  async function loadDataCenters(filters = { sector: filterSector, tag: filterTag }) {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      if (filters.sector) {
        params.set('sector', filters.sector)
      }

      if (filters.tag) {
        params.set('tag', filters.tag)
      }

      const query = params.toString()
      const data = await request<DataCenter[]>(`/datacenters${query ? `?${query}` : ''}`)
      setDataCenters(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadStats() {
    const data = await request<DataCenterStats>('/datacenters/stats')
    setStats(data)
  }

  async function refreshData() {
    await Promise.all([loadDataCenters(), loadStats()])
  }

  useEffect(() => {
    refreshData().catch((err) => {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setIsLoading(false)
    })
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const payload = {
      dataCenter: formData.dataCenter,
      temperature: Number(formData.temperature),
      sector: formData.sector,
      room: formData.room,
      tags: formData.tags,
      metadata: {
        rack: formData.rack,
        humidity: Number(formData.humidity),
        sensors: [
          {
            name: `${formData.dataCenter || 'sensor'}-temp`,
            status: Number(formData.temperature) >= 35 ? 'critical' : 'ok',
          },
        ],
      },
    }

    try {
      if (editingId) {
        await request<DataCenter>(`/datacenters/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      } else {
        await request<DataCenter>('/datacenters', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }

      setFormData(defaultForm)
      setEditingId(null)
      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    }
  }

  function handleEdit(row: DataCenter) {
    setEditingId(row.id)
    setFormData({
      dataCenter: row.dataCenter,
      temperature: row.temperature,
      sector: row.sector,
      room: row.room,
      tags: row.tags || [],
      rack: row.metadata?.rack ?? '',
      humidity: row.metadata?.humidity ?? 45,
    })
  }

  async function handleDelete(id: number) {
    setError(null)

    try {
      await request<null>(`/datacenters/${id}`, { method: 'DELETE' })
      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    }
  }

  return (
    <>
      <Header />
      <main className="container py-4">
        <section className="mb-4">
          <form className="row g-3 align-items-end" onSubmit={handleSubmit}>
            <div className="col-12 col-md-3">
              <label className="form-label" htmlFor="dataCenter">Data center</label>
              <input
                id="dataCenter"
                className="form-control"
                value={formData.dataCenter}
                onChange={(event) => setFormData({ ...formData, dataCenter: event.target.value })}
                required
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label" htmlFor="temperature">Temperatura</label>
              <input
                id="temperature"
                className="form-control"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(event) => setFormData({ ...formData, temperature: Number(event.target.value) })}
                required
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label" htmlFor="sector">Setor</label>
              <input
                id="sector"
                className="form-control"
                value={formData.sector}
                onChange={(event) => setFormData({ ...formData, sector: event.target.value })}
                required
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label" htmlFor="room">Sala</label>
              <input
                id="room"
                className="form-control"
                value={formData.room}
                onChange={(event) => setFormData({ ...formData, room: event.target.value })}
                required
              />
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label" htmlFor="tags">Tags</label>
              <input
                id="tags"
                className="form-control"
                value={formData.tags.join(', ')}
                onChange={(event) => setFormData({
                  ...formData,
                  tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean),
                })}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label" htmlFor="rack">Rack</label>
              <input
                id="rack"
                className="form-control"
                value={formData.rack}
                onChange={(event) => setFormData({ ...formData, rack: event.target.value })}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label" htmlFor="humidity">Umidade</label>
              <input
                id="humidity"
                className="form-control"
                type="number"
                value={formData.humidity}
                onChange={(event) => setFormData({ ...formData, humidity: Number(event.target.value) })}
              />
            </div>

            <div className="col-12 col-md-4 d-flex gap-2">
              <button className="btn btn-primary" type="submit">
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData(defaultForm)
                }}
              >
                Limpar
              </button>
            </div>
          </form>
        </section>

        <section className="row g-3 mb-4 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="filterSector">Filtrar por setor</label>
            <input
              id="filterSector"
              className="form-control"
              value={filterSector}
              onChange={(event) => setFilterSector(event.target.value)}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="filterTag">Filtrar por tag</label>
            <input
              id="filterTag"
              className="form-control"
              value={filterTag}
              onChange={(event) => setFilterTag(event.target.value)}
            />
          </div>

          <div className="col-12 col-md-4">
            <button className="btn btn-dark me-2" type="button" onClick={loadDataCenters}>
              Aplicar filtros
            </button>
            <button
              className="btn btn-outline-dark"
              type="button"
              onClick={() => {
                setFilterSector('')
                setFilterTag('')
                loadDataCenters({ sector: '', tag: '' })
              }}
            >
              Remover filtros
            </button>
          </div>
        </section>

        {error && <p className="alert alert-danger text-center">{error}</p>}
        {isLoading && <p className="text-center">Carregando data centers...</p>}
        {!isLoading && !error && (
          <Table rows={dataCenters} onEdit={handleEdit} onDelete={handleDelete}></Table>
        )}

        {stats && (
          <section className="row g-3 mt-3">
            <div className="col-12 col-lg-4">
              <h2 className="h5">Media por setor</h2>
              <ul className="list-group">
                {stats.setores.map((setor) => (
                  <li className="list-group-item" key={setor.sector}>
                    {setor.sector}: {setor.averageTemperature} C ({setor.total})
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-12 col-lg-4">
              <h2 className="h5">Tags agregadas</h2>
              <ul className="list-group">
                {stats.tags.map((tag) => (
                  <li className="list-group-item" key={tag.tag}>
                    {tag.tag}: {tag.total}
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-12 col-lg-4">
              <h2 className="h5">Sensores JSONB</h2>
              <ul className="list-group">
                {stats.sensores.map((sensor) => (
                  <li className="list-group-item" key={`${sensor.dataCenter}-${sensor.sensor}`}>
                    {sensor.dataCenter}: {sensor.sensor} ({sensor.status})
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </>
  )
}

export default App
