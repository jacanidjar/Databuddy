import type { ParameterBuilder } from '../types'
import { deviceBuilders } from './device'
import { geographyBuilders } from './geography'
import { pageBuilders } from './pages'
import { utmBuilders } from './utm'

export const aliasBuilders: Record<string, ParameterBuilder> = {
  // Aliases for backward compatibility and convenience
  browser_versions: deviceBuilders.browser_name,
  device_types: deviceBuilders.device_type,
  exit_pages: pageBuilders.exit_page,
  top_referrers: utmBuilders.referrer,
  utm_sources: utmBuilders.utm_source,
  utm_mediums: utmBuilders.utm_medium,
  utm_campaigns: utmBuilders.utm_campaign,
  
  // Legacy aliases
  pages: pageBuilders.top_pages,
  countries: geographyBuilders.country,
  devices: deviceBuilders.device_type,
  browsers: deviceBuilders.browser_name,
  operating_systems: deviceBuilders.os_name,
  regions: geographyBuilders.region,
  screen_resolutions: deviceBuilders.screen_resolution,
  connection_types: deviceBuilders.connection_type,
} 