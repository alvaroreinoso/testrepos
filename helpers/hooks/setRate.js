module.exports.setRate = async (load) => {

    const lane = await load.getLane()

    if (lane.userAddedRate == false) {

        lane.rate = load.rate
        
        await lane.save()
    }
}