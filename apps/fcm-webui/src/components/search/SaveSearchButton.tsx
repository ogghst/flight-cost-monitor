'use client'

import { useSearchForm } from '@/components/context/SearchFormContext'
import { useSaveSearch } from '@/hooks/useSearches'
import { SearchType } from '@fcm/shared/auth'
import { UserSearchDto } from '@fcm/shared/user-search/types'
import { BookmarkAdd, Warning } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface SaveSearchButtonProps {
  searchType: (typeof SearchType)[keyof typeof SearchType]
}

function compareSearchParameters(
  current: UserSearchDto,
  loaded: UserSearchDto
): boolean {
  if (!current || !loaded) return true
  return current.parameters === loaded.parameters
}

export function SaveSearchButton({
  searchType,
}: SaveSearchButtonProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const { mutate: saveSearch, isPending } = useSaveSearch()
  const { data: session } = useSession()
  const { currentSearch } = useSearchForm()

  const hasChanges = currentSearch?.id && !compareSearchParameters(currentSearch, {
    ...currentSearch,
    parameters: currentSearch.parameters
  })

  const buttonColor = hasChanges ? 'error' : 'primary'
  const tooltipTitle = hasChanges
    ? `Current search parameters differ from original search "${currentSearch?.name || 'Untitled'}"`
    : 'Save current search'

  const handleSave = () => {
    if (!currentSearch) return

    saveSearch(
      {
        ...currentSearch,
        name: title.trim() || undefined,
        userEmail: session?.user.email || '',
        favorite: false,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setTitle('')
        },
      }
    )
  }

  // Don't show the button if there's no search to save
  if (!currentSearch) return null

  return (
    <>
      <Tooltip title={tooltipTitle} arrow>
        <Button
          variant={hasChanges ? 'contained' : 'outlined'}
          startIcon={hasChanges ? <Warning /> : <BookmarkAdd />}
          onClick={() => setOpen(true)}
          size="small"
          color={buttonColor}>
          {hasChanges ? 'Parameters Changed' : 'Save Search'}
        </Button>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Save Search</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search Name (Optional)"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            placeholder={`My ${SearchType[searchType].toLowerCase()} Search`}
          />
          {hasChanges && (
            <Typography
              color="error"
              variant="body2"
              sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning fontSize="small" />
              Note: Current parameters differ from original search &quot;
              {currentSearch?.name || 'Untitled'}&quot;
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            variant="contained"
            color={hasChanges ? 'error' : 'primary'}>
            {hasChanges ? 'Save Modified Search' : 'Save Search'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
