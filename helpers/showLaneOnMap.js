module.exports.showLaneOnMap = async(lane, status) => {
	if (lane.currentVolume > 0 && status === 'owned') {
		return true

	} if (lane.currentVolume <= 0 && status === 'owned') {
		return false

	} if (lane.currentVolume > 0 && status === 'opportunities') {
		return false

	} if (lane.currentVolume === 0 && status === 'opportunities') {
		return true

	} if (status === 'potential') {
		return true
	}
}
