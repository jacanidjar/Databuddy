'use server';

import { z } from 'zod';
import { chQuery, db, eq, websites } from '@databuddy/db';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { cacheable } from '@databuddy/redis';

const openrouter = createOpenRouter({
    apiKey: process.env.AI_API_KEY,
  });

const AnalyticsSchema = {
  columns: [
    { name: 'client_id', type: 'String', description: 'Website identifier' },
    { name: 'event_name', type: 'String', description: 'Type of event (screen_view, page_exit, etc)' },
    { name: 'time', type: 'DateTime64', description: 'Event timestamp' },
    { name: 'path', type: 'String', description: 'URL path of the page' },
    { name: 'title', type: 'String', description: 'Page title' },
    { name: 'referrer', type: 'String', description: 'Referrer URL' },
    { name: 'country', type: 'String', description: 'User country' },
    { name: 'browser_name', type: 'String', description: 'Browser name' },
    { name: 'os_name', type: 'String', description: 'Operating system' },
    { name: 'device_type', type: 'String', description: 'Device type (desktop, mobile, tablet)' },
    { name: 'utm_source', type: 'String', description: 'UTM source parameter' },
    { name: 'utm_medium', type: 'String', description: 'UTM medium parameter' },
    { name: 'utm_campaign', type: 'String', description: 'UTM campaign parameter' },
    { name: 'session_id', type: 'String', description: 'User session identifier' },
    { name: 'anonymous_id', type: 'String', description: 'Anonymous user identifier' },
    { name: 'time_on_page', type: 'Float32', description: 'Time spent on page in seconds' },
    { name: 'scroll_depth', type: 'Float32', description: 'Page scroll depth percentage' },
    { name: 'is_bounce', type: 'UInt8', description: 'Whether this was a bounce (1) or not (0)' },
    { name: 'load_time', type: 'Int32', description: 'Page load time in milliseconds' },
    { name: 'ttfb', type: 'Int32', description: 'Time to first byte in milliseconds' }
  ]
};

const AIRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  websiteId: z.string().min(1),
  context: z.object({
    previousMessages: z.array(z.any()).optional(),
    dateRange: z.any().optional()
  }).optional()
});

const AIResponseJsonSchema = z.object({
    sql: z.string(),
    chart_type: z.enum(['bar', 'line', 'pie', 'area', 'stacked_bar', 'multi_line'])
});

// This schema is for the final structure yielded by the streaming function
const FinalAIResponseSchema = z.object({
  hasVisualization: z.boolean(),
  chartType: z.enum(['bar', 'line', 'pie', 'area', 'stacked_bar', 'multi_line']).optional(),
  data: z.array(z.record(z.any())).optional(),
});

export interface StreamingUpdate {
  type: 'thinking' | 'progress' | 'complete' | 'error';
  content: string;
  data?: any;
  debugInfo?: Record<string, any>;
}

function validateSQL(sql: string): boolean {
  const forbiddenKeywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'EXEC', 'UNION'];
  const upperSQL = sql.toUpperCase();
  
  for (const keyword of forbiddenKeywords) {
    if (upperSQL.includes(keyword)) return false;
  }
  
  return upperSQL.trim().startsWith('SELECT');
}

// === DEBUG HELPERS ===
function debugLog(step: string, data: any) {
  console.log(`🔍 [AI-Assistant] ${step}:`, JSON.stringify(data, null, 2));
}

function createThinkingStep(step: string): string {
  return `🧠 ${step}`;
}

