'use client'

import { useSearchForm } from '@/components/context/SearchFormContext'
import { useLoadSearch, useUserSearches } from '@/hooks/useSearches'
import { showNotification } from '@/services/NotificationService'
import { FlightOfferSimpleSearchRequest } from '@fcm/shared/amadeus/clients/flight-offer'
import { SearchType, UserSearchDto } from '@fcm/shared/user-search'
import { BookmarkOutlined, CheckCircle, Clear, Star } from '@mui/icons-material'
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useState } from 'react'

dayjs.extend(relativeTime)

interface LoadSearchButtonProps {
  searchType: (typeof SearchType)[keyof typeof SearchType]
  onLoadSearch: (criteria: FlightOfferSimpleSearchRequest) => void
}

function formatSearchDetails(search: UserSearchDto) {
  // Check if search.parameters is already an object
  const parameters =
    typeof search.parameters === 'string'
      ? (JSON.parse(search.parameters) as FlightOfferSimpleSearchRequest)
      : (search.parameters as FlightOfferSimpleSearchRequest)

  return [
    `${parameters.originLocationCode} → ${parameters.destinationLocationCode}`,
    `${dayjs(parameters.departureDate).format('MMM D')} - ${dayjs(parameters.returnDate).format('MMM D, YYYY')}`,
    `Passengers: ${parameters.adults} Adult${parameters.adults > 1 ? 's' : ''}` +
      (parameters.children
        ? `, ${parameters.children} Child${parameters.children > 1 ? 'ren' : ''}`
        : '') +
      (parameters.infants
        ? `, ${parameters.infants} Infant${parameters.infants > 1 ? 's' : ''}`
        : ''),
  ].join(' • ')
}

function formatTimeInfo(createdAt: Date, lastUsed: Date) {
  const now = dayjs()
  const created = dayjs(createdAt)
  const used = dayjs(lastUsed)

  const isToday = (date: dayjs.Dayjs) => date.isSame(now, 'day')
  const isYesterday = (date: dayjs.Dayjs) =>
    date.isSame(now.subtract(1, 'day'), 'day')

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
    lastUsed: formatDate(used),
  }
}

export function LoadSearchButton({
  searchType,
  onLoadSearch,
}: LoadSearchButtonProps) {
  const [open, setOpen] = useState(false)
  const { data: searches, isLoading } = useUserSearches(searchType)
  const { mutate: markUsed } = useLoadSearch()
  const { currentSearch, setCurrentSearch } = useSearchForm()

  const handleLoadSearch = (search: UserSearchDto) => {
    const parsedParameters = //search.parameters
      JSON.parse(search.parameters) as FlightOfferSimpleSearchRequest

    // Update the current search in context
    setCurrentSearch(search)

    // Mark the search as used
    markUsed(search.id)

    // Call parent's onLoadSearch with the parsed parameters
    onLoadSearch(parsedParameters)

    setOpen(false)
    showNotification.success(
      `Loaded search: ${search.name || 'Untitled Search'}`
    )
  }

  const handleClearSearch = () => {
    setCurrentSearch(null)
    showNotification.info('Search cleared')
  }

  const LoadButton = () => {
    if (!currentSearch) {
      return (
        <Button
          variant="outlined"
          startIcon={<BookmarkOutlined />}
          onClick={() => setOpen(true)}
          color="primary"
          size="small">
          Load Search
        </Button>
      )
    }

    return (
      <ButtonGroup variant="contained" color="success" size="small">
        <Button startIcon={<CheckCircle />} onClick={() => setOpen(true)}>
          {currentSearch.name || 'Search Loaded'}
        </Button>
        <Button color="error" onClick={handleClearSearch}>
          <Clear />
        </Button>
      </ButtonGroup>
    )
  }

  return (
    <>
      <LoadButton />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Saved Searches</DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Typography>Loading saved searches...</Typography>
          ) : !searches?.length ? (
            <Typography color="text.secondary">
              No saved searches found
            </Typography>
          ) : (
            <List>
              {searches.map((search) => {
                const timeInfo = formatTimeInfo(
                  search.createdAt,
                  search.lastUsed ?? search.createdAt
                )
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
                    }>
                    <ListItemButton
                      onClick={() => handleLoadSearch(search)}
                      selected={currentSearch?.id === search.id}
                      sx={{
                        py: 2,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="div">
                            {search.name || 'Untitled Search'}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}>
                              {formatSearchDetails(search)}
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
                                mt: 0.5,
                              }}>
                              <span>Created: {timeInfo.created}</span>
                              <span>Last used: {timeInfo.lastUsed}</span>
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{
                          component: 'div',
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
