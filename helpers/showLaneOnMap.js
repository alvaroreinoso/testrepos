module.exports.showLaneOnMap = async(lane, status) => {
	// Cannot use getLaneWhereOptionsByStatus to show map data
	// because if it's a fully owned opportunity, it will be returned as 'null'
	// from database, which is considered an error.

	if (status === 'owned') {
			if (lane.currentVolume > 0) {
				return true
			} else return false
	}

	// Make this logic match getLaneWhereOptionsByStatus
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