module.exports.getIndexName = async (lane) => {

    const load = await lane.getLoads()


    lane.rate = load.rate

    await lane.save()
}