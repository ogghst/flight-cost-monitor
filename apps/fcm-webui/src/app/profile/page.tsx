'use client'

import { getCurrentUser } from '@/app/actions/user'
import { withErrorBoundary } from '@/components/error-boundary'
import { User } from '@fcm/storage/schema'
import { GitHub } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useQuery } from '@tanstack/react-query'

function ProfilePage() {
  const { data: userData, isLoading } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: getCurrentUser,
    retry: 2,
    throwOnError: true,
  })

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Paper sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid size={{ xs: 12, sm: 6 }} key={i}>
                <Skeleton variant="text" width={120} />
                <Skeleton variant="text" width={180} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    )
  }

  if (!userData) {
    throw new Error('Failed to load user profile')
  }

  const githubProfile = userData.githubProfile
    ? JSON.parse(userData.githubProfile)
    : null

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar
                src={userData.image || ''}
                alt={userData.firstName || 'Profile'}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}>
                {userData.firstName?.[0]}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {userData.firstName}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {userData.email}
              </Typography>
              {githubProfile?.login && (
                <Tooltip title="GitHub Profile">
                  <IconButton
                    href={`https://github.com/${githubProfile.login}`}
                    target="_blank"
                    rel="noopener noreferrer">
                    <GitHub />
                  </IconButton>
                </Tooltip>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1">{userData.firstName}</Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{userData.email}</Typography>
                </Grid>
              </Grid>

              {githubProfile && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    GitHub Profile
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={3}>
                    {githubProfile.bio && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Bio
                        </Typography>
                        <Typography variant="body1">
                          {githubProfile.bio}
                        </Typography>
                      </Grid>
                    )}

                    {githubProfile.company && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Company
                        </Typography>
                        <Typography variant="body1">
                          {githubProfile.company}
                        </Typography>
                      </Grid>
                    )}

                    {githubProfile.location && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body1">
                          {githubProfile.location}
                        </Typography>
                      </Grid>
                    )}

                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', gap: 4, mt: 1 }}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary">
                            Repositories
                          </Typography>
                          <Typography variant="body1">
                            {githubProfile.public_repos}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary">
                            Followers
                          </Typography>
                          <Typography variant="body1">
                            {githubProfile.followers}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary">
                            Following
                          </Typography>
                          <Typography variant="body1">
                            {githubProfile.following}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default withErrorBoundary(ProfilePage)
