module.exports.getTruckTypeString = async (type) => {

    switch (type) {
        case 'V': {
            return 'Van'
        } case 'R': {
            return 'Reefer'
        } case 'F': {
            return 'Flatbed'
        } default: {
            return null
        }
    }
}