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

interface SegmentStat {
  name: string
  count: number
  avgPrice: number
}

interface SegmentsChartProps {
  data: SegmentStat[]
}

export function SegmentsChart({ data }: SegmentsChartProps) {
  return (
    <Box>
      <Typography variant="h5" className="mb-4">Segment Distribution</Typography>
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip 
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const data = payload[0].payload as SegmentStat;
                return (
                  <Box className="bg-white p-2 border rounded shadow">
                    <Typography variant="body2">{data.name}</Typography>
                    <Typography variant="body2">Count: {data.count}</Typography>
                    <Typography variant="body2">Avg Price: ${data.avgPrice.toFixed(2)}</Typography>
                  </Box>
                );
              }}
            />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}