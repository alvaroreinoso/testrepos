module.exports.setRate = async (load) => {

    const lane = await load.getLane()

    console.log(load)

    if (lane.userAddedRate == false) {

        console.log('made it here')

        lane.rate = load.rate
        
        await lane.save()
    }
}