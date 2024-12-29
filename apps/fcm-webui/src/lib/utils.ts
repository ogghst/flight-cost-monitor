export function parseName(fullName: string | undefined): {
  firstName: string
  lastName: string
} {
  if (fullName == undefined) return { firstName: '', lastName: '' }
  const [firstName = '', ...lastNameParts] = fullName.trim().split(' ')

  return {
    firstName,
    lastName: lastNameParts.join(' '),
  }
}
