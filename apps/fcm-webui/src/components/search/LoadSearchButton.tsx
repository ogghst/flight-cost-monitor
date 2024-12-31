'use client'

import { useState } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, List, ListItem, 
         ListItemText, ListItemButton, DialogActions, IconButton,
         Typography, Box, Tooltip, Divider } from '@mui/material'
import { BookmarkOutlined, Star } from '@mui/icons-material'
import { useUserSearches, useLoadSearch } from '@/hooks/useSearches'
import { SearchType } from '@fcm/storage/schema/user-search'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface LoadSearchButtonProps {
  searchType: typeof SearchType[keyof typeof SearchType]
  onLoadSearch: (criteria: any) => void
}

function formatSearchDetails(criteria: any) {
  const searchCriteria = typeof criteria === 'string' ? JSON.parse(criteria) : criteria
  
  const details = [
    `${searchCriteria.originLocationCode} → ${searchCriteria.destinationLocationCode}`,
    `${dayjs(searchCriteria.departureDate).format('MMM D')} - ${dayjs(searchCriteria.returnDate).format('MMM D, YYYY')}`,
    `Passengers: ${searchCriteria.adults} Adult${searchCriteria.adults > 1 ? 's' : ''}` + 
    (searchCriteria.children ? `, ${searchCriteria.children} Child${searchCriteria.children > 1 ? 'ren' : ''}` : '') +
    (searchCriteria.infants ? `, ${searchCriteria.infants} Infant${searchCriteria.infants > 1 ? 's' : ''}` : '')
  ].join(' • ')

  return details
}

function formatTimeInfo(createdAt: Date, lastUsed: Date) {
  const now = dayjs()
  const created = dayjs(createdAt)
  const used = dayjs(lastUsed)
  
  const isToday = (date: dayjs.Dayjs) => date.isSame(now, 'day')
  const isYesterday = (date: dayjs.Dayjs) => date.isSame(now.subtract(1, 'day'), 'day')
  
  function formatDate(date: dayjs.Dayjs) {
    if (isToday(date)) {
      return `Today at ${date.format('HH:mm')}`
    } else if (isYesterday(date)) {
      return `Yesterday at ${date.format('HH:mm')}`
    } else if (date.isAfter(now.subtract(7, 'day'))) {
      return date.fromNow()
    } else {
      return date.format('MMM D, YYYY HH:mm')
    }
  }

  return {
    created: formatDate(created),
    lastUsed: formatDate(used)
  }
}

export function LoadSearchButton({ searchType, onLoadSearch }: LoadSearchButtonProps) {
  const [open, setOpen] = useState(false)
  const { data: searches, isLoading } = useUserSearches(searchType)
  const { mutate: markUsed } = useLoadSearch()

  const handleLoadSearch = (searchId: string, criteria: any) => {
    const parsedCriteria = typeof criteria === 'string' ? JSON.parse(criteria) : criteria
    onLoadSearch(parsedCriteria)
    markUsed(searchId)
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<BookmarkOutlined />}
        onClick={() => setOpen(true)}
        size="small"
      >
        Load Search
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Saved Searches</DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Typography>Loading saved searches...</Typography>
          ) : !searches?.length ? (
            <Typography color="text.secondary">No saved searches found</Typography>
          ) : (
            <List>
              {searches.map((search) => {
                const timeInfo = formatTimeInfo(search.createdAt, search.lastUsed)
                return (
                  <ListItem
                    key={search.id}
                    disablePadding
                    secondaryAction={
                      search.favorite ? (
                        <Tooltip title="Favorite">
                          <Star color="primary" />
                        </Tooltip>
                      ) : null
                    }
                  >
                    <ListItemButton 
                      onClick={() => handleLoadSearch(search.id, search.criteria)}
                      sx={{ 
                        py: 2,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="div">
                            {search.title || 'Untitled Search'}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {formatSearchDetails(search.criteria)}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              component="div"
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                pt: 0.5,
                                mt: 0.5
                              }}
                            >
                              <span>Created: {timeInfo.created}</span>
                              <span>Last used: {timeInfo.lastUsed}</span>
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{
                          component: 'div'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}