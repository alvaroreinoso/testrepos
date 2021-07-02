module.exports.filterSearchResultsForItem = async (searchResults, allContacts) => {
  const uniqueResults = []

  searchResults.forEach((searchResult) => {
    if (searchResult !== null) {
      // If current contact is already in contacts for this item,
      // Add them to the temporary array
      let temporaryArray = allContacts.filter((contact) => {
        if (contact.id === searchResult.id) {
          return true
        }
        // Check for if they're in the database twice but under different Ids
        if (
          contact.firstName === searchResult.firstName &&
          contact.lastName === searchResult.lastName &&
          contact.title === searchResult.title &&
          contact.phone === searchResult.phone
        ) {
          return true
        }

        return false
      })

      // If we have any length in the temporary array, this search result is already a part of this item
      if (temporaryArray.length < 1) {
        // Only adds search results that are not in the current item
        uniqueResults.push(searchResult)
      }
    }
  })

  return uniqueResults
}
