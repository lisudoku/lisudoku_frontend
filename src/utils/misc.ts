export const getPuzzleFullUrl = (publicId: string) => (
  `${window.location.origin}/p/${publicId}`
)

export const getPuzzleRelativeUrl = (publicId: string) => (
  `/p/${publicId}`
)
