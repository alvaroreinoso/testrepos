module.exports.setRate = async (lane) => {

    const loads = await lane.getLoads()

    console.log(loads)

    if (loads != []) {
    lane.rate = loads[0].rate

    await lane.save()
    }
}