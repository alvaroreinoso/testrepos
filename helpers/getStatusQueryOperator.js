module.exports.getStatusQueryOperator = async (status) => {
  if (status == 'owned') {
    return false
  } else if (status == 'opportunities') {
    return true
  } else if (status == 'potential') {
    return null
  }
}
