module.exports.showLaneOnMap = async(lane, status) => {
	if (lane.owned === true && status === 'owned') {
		return true

	} if (lane.owned === false && status === 'owned') {
		return false

	} if (lane.owned === true && status === 'opportunities') {
		return false

	} if (lane.owned === false && status === 'opportunities') {
		return true

	} if (status === 'potential') {
		return true
	}
}
