import { Skeleton, Stack } from '@mui/material'

export function CardSkeleton() {
  return (
    <Stack spacing={1}>
      <Skeleton variant="rectangular" height={120} />
      <Skeleton width="60%" />
      <Skeleton width="40%" />
    </Stack>
  )
}

export default CardSkeleton

