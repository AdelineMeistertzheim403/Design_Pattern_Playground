import { useEffect, useState } from 'react'
import { getRecentActivity } from '../lib/api'

export default function useRecentActivity(backendStatus, enabled = true, limit = 30) {
  const [activity, setActivity] = useState([])
  const [activityError, setActivityError] = useState('')
  const [isActivityLoading, setIsActivityLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    if (!enabled || backendStatus !== 'connected') {
      setActivity([])
      setActivityError('')
      setIsActivityLoading(false)
      return () => {
        ignore = true
      }
    }

    const loadActivity = async () => {
      setIsActivityLoading(true)
      setActivityError('')

      try {
        const response = await getRecentActivity(limit)
        if (!ignore) {
          setActivity(response.items ?? [])
        }
      } catch (error) {
        if (!ignore) {
          setActivity([])
          setActivityError(error.message ?? "L activite recente n a pas pu etre chargee.")
        }
      } finally {
        if (!ignore) {
          setIsActivityLoading(false)
        }
      }
    }

    loadActivity()

    return () => {
      ignore = true
    }
  }, [backendStatus, enabled, limit])

  return {
    activity,
    activityError,
    isActivityLoading,
  }
}
