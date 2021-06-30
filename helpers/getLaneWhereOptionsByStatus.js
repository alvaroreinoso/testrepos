const { Op } = require('sequelize')

module.exports.getLaneWhereOptionsByStatus = (status) => {
  function getOptions(status) {
    const options = {
      owned: {
        currentVolume: {
          [Op.gt]: 0,
        },
      },
      opportunities: {
        [Op.and]: [
          {
            opportunityVolume: {
              [Op.gte]: 0,
            },
          },
          {
            currentVolume: {
              // currentVolume equals potentialVolume, then the lane is fully owned, with 0 opportunity
              // UNLESS They're both 0, then get those too, because they've just been added
              [Op.or]: {
                [Op.ne]: {
                  [Op.col]: 'Lane.potentialVolume',
                },
                [Op.and]: {
                  [Op.col]: 'Lane.potentialVolume',
                  [Op.eq]: 0,
                },
              },
            },
          },
        ],
      },
      potential: {
        // Return all lanes
      },
    }

    if (options[status] !== undefined && options[status] !== null) {
      return options[status]
    } else {
      throw new Error('No status or incorrect status passed into getLaneWhereOptionsByStatus')
    }
  }

  return getOptions(status)
}
