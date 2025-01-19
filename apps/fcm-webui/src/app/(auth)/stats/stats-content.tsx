'use client'

import { getUserSearchById } from '@/app/actions/flight-search'
import { getUserSearches } from '@/app/actions/search'
import {
  BasicStats,
  CarriersChart,
  PriceEvolutionChart,
  RoutesChart,
  SegmentsChart,
} from '@/components/charts'
import {
  FlightOfferResultDto,
  FlightOfferSearchDto,
} from '@fcm/shared/flight-offer-search'
import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  Grid,
  Paper,
} from '@mui/material'
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export default function StatsContent() {
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null)

  const {
    data: searches,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userSearches'],
    queryFn: () => getUserSearches(),
  })

  const { data: searchDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['searchDetails', selectedSearchId],
    queryFn: async () => {
      if (selectedSearchId) {
        const result = await getUserSearchById(selectedSearchId)
        console.log('Search details received:', result)
        return result
      }
      return null
    },
    enabled: !!selectedSearchId,
  })

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )

  if (error)
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error instanceof Error ? error.message : 'Failed to load searches'}
      </Alert>
    )

  const columns: GridColDef[] = [
    {
      field: 'parameters',
      headerName: 'Route',
      width: 150,
      valueGetter: (params, value) => {
        const parameters = value.parameters
        if (
          parameters.originLocationCode &&
          parameters.destinationLocationCode
        ) {
          return `${parameters.originLocationCode} → ${parameters.destinationLocationCode}`
        }
        return 'Complex Route'
      },
      sortable: true,
    },
    {
      field: 'passengers',
      headerName: 'Passengers',
      width: 200,
      valueGetter: (params, value) => {
        const parameters = value.parameters
        const total =
          (parameters.adults || 0) +
          (parameters.children || 0) +
          (parameters.infants || 0)
        const details = []
        if (parameters.adults) details.push(`${parameters.adults} Adults`)
        if (parameters.children) details.push(`${parameters.children} Children`)
        if (parameters.infants) details.push(`${parameters.infants} Infants`)
        return `${total} (${details.join(', ')})`
      },
      sortable: true,
    },
    {
      field: 'searchType',
      headerName: 'Type',
      width: 120,
      sortable: true,
    },
    {
      field: 'updatedAt',
      headerName: 'Last Updated',
      width: 180,
      valueFormatter: (params, value) => (value as Date).toLocaleDateString,
      //dayjs(value as Date).format('DD/MM/YYYY HH:mm'),
      sortable: true,
    },
    {
      field: 'favorite',
      headerName: 'Favorite',
      width: 100,
      type: 'boolean',
      sortable: true,
    },
    {
      field: 'id',
      headerName: 'ID',
      width: 200,
      sortable: true,
    },
  ]

  const handleRowClick = (params: GridRowParams) => {
    setSelectedSearchId(params.row.id)
  }

  const calculateSearchStats = (searchData: FlightOfferSearchDto[]) => {
    if (!searchData || searchData.length === 0) return null

    const allResults = searchData.flatMap((search) => search.results)
    if (allResults.length === 0) return null

    const totalPrice = allResults.reduce((sum, r) => sum + r.price, 0)

    // Group results by creation date for price evolution
    const pricesByDate = new Map<string, { min: number; max: number }>()
    allResults.forEach((result) => {
      const date = new Date(result.createdAt).toISOString()
      const current = pricesByDate.get(date) || {
        min: Infinity,
        max: -Infinity,
      }
      current.min = Math.min(current.min, result.price)
      current.max = Math.max(current.max, result.price)
      pricesByDate.set(date, current)
    })

    const priceEvolution = Array.from(pricesByDate.entries())
      .map(([date, prices]) => ({
        date,
        minPrice: prices.min,
        maxPrice: prices.max,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const carrierStats = new Map<
      string,
      { count: number; totalPrice: number }
    >()
    const routeStats = new Map<string, { count: number; totalPrice: number }>()
    const segmentStats = new Map<
      number,
      { count: number; totalPrice: number }
    >()

    allResults.forEach((result: FlightOfferResultDto) => {
      // Carrier stats
      const carrier = result.validatingCarrier
      const carrierData = carrierStats.get(carrier) || {
        count: 0,
        totalPrice: 0,
      }
      carrierData.count++
      carrierData.totalPrice += result.price
      carrierStats.set(carrier, carrierData)

      // Route and segment stats
      const segmentCount = result.segments.length
      const segmentData = segmentStats.get(segmentCount) || {
        count: 0,
        totalPrice: 0,
      }
      segmentData.count++
      segmentData.totalPrice += result.price
      segmentStats.set(segmentCount, segmentData)

      // Process each segment for route stats
      result.segments.forEach((segment) => {
        const route = `${segment.departure.iataCode}-${segment.arrival.iataCode}`
        const routeData = routeStats.get(route) || { count: 0, totalPrice: 0 }
        routeData.count++
        routeData.totalPrice += result.price
        routeStats.set(route, routeData)
      })
    })

    return {
      totalResults: allResults.length,
      avgPrice: allResults.length > 0 ? totalPrice / allResults.length : 0,
      minPrice:
        allResults.length > 0 ? Math.min(...allResults.map((r) => r.price)) : 0,
      maxPrice:
        allResults.length > 0 ? Math.max(...allResults.map((r) => r.price)) : 0,
      priceEvolution,
      carrierStats: Array.from(carrierStats.entries())
        .map(([carrier, data]) => ({
          carrier,
          count: data.count,
          avgPrice: data.count > 0 ? data.totalPrice / data.count : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      routeStats: Array.from(routeStats.entries())
        .map(([route, data]) => ({
          route,
          count: data.count,
          avgPrice: data.count > 0 ? data.totalPrice / data.count : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      segmentStats: Array.from(segmentStats.entries())
        .map(([segments, data]) => ({
          name:
            segments === 1
              ? 'Direct'
              : `${segments - 1} stop${segments > 2 ? 's' : ''}`,
          count: data.count,
          avgPrice: data.count > 0 ? data.totalPrice / data.count : 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }
  }

  const renderSearchStats = (searchData: FlightOfferSearchDto[]) => {
    const stats = calculateSearchStats(searchData)
    if (!stats)
      return <Alert severity="info">No data available for this search</Alert>

    return (
      <Box>
        <Grid container spacing={3}>
          {/* Basic Stats */}
          <Grid item xs={12}>
            <Paper className="p-4">
              <BasicStats
                totalResults={stats.totalResults}
                avgPrice={stats.avgPrice}
                minPrice={stats.minPrice}
                maxPrice={stats.maxPrice}
              />
            </Paper>
          </Grid>

          {/* Price Evolution Chart */}
          <Grid item xs={12}>
            <Paper className="p-4">
              <PriceEvolutionChart data={stats.priceEvolution} />
            </Paper>
          </Grid>

          {/* Carrier Chart */}
          <Grid item xs={12} md={6}>
            <Paper className="p-4">
              <CarriersChart data={stats.carrierStats} />
            </Paper>
          </Grid>

          {/* Segment Chart */}
          <Grid item xs={12} md={6}>
            <Paper className="p-4">
              <SegmentsChart data={stats.segmentStats} />
            </Paper>
          </Grid>

          {/* Route Chart */}
          <Grid item xs={12} md={6}>
            <Paper className="p-4">
              <RoutesChart data={stats.routeStats} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    )
  }

  return (
    <Box>
      {/* Search History Table */}
      <Paper className="mb-8">
        <DataGrid
          rows={searches || []}
          columns={columns}
          onRowClick={handleRowClick}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
          }}
          pageSizeOptions={[10, 25, 50]}
          autoHeight
          disableRowSelectionOnClick
          loading={isLoading}
          getRowId={(row) => row.id}
          slots={{
            loadingOverlay: () => (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ),
          }}
        />
      </Paper>

      {/* Stats Display */}
      {selectedSearchId && (
        <Paper className="p-4">
          {isLoadingDetails ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : searchDetails ? (
            renderSearchStats(searchDetails)
          ) : (
            <Alert severity="info">No data available for this search</Alert>
          )}
        </Paper>
      )}
    </Box>
  )
}
