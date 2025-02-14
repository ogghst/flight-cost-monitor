import { Box, Typography } from '@mui/material'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import dayjs from 'dayjs'

interface PriceData {
  date: string;
  minPrice: number;
  maxPrice: number;
}

interface PriceEvolutionChartProps {
  data: PriceData[];
}

export function PriceEvolutionChart({ data }: PriceEvolutionChartProps) {
  return (
    <Box>
      <Typography variant="h5" className="mb-4">Price Evolution</Typography>
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => dayjs(value).format('DD/MM/YYYY HH:mm')}
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
            />
            <RechartsTooltip 
              content={({ payload, label }) => {
                if (!payload || payload.length === 0) return null;
                return (
                  <Box className="bg-white p-2 border rounded shadow">
                    <Typography variant="body2">
                      {dayjs(label).format('DD/MM/YYYY HH:mm')}
                    </Typography>
                    {payload.map((entry) => (
                      <Typography 
                        key={entry.name} 
                        variant="body2"
                        style={{ color: entry.color }}
                      >
                        {entry.name}: ${entry.value}
                      </Typography>
                    ))}
                  </Box>
                );
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="minPrice" 
              stroke="#82ca9d" 
              name="Min Price"
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line 
              type="monotone" 
              dataKey="maxPrice" 
              stroke="#8884d8" 
              name="Max Price"
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}