'use client'

import { useSaveSearch } from '@/hooks/useSearches'
import { SearchType } from '@fcm/shared/auth'
import { BookmarkAdd } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useState } from 'react'

interface SaveSearchButtonProps {
  searchCriteria: string
  searchType: (typeof SearchType)[keyof typeof SearchType]
  isSimpleSearch?: boolean
}

export function SaveSearchButton({
  searchCriteria,
  searchType,
  isSimpleSearch,
}: SaveSearchButtonProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const { mutate: saveSearch, isPending } = useSaveSearch()

  const handleSave = () => {
    saveSearch(
      {
        searchType,
        criteria: searchCriteria,
        title: title.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setTitle('')
        },
      }
    )
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<BookmarkAdd />}
        onClick={() => setOpen(true)}
        size="small">
        Save Search
      </Button>

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
            placeholder={`My ${isSimpleSearch ? 'Simple' : 'Advanced'} Search`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
