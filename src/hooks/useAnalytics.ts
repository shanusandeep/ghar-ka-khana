import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import * as gtag from '@/lib/gtag'

export const useAnalytics = () => {
  const location = useLocation()

  useEffect(() => {
    // Track page views
    gtag.pageview(location.pathname + location.search)
  }, [location])

  const trackEvent = (action: string, category: string, label: string, value?: number) => {
    gtag.event({ action, category, label, value })
  }

  return { trackEvent }
} 