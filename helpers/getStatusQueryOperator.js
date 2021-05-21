module.exports.getStatusQueryOperator = async(status) => {
    if (status == 'owned') {
        return true

    } else if (status == 'opportunities') {
        return false
        
    } else if (status == 'potential') {
        return null
    }
}