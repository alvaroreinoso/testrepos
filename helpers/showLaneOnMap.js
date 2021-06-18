module.exports.showLaneOnMap = async(lane, status) => {

	if (status === 'owned') {
			if (lane.currentVolume > 0) {
				return true
			} else return false
	}

	if (status === 'opportunities') {
		if (lane.currentVolume > 0 && lane.opportunityVolume === 0) {
			return false
		} else if (lane.currentVolume === 0) {
			return true
		} else {
			return true
		}
	}

	if (status === 'potential') return true
}