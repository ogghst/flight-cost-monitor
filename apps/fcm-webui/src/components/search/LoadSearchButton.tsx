'use client'

import { useLoadSearch, useUserSearches } from '@/hooks/useSearches'
import { SearchType } from '@fcm/storage/schema'
import { BookmarkOutlined, Star } from '@mui/icons-material'
import {
  Button,
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
import { useState } from 'react'

interface LoadSearchButtonProps {
  searchType: (typeof SearchType)[keyof typeof SearchType]
  onLoadSearch: (criteria: any) => void
}

export function LoadSearchButton({
  searchType,
  onLoadSearch,
}: LoadSearchButtonProps) {
  const [open, setOpen] = useState(false)
  const { data: searches, isLoading } = useUserSearches(searchType)
  const { mutate: markUsed } = useLoadSearch()

  const handleLoadSearch = (searchId: string, criteria: any) => {
    markUsed(searchId)
    onLoadSearch(criteria)
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<BookmarkOutlined />}
        onClick={() => setOpen(true)}
        size="small">
        Saved Searches
      </Button>

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
              {searches.map((search) => (
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
                    onClick={() =>
                      handleLoadSearch(search.id, search.criteria)
                    }>
                    <ListItemText
                      primary={search.title || 'Untitled Search'}
                      secondary={dayjs(search.lastUsed).format(
                        'MMM D, YYYY HH:mm'
                      )}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
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
