module.exports.showLaneOnMap = async(lane, status) => {
	if (lane.owned === true && status === 'owned') {
		return true

	} if (lane.owned === false && status === 'owned') {
		return false

	} if (lane.owned === true && status === 'opportunity') {
		return false

	} if (lane.owned === false && status === 'opportunity') {
		return true
		
	} if (status === 'potential') {
		return true
	}
}
