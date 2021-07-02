module.exports.noOtherAssociations = async (tag) => {
  if (
    tag.id > 73 &&
    tag.Locations.length == 0 &&
    tag.Customers.length == 0 &&
    tag.Lanes.length == 0 &&
    tag.Users.length == 0 &&
    tag.Brokerages.length == 0 &&
    tag.Teams.length == 0
  ) {
    return true
  } else {
    return false
  }
}
