import { useEffect, useState } from 'react'
import Header from './components/Header'
import Table from './components/Table'

import type { DataCenter } from './types/DataCenter'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function App() {

  const [dataCenters, setDataCenters] = useState<DataCenter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDataCenters() {
      try {
        const response = await fetch(`${API_URL}/datacenters`)

        if (!response.ok) {
          throw new Error('Nao foi possivel carregar os data centers')
        }

        const data = await response.json() as DataCenter[]
        setDataCenters(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro inesperado')
      } finally {
        setIsLoading(false)
      }
    }

    loadDataCenters()
  }, [])

  return (
    <>
      <Header/>
      <main className="container py-4">
        {isLoading && <p className="text-center">Carregando data centers...</p>}
        {error && <p className="alert alert-danger text-center">{error}</p>}
        {!isLoading && !error && <Table rows={dataCenters}></Table>}
      </main>
    </>
  )
}

export default App
