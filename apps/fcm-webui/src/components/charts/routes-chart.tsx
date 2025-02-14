import { Box, Typography } from '@mui/material'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts'

interface RouteStat {
  route: string
  count: number
  avgPrice: number
}

interface RoutesChartProps {
  data: RouteStat[]
}

export function RoutesChart({ data }: RoutesChartProps) {
  return (
    <Box>
      <Typography variant="h5" className="mb-4">Popular Routes</Typography>
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route" />
            <YAxis />
            <RechartsTooltip 
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const data = payload[0].payload as RouteStat;
                return (
                  <Box className="bg-white p-2 border rounded shadow">
                    <Typography variant="body2">Route: {data.route}</Typography>
                    <Typography variant="body2">Count: {data.count}</Typography>
                    <Typography variant="body2">Avg Price: ${data.avgPrice.toFixed(2)}</Typography>
                  </Box>
                );
              }}
            />
            <Bar dataKey="count" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}