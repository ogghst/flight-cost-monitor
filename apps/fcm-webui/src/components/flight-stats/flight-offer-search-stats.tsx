import { FlightSegment } from '@fcm/shared/amadeus/clients/flight-offer'
import type {
  FlightOfferResultDto,
  FlightOfferSearchDto,
} from '@fcm/shared/flight-offer-search'
import DownloadIcon from '@mui/icons-material/Download'
import FilterListIcon from '@mui/icons-material/FilterList'
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import React, { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'

interface FilterState {
  dateRange: {
    start: Dayjs | null
    end: Dayjs | null
  }
  carriers: string[]
  priceRange: {
    min: number | ''
    max: number | ''
  }
  routes: Array<{
    origin: string
    destination: string
  }>
  segmentCount: {
    min: number | ''
    max: number | ''
  }
}

interface RouteStats {
  origin: string
  destination: string
  count: number
  avgPrice: number
}

interface CarrierStats {
  carrier: string
  count: number
  avgPrice: number
}

interface SegmentStats {
  segments: number
  count: number
  avgPrice: number
}

interface SegmentDistribution {
  name: string
  value: number
  avgPrice: number
}

interface Statistics {
  totalSearches: number
  totalResults: number
  avgResultsPerSearch: number
  avgPrice: number
  minPrice: number
  maxPrice: number
  avgSearchTime: number
  topCarriers: CarrierStats[]
  topRoutes: RouteStats[]
  segmentDistribution: SegmentDistribution[]
}

interface FilterOptions {
  carriers: string[]
  routes: Array<{
    origin: string
    destination: string
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

const FlightOfferSearchStats: React.FC<{
  searches: FlightOfferSearchDto[]
}> = ({ searches }) => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: null, end: null },
    carriers: [],
    priceRange: { min: '', max: '' },
    routes: [],
    segmentCount: { min: '', max: '' },
  })

  const filterOptions = useMemo((): FilterOptions => {
    const carriers = new Set<string>()
    const routes = new Set<string>()

    searches.forEach((search: FlightOfferSearchDto) => {
      search.results.forEach((result: FlightOfferResultDto) => {
        carriers.add(result.validatingCarrier)
        result.segments.forEach((segment: FlightSegment) => {
          routes.add(
            `${segment.departure.iataCode}-${segment.arrival.iataCode}`
          )
        })
      })
    })

    return {
      carriers: Array.from(carriers),
      routes: Array.from(routes).map((route: string) => {
        const [origin = 'Unknown', destination = 'Unknown'] = route.split('-')
        return { origin, destination }
      }),
    }
  }, [searches])

  const statistics = useMemo((): Statistics => {
    // Filter searches based on date range
    const filteredSearches = searches.filter((search: FlightOfferSearchDto) => {
      if (!filters.dateRange.start && !filters.dateRange.end) return true

      const searchDate = dayjs(search.updatedAt)
      const afterStart =
        !filters.dateRange.start ||
        searchDate.isAfter(filters.dateRange.start) ||
        searchDate.isSame(filters.dateRange.start)
      const beforeEnd =
        !filters.dateRange.end ||
        searchDate.isBefore(filters.dateRange.end) ||
        searchDate.isSame(filters.dateRange.end)
      return afterStart && beforeEnd
    })

    // Filter and analyze results
    const results = filteredSearches.flatMap((search: FlightOfferSearchDto) =>
      search.results.filter((result: FlightOfferResultDto) => {
        // Price filter
        const priceMatch =
          (!filters.priceRange.min || result.price >= filters.priceRange.min) &&
          (!filters.priceRange.max || result.price <= filters.priceRange.max)

        // Carrier filter
        const carrierMatch =
          filters.carriers.length === 0 ||
          filters.carriers.includes(result.validatingCarrier)

        // Route filter
        const routeMatch =
          filters.routes.length === 0 ||
          filters.routes.some((route) =>
            result.segments.some(
              (segment: FlightSegment) =>
                segment.departure.iataCode === route.origin &&
                segment.arrival.iataCode === route.destination
            )
          )

        // Segment count filter
        const segmentCount = result.segments.length
        const segmentMatch =
          (!filters.segmentCount.min ||
            segmentCount >= filters.segmentCount.min) &&
          (!filters.segmentCount.max ||
            segmentCount <= filters.segmentCount.max)

        return priceMatch && carrierMatch && routeMatch && segmentMatch
      })
    )

    // Calculate route statistics
    const routeStats = new Map<string, RouteStats>()
    const carrierStats = new Map<string, CarrierStats>()
    const segmentStats = new Map<number, SegmentStats>()

    results.forEach((result: FlightOfferResultDto) => {
      // Update carrier stats
      const carrier = result.validatingCarrier
      const existingCarrier = carrierStats.get(carrier) || {
        carrier,
        count: 0,
        avgPrice: 0,
      }
      existingCarrier.count++
      existingCarrier.avgPrice =
        (existingCarrier.avgPrice * (existingCarrier.count - 1) +
          result.price) /
        existingCarrier.count
      carrierStats.set(carrier, existingCarrier)

      // Update segment count stats
      const segmentCount = result.segments.length
      const existingSegmentStat = segmentStats.get(segmentCount) || {
        segments: segmentCount,
        count: 0,
        avgPrice: 0,
      }
      existingSegmentStat.count++
      existingSegmentStat.avgPrice =
        (existingSegmentStat.avgPrice * (existingSegmentStat.count - 1) +
          result.price) /
        existingSegmentStat.count
      segmentStats.set(segmentCount, existingSegmentStat)

      // Update route stats
      result.segments.forEach((segment: FlightSegment) => {
        const routeKey = `${segment.departure.iataCode}-${segment.arrival.iataCode}`
        const existingRoute = routeStats.get(routeKey) || {
          origin: segment.departure.iataCode,
          destination: segment.arrival.iataCode,
          count: 0,
          avgPrice: 0,
        }
        existingRoute.count++
        existingRoute.avgPrice =
          (existingRoute.avgPrice * (existingRoute.count - 1) + result.price) /
          existingRoute.count
        routeStats.set(routeKey, existingRoute)
      })
    })

    const searchTimes = filteredSearches.map((search: FlightOfferSearchDto) => {
      const created = new Date(search.createdAt)
      const updated = new Date(search.updatedAt)
      return updated.getTime() - created.getTime()
    })

    return {
      totalSearches: filteredSearches.length,
      totalResults: results.length,
      avgResultsPerSearch: results.length / filteredSearches.length || 0,
      avgPrice:
        results.reduce((sum, r) => sum + r.price, 0) / results.length || 0,
      minPrice: results.length ? Math.min(...results.map((r) => r.price)) : 0,
      maxPrice: results.length ? Math.max(...results.map((r) => r.price)) : 0,
      avgSearchTime: searchTimes.length
        ? searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length
        : 0,
      topCarriers: Array.from(carrierStats.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topRoutes: Array.from(routeStats.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      segmentDistribution: Array.from(segmentStats.values())
        .sort((a, b) => a.segments - b.segments)
        .map((stat) => ({
          name:
            stat.segments === 1
              ? 'Direct'
              : `${stat.segments - 1} stop${stat.segments > 2 ? 's' : ''}`,
          value: stat.count,
          avgPrice: stat.avgPrice,
        })),

      //carriers: Array.from(carrierStats.keys()),
      //routes: Array.from(routeStats.keys()).map((route: string) => {
      //  const [origin = 'Unknown', destination = 'Unknown'] = route.split('-')
      //  return { origin, destination }
      //}),
    }
  }, [searches, filters])

  const handleExport = (): void => {
    const data = {
      statistics,
      filters: {
        ...filters,
        dateRange: {
          start: filters.dateRange.start?.toISOString() || null,
          end: filters.dateRange.end?.toISOString() || null,
        },
      },
      exportDate: dayjs().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flight-stats-export.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  interface CustomTooltipProps {
    payload?: Array<{ payload: CarrierStats | SegmentDistribution }>
  }

  const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
    active,
    payload,
  }) => {
    if (!active || !payload || !payload[0]) return null

    const data = payload[0].payload
    if (!data) return null

    return (
      <Box className="bg-white p-2 border rounded shadow">
        <Typography variant="body2">
          {'carrier' in data
            ? `Carrier: ${data.carrier}`
            : `Segments: ${data.name}`}
        </Typography>
        <Typography variant="body2">
          Count: {'count' in data ? data.count : data.value}
        </Typography>
        <Typography variant="body2">
          Avg Price: ${data.avgPrice.toFixed(2)}
        </Typography>
      </Box>
    )
  }

  // Define the tooltip content function
  const renderTooltip = ({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>): React.ReactNode => {
    if (!active || !payload || !payload[0]) return null

    const data = payload[0].payload
    if (!data) return null

    return (
      <Box className="bg-white p-2 border rounded shadow">
        <Typography variant="body2">
          {'carrier' in data
            ? `Carrier: ${data.carrier}`
            : `Segments: ${data.name}`}
        </Typography>
        <Typography variant="body2">
          Count: {'count' in data ? data.count : data.value}
        </Typography>
        <Typography variant="body2">
          Avg Price: ${data.avgPrice.toFixed(2)}
        </Typography>
      </Box>
    )
  }

  return (
    <Card className="w-full">
      <CardContent>
        {/* Enhanced Filters Section */}
        <Box className="mb-6">
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            className="mb-4">
            <Typography variant="h6">
              <FilterListIcon className="inline mr-2" sx={{ fontSize: 20 }} />
              Filters
            </Typography>
            <Tooltip title="Export Stats">
              <IconButton onClick={handleExport}>
                <DownloadIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange.start}
                onChange={(newValue: Dayjs | null) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: newValue },
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date"
                value={filters.dateRange.end}
                onChange={(newValue: Dayjs | null) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: newValue },
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={filterOptions.carriers}
                value={filters.carriers}
                onChange={(_, newValue) =>
                  setFilters((prev) => ({
                    ...prev,
                    carriers: newValue,
                  }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Filter by Carriers" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={filterOptions.routes}
                value={filters.routes}
                onChange={(_, newValue) =>
                  setFilters((prev) => ({
                    ...prev,
                    routes: newValue,
                  }))
                }
                getOptionLabel={(option) =>
                  `${option.origin} → ${option.destination}`
                }
                renderInput={(params) => (
                  <TextField {...params} label="Filter by Routes" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Min Price"
                type="number"
                value={filters.priceRange.min}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    priceRange: {
                      ...prev.priceRange,
                      min: e.target.value === '' ? '' : Number(e.target.value),
                    },
                  }))
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Max Price"
                type="number"
                value={filters.priceRange.max}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    priceRange: {
                      ...prev.priceRange,
                      max: e.target.value === '' ? '' : Number(e.target.value),
                    },
                  }))
                }
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>

        {/* Statistics Display */}
        <Grid container spacing={3}>
          {/* Basic Stats Row */}
          <Grid item xs={12}>
            <Typography variant="h5" className="mb-4">
              Basic Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="subtitle2">Total Searches</Typography>
                  <Typography variant="h4">
                    {statistics.totalSearches}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="subtitle2">Total Results</Typography>
                  <Typography variant="h4">
                    {statistics.totalResults}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="subtitle2">
                    Average Results/Search
                  </Typography>
                  <Typography variant="h4">
                    {statistics.avgResultsPerSearch.toFixed(1)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="subtitle2">
                    Average Response Time
                  </Typography>
                  <Typography variant="h4">
                    {(statistics.avgSearchTime / 1000).toFixed(2)}s
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Price Statistics Row */}
          <Grid item xs={12}>
            <Typography variant="h5" className="mb-4">
              Price Analysis
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Box className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="subtitle2">Average Price</Typography>
                  <Typography variant="h4">
                    ${statistics.avgPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="subtitle2">Minimum Price</Typography>
                  <Typography variant="h4">
                    ${statistics.minPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="subtitle2">Maximum Price</Typography>
                  <Typography variant="h4">
                    ${statistics.maxPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Top Carriers Chart */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" className="mb-4">
              Top Carriers
            </Typography>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.topCarriers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="carrier" />
                  <YAxis />
                  <RechartsTooltip content={renderTooltip} />
                  <Bar dataKey="count" fill="#8884d8">
                    {statistics.topCarriers.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Grid>

          {/* Segment Distribution */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" className="mb-4">
              Segment Distribution
            </Typography>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.segmentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip content={renderTooltip} />
                  <Bar dataKey="value" fill="#00C49F">
                    {statistics.segmentDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Grid>

          {/* Popular Routes Chart */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" className="mb-4">
              Popular Routes
            </Typography>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.topRoutes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={(route) => `${route.origin}-${route.destination}`}
                  />
                  <YAxis />
                  <RechartsTooltip
                    content={({ payload }) => {
                      if (!payload?.[0]?.payload) return null
                      const route = payload[0].payload as RouteStats
                      return (
                        <Box className="bg-white p-2 border rounded shadow">
                          <Typography variant="body2">
                            Route: {route.origin}-{route.destination}
                          </Typography>
                          <Typography variant="body2">
                            Count: {route.count}
                          </Typography>
                          <Typography variant="body2">
                            Avg Price: ${route.avgPrice.toFixed(2)}
                          </Typography>
                        </Box>
                      )
                    }}
                  />
                  <Bar dataKey="count" fill="#FFB547">
                    {statistics.topRoutes.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Grid>

          {/* Price Trend Chart */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" className="mb-4">
              Price Distribution by Segments
            </Typography>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.segmentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 'auto']} />
                  <RechartsTooltip content={renderTooltip} />
                  <Bar dataKey="avgPrice" fill="#FF8042">
                    {statistics.segmentDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Grid>

          {/* New: Top Carriers Chart */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" className="mb-4">
              Top Carriers
            </Typography>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.topCarriers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="carrier" />
                  <YAxis />
                  <RechartsTooltip
                    content={({ payload }) => {
                      if (!payload?.[0]?.payload) return null
                      const data = payload[0].payload
                      return (
                        <Box className="bg-white p-2 border rounded shadow">
                          <Typography variant="body2">
                            Carrier: {data.carrier}
                          </Typography>
                          <Typography variant="body2">
                            Count: {data.count}
                          </Typography>
                          <Typography variant="body2">
                            Avg Price: ${data.avgPrice.toFixed(2)}
                          </Typography>
                        </Box>
                      )
                    }}
                  />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Grid>

          {/* Enhanced Segment Distribution */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" className="mb-4">
              Segment Distribution
            </Typography>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.segmentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip
                    content={({ payload }) => {
                      if (!payload?.[0]?.payload) return null
                      const data = payload[0].payload
                      return (
                        <Box className="bg-white p-2 border rounded shadow">
                          <Typography variant="body2">{data.name}</Typography>
                          <Typography variant="body2">
                            Count: {data.value}
                          </Typography>
                          <Typography variant="body2">
                            Avg Price: ${data.avgPrice.toFixed(2)}
                          </Typography>
                        </Box>
                      )
                    }}
                  />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default FlightOfferSearchStats
