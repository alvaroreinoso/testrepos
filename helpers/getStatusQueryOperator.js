module.exports.getStatusQueryOperator = async(status) => {
    if (status == 'owned') {
        return false
    } else if (status == 'potential') {
        return true   
    } else if (status == 'all') {

        return null
    }
}