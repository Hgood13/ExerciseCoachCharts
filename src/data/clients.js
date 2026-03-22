/*
  MVP DATA
  This replaces a backend for now.
  When the database is added, this will be replaced by API calls.
*/

export const clients = [
  { id: 1, name: "Sarah Johnson" },
  { id: 2, name: "Mike Thompson" },
  { id: 3, name: "Emily Davis" },
  { id: 4, name: "David Hobgood" },
  { id: 5, name: "Jessica Martinez" },
  { id: 6, name: "Robert Anderson" },
  { id: 7, name: "Lisa Chen" },
  { id: 8, name: "James Wilson" },
  { id: 9, name: "Amanda Brown" },
  { id: 10, name: "Christopher Lee" },
  { id: 11, name: "Michelle Garcia" },
  { id: 12, name: "Daniel Rodriguez" },
  { id: 13, name: "Rachel Taylor" },
  { id: 14, name: "Kevin Moore" },
  { id: 15, name: "Maria Sanchez" },
  { id: 16, name: "Brandon Jackson" },
  { id: 17, name: "Jennifer White" },
  { id: 18, name: "Matthew Harris" },
  { id: 19, name: "Lauren Clark" },
  { id: 20, name: "Joshua Lewis" },
]

/* Sort clients by last name, then first name */
clients.sort((a, b) => {
  const aNames = a.name.trim().split(' ')
  const bNames = b.name.trim().split(' ')

  const aLast = aNames[aNames.length - 1].toLowerCase()
  const bLast = bNames[bNames.length - 1].toLowerCase()

  if (aLast !== bLast) return aLast.localeCompare(bLast)

  return aNames[0].toLowerCase().localeCompare(bNames[0].toLowerCase())
})

/*
  Mock credentials for MVP demonstration only.
  TODO: Replace with server-side authentication when the backend is added.
        Credentials should come from environment variables, never hardcoded.
*/
export const validCredentials = [
  { username: "Megan", password: "1234" },
  { username: "Bill", password: "1234" },
]
