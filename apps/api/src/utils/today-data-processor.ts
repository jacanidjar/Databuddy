/**
 * Utilities for merging today's real-time data with historical data
 */
import { getCurrentHourFormatted, isToday } from './analytics-helpers';


interface TodayData {
  pageviews: number;
  visitors: number;
  sessions: number;
  bounce_rate: number;
  avg_session_duration?: number;
  [key: string]: any;
}

/**
 * Merge today's data into the summary
 * NOTE: We don't need to add today's data to summary since it's already included
 * We only use this for display purposes
 */
export function mergeTodayDataIntoSummary(
  summaryData: any,
  todayData: TodayData | null
): any {
  if (!todayData) {
    return summaryData;
  }

  // Just return the original summary data - no need to add today's data
  // as it's already included in the summary query
  return {
    ...summaryData,
    // Keep a reference to today's data for UI display
    today: {
      pageviews: todayData.pageviews || 0,
      visitors: todayData.visitors || 0, 
      sessions: todayData.sessions || 0,
      bounce_rate: todayData.bounce_rate || 0
    }
  };
}

/**
 * Update events by date to include today's data
 * We need to either replace or add today's entry, but NOT add to existing entry
 */
export function updateEventsWithTodayData(
  eventsByDate: any[],
  todayData: TodayData | null,
  granularity: 'hourly' | 'daily' = 'daily'
): any[] {
  if (!todayData) {
    return eventsByDate;
  }

  const updatedEvents = [...eventsByDate];
  const today = new Date().toISOString().split('T')[0];
  const currentHour = getCurrentHourFormatted();

  // Determine date field name based on the first entry in the events array
  // This could be 'date' or 'date_range.date' depending on the SQL builder output
  const dateField = eventsByDate.length > 0 && 'date_range.date' in eventsByDate[0] 
    ? 'date_range.date' 
    : 'date';

  // Create today's stats object
  const todayStats = {
    [dateField]: granularity === 'hourly' ? currentHour : today,
    pageviews: todayData.pageviews || 0,
    unique_visitors: todayData.visitors || 0,
    visitors: todayData.visitors || 0, // Use both field names for consistency
    sessions: todayData.sessions || 0,
    bounce_rate: todayData.bounce_rate || 0,
  };

  // Check if today exists in eventsByDate, checking both possible date field names
  const todayIndex = updatedEvents.findIndex(day => {
    // Check both possible field names for today's date
    const dateValue = day[dateField] || day.date;
    if (granularity === 'hourly') {
      return dateValue === currentHour;
    }
    return dateValue === today;
  });

  if (todayIndex >= 0) {
    // Replace existing entry with today's data
    // We don't add to the existing entry as that would count today twice
    updatedEvents[todayIndex] = todayStats;
  } else {
    // Add today if it doesn't exist
    updatedEvents.push(todayStats);
  }

  return updatedEvents;
}

/**
 * Merge today's data into trend data results
 * We need to replace today's entry, not add to it
 */
export function mergeTodayIntoTrends(
  trendData: any[],
  todayData: TodayData | null,
  granularity: 'hourly' | 'daily'
): any[] {
  if (!todayData) {
    return trendData;
  }

  return trendData.map(entry => {
    const entryDateString = entry.date.toString();
    const currentHour = getCurrentHourFormatted();
    
    // Check if this entry corresponds to today
    if ((granularity === 'daily' && isToday(entryDateString)) ||
        (granularity === 'hourly' && entryDateString === currentHour)) {
      
      // Replace with today's data, not add to it
      return {
        ...entry,
        pageviews: todayData.pageviews || 0,
        unique_visitors: todayData.visitors || 0,
        visitors: todayData.visitors || 0,
        sessions: todayData.sessions || 0,
        bounce_rate: todayData.bounce_rate || 0,
      };
    }
    
    return entry;
  });
}