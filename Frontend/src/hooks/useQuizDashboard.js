import { useEffect, useState } from 'react'
import { getQuizDashboard } from '../lib/api'

export default function useQuizDashboard(backendStatus, enabled = true) {
  const [dashboard, setDashboard] = useState(null)
  const [dashboardError, setDashboardError] = useState('')
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    if (!enabled || backendStatus !== 'connected') {
      setDashboard(null)
      setDashboardError('')
      setIsDashboardLoading(false)
      return () => {
        ignore = true
      }
    }

    const loadDashboard = async () => {
      setIsDashboardLoading(true)
      setDashboardError('')

      try {
        const response = await getQuizDashboard()
        if (!ignore) {
          setDashboard(response)
        }
      } catch (error) {
        if (!ignore) {
          setDashboard(null)
          setDashboardError(error.message ?? "Le tableau de bord n a pas pu etre charge.")
        }
      } finally {
        if (!ignore) {
          setIsDashboardLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      ignore = true
    }
  }, [backendStatus, enabled])

  return {
    dashboard,
    dashboardError,
    isDashboardLoading,
  }
}
