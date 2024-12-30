import { Box, Paper, Typography } from '@mui/material'
import { auth } from 'auth'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography>Welcome back, {session?.user?.email}!</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Role: {session?.user?.roles}
        </Typography>
      </Box>
    </Paper>
  )
}