const enhancedAnalysisPrompt = (userQuery: string, websiteId: string, websiteHostname: string) => `
You are DataBuddy AI - an advanced analytics assistant that creates optimal SQL queries and visualizations.

USER QUERY: "${userQuery}";
WEBSITE ID: ${websiteId};
WEBSITE HOSTNAME: ${websiteHostname};

DATABASE SCHEMA:
${JSON.stringify(AnalyticsSchema.columns.map(col => ({name: col.name, type: col.type, description: col.description})), null, 2)};

RESPONSE FORMAT (JSON - ONLY THIS, NO EXTRA TEXT OR MARKDOWN):
{
  "sql": "SELECT ... FROM analytics.events WHERE client_id = '${websiteId}' AND ...",
  "chart_type": "bar" | "line" | "pie" | "area" | "stacked_bar" | "multi_line"
}

CHART TYPE SELECTION GUIDE:
- "line": Single metric over time (e.g., total pageviews by day). Use if the focus is on the trend of one continuous value.;
- "area": Similar to line, but emphasizes volume. Good for a single metric over time.;
- "multi_line": For comparing trends of 2 or more categories (e.g., different browsers, device types) over a continuous time dimension. Best if there are many time points or more than 3-4 categories. Example: Page load times for Safari, Chrome, Firefox shown as separate lines over a date range.;
- "stacked_bar": Use for comparing a few categories (typically 2-4, e.g., mobile vs. desktop) over a time dimension (e.g., daily, hourly). This shows both individual contributions and their total at each time point. If the user requests a "bar chart" for a time-based comparison of a few categories, prefer "stacked_bar". Also suitable for showing parts-of-a-whole for several main categories (e.g., traffic sources per country, where each country is a bar stack).;
- "bar": For simple categorical comparisons NOT over a continuous time series (e.g., total pageviews per country, top 5 referrers). Use this if the x-axis is categorical and not time.;
- "pie": For part-of-whole relationships for a single point in time or aggregated data with a few (2-5) segments. Avoid for time series or many categories.;

ADVANCED QUERY PATTERNS:
1. Time series with categories (for multi-line or stacked_bar charts):
   Query: "[METRIC] by [CATEGORY_DIMENSION] over [TIME_DIMENSION]" (e.g., "pageviews by device type per day", "page load times by browser over time");
   SQL: SELECT toDate(time) AS date, [CATEGORY_DIMENSION_COLUMN], AGGREGATE([METRIC_COLUMN]) AS metric_value FROM analytics.events WHERE client_id = '${websiteId}' ... GROUP BY date, [CATEGORY_DIMENSION_COLUMN] ORDER BY date, [CATEGORY_DIMENSION_COLUMN];
   Chart Type Decision:
     - If 2-4 categories AND user query hints at "bar" or comparison is direct (e.g., "mobile vs desktop"): "stacked_bar";
     - Otherwise (many categories, many time points, or general trend comparison): "multi_line";
   Example for "mobile vs desktop pageviews by day" (prefer stacked_bar):
     SQL: SELECT toDate(time) AS date, device_type, COUNT(*) AS pageviews FROM analytics.events WHERE client_id = '${websiteId}' AND device_type IN ('mobile', 'desktop') AND event_name = 'screen_view' GROUP BY date, device_type ORDER BY date, device_type;
     Chart Type: "stacked_bar";

2. Comparative analysis (typically bar - if not over time, or stacked_bar - if one dimension is time):
   Example: "traffic sources by device" (not over time) → GROUP BY referrer, device_type (Could be complex; simplify or use a bar chart for top referrers, with device breakdown in explanation or a secondary chart if possible. If this implies a breakdown for *each* referrer by device, and there are many referrers, this is too complex for a single chart. Focus on top-level summary.);
   SQL for Top Referrers: SELECT referrer, COUNT(*) AS pageviews FROM analytics.events WHERE client_id = '${websiteId}' AND event_name='screen_view' AND referrer IS NOT NULL AND referrer != '' AND (domain(referrer) != '${websiteHostname}' AND NOT domain(referrer) ILIKE '%.${websiteHostname}') AND domain(referrer) NOT IN ('localhost', '127.0.0.1') GROUP BY referrer ORDER BY pageviews DESC LIMIT 10;
   Chart Type: "bar";

3. Performance metrics:
   Example: "average page load times daily" → AVG(load_time) GROUP BY toDate(time) (Chart: "line");
   Example: "page load times by browser daily" → (Use pattern 1 above. Chart: "multi_line" or "stacked_bar" depending on number of browsers and desired emphasis);

4. Trend analysis (single metric over time):
   Example: "hourly traffic patterns for today" → SELECT toHour(time) as hour, COUNT(*) as pageviews FROM analytics.events WHERE client_id = '${websiteId}' AND event_name='screen_view' AND toDate(time) = today() GROUP BY hour ORDER BY hour (Chart: "line");

SQL OPTIMIZATION RULES:
1. ALWAYS include WHERE client_id = '${websiteId}' (exact value, not placeholder).;
2. Use 'screen_view' events for general traffic, visitor, page view, and session analysis unless the query specifies other event types.;
3. For "traffic sources" or "referrers" queries, prioritize SELECTING and GROUPING BY the raw 'referrer' field. 
   Filter out STRICTLY:
     a) Empty or null referrers (e.g., \`referrer IS NOT NULL AND referrer != ''\`). Do NOT include these as "Direct" in top referrer lists unless the user explicitly asks for "direct traffic".
     b) Internal referrers: referrers where the domain of the 'referrer' URL is the website's own domain (use '${websiteHostname}'). Use a condition like \`(domain(referrer) != '${websiteHostname}' AND NOT domain(referrer) ILIKE '%.${websiteHostname}')\`. Also explicitly exclude common local/dev domains using \`domain(referrer) NOT IN ('localhost', '127.0.0.1')\`
   If the user specifically asks for "direct traffic", then generate a query for \`(referrer IS NULL OR referrer = '')\`
   If UTM specific dimensions are requested, then use utm_source, utm_medium etc. 
   Example for Top Referrers (excluding internal, direct, and empty/null):
     SQL: SELECT referrer, COUNT(*) AS pageviews FROM analytics.events WHERE client_id = '${websiteId}' AND event_name='screen_view' AND referrer IS NOT NULL AND referrer != '' AND (domain(referrer) != '${websiteHostname}' AND NOT domain(referrer) ILIKE '%.${websiteHostname}') AND domain(referrer) NOT IN ('localhost', '127.0.0.1') GROUP BY referrer ORDER BY pageviews DESC LIMIT 10;
   (Client-side Note: The application will handle normalization of displayed referrer names, e.g., mapping various domains like 't.co', 'twitter.com' to a single 'Twitter / X' and applying icons. Your SQL should provide raw referrer data.)
4. When a date range (e.g., "last 7 days", "this month") is implied or stated, apply it to the 'time' column. Default to 'last 7 days' if unspecified. Query examples: \`time >= today() - INTERVAL '7' DAY\`, \`time >= date_trunc('month', today()) AND time < date_trunc('month', today()) + INTERVAL '1' MONTH\`;
5. Use toDate(time) AS date for daily grouping, toHour(time) AS hour for hourly grouping. Always alias the time grouping (e.g., AS date, AS hour).;
6. LIMIT results (e.g., LIMIT 100 for raw data, LIMIT 20-30 for aggregated time series unless many categories for multi-line) to keep visualizations readable and queries performant. For multi-line or stacked_bar charts with categories over time, a typical limit might be 7-14 distinct time points (e.g., days) if there are 2-3 categories, or up to 30 time points if only 1-2 categories. If categories are many (e.g. >5 browsers), limit time points further.;
7. Use meaningful column aliases for ALL aggregated fields and dimensions (e.g., AVG(load_time) AS avg_load_time, browser_name AS browser, device_type AS device).;
8. For multi-dimensional data intended for multi-line or stacked_bar charts, ensure the SQL query returns three key pieces of information: the time dimension (e.g., date), the category dimension (e.g., browser_name, device_type), and the metric value (e.g., pageviews, avg_load_time).;

ADVANCED SQL TECHNIQUES:
- CASE statements for custom categorization.;
- Multiple GROUP BY for cross-dimensional analysis.;
- Date functions: toDate(), toHour(), toWeek(), toStartOfMonth(), now(), today(), date_trunc(). Remember interval syntax: \`INTERVAL '7' DAY\`;
- Conditional aggregation: countIf(), avgIf().;
- String functions for URL/referrer analysis: domain(), extractHostname(), cutToFirstSignificantSubdomain(), etc.;

Return only valid JSON, no markdown or extra text. Ensure SQL is a single line string if possible, otherwise properly escaped. Ensure the SQL uses correct ClickHouse syntax. Use \`ILIKE\` for case-insensitive string matching if needed on user-provided filter values.;
`;

export async function* processAIRequestStreaming(input: unknown): AsyncGenerator<StreamingUpdate> {
  const startTime = Date.now();
  const debugInfo: Record<string, any> = {};
  
  try {
    yield { type: 'thinking', content: createThinkingStep("Analyzing your analytics request...") };
    
    const validatedInput = AIRequestSchema.parse(input);
    const { message, websiteId } = validatedInput;

    const getWebsite = cacheable(async () => {
      return db.query.websites.findFirst({
        where: eq(websites.id, websiteId),
      });
    }, {
      prefix: `website:${websiteId}`,
      expireInSec: 60 * 60 * 15,
      staleWhileRevalidate: true,
      staleTime: 60 * 60 * 15,
      maxRetries: 3
    });
    const website = await getWebsite();

    if (!website) {
      yield { type: 'error', content: "Website not found.", debugInfo };
      return;
    }
    
    const websiteHostname = website.domain;
    
    debugLog("✅ Input validated", { message, websiteId, websiteHostname });
    debugInfo.validatedInput = { message, websiteId, websiteHostname };
    
    yield { type: 'thinking', content: createThinkingStep("Generating optimized query and visualization...") };
    
    const aiStart = Date.now();
    const { text: aiResponseText } = await generateText({
      model: openrouter('google/gemini-2.0-flash-001'),
      prompt: enhancedAnalysisPrompt(message, websiteId, websiteHostname),
      temperature: 0.1,
    });
    const aiTime = Date.now() - aiStart;
    
    debugLog("📝 Raw AI JSON response", { aiResponseText, timeTaken: `${aiTime}ms` });
    
    let parsedAiJson: z.infer<typeof AIResponseJsonSchema>;
    try {
      const cleanedResponse = aiResponseText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      parsedAiJson = AIResponseJsonSchema.parse(JSON.parse(cleanedResponse));
      debugLog("✅ AI JSON response parsed", parsedAiJson);
    } catch (parseError) {
      debugLog("❌ AI JSON parsing failed", { error: parseError, rawText: aiResponseText });
      yield { type: 'error', content: "AI response parsing failed. Please try rephrasing.", debugInfo };
      return;
    }
    
    yield { type: 'thinking', content: createThinkingStep("Executing database query...") };
    
    const sql = parsedAiJson.sql;
    if (!validateSQL(sql)) {
      yield { type: 'error', content: "Generated query failed security validation.", debugInfo };
      return;
    }
    
    try {
      const queryStart = Date.now();
      const queryData = await chQuery(sql);
      const queryTime = Date.now() - queryStart;
      const totalTime = Date.now() - startTime;
      
      debugLog("✅ Query executed successfully", { 
        resultCount: queryData.length, 
        timeTaken: `${queryTime}ms`,
        totalTime: `${totalTime}ms`,
        sampleData: queryData.slice(0, 3)
      });
      
      debugInfo.processing = { aiTime, queryTime, totalTime };
      
      const finalContent = queryData.length > 0 
        ? `Found ${queryData.length} data points. Displaying as a ${parsedAiJson.chart_type.replace(/_/g, ' ')} chart.`
        : "No data found for your query.";
      
      yield { 
        type: 'complete', 
        content: finalContent,
        data: {
          hasVisualization: queryData.length > 0,
          chartType: parsedAiJson.chart_type,
          data: queryData
        },
        debugInfo
      };
      
    } catch (queryError: any) {
      debugLog("❌ SQL execution error", { error: queryError.message, sql });
      yield { type: 'error', content: "Database query failed. The data might not be available.", debugInfo };
    }
    
  } catch (error: any) {
    debugLog("💥 Processing error", { error: error.message });
    if (error instanceof z.ZodError) {
        yield { type: 'error', content: `Invalid input: ${error.errors.map(e => e.message).join(', ')}`, debugInfo };
    } else {
        yield { type: 'error', content: "An unexpected error occurred.", debugInfo: { error: error.message } };
    }
  }
}