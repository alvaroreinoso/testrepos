const { Op } = require("sequelize");

module.exports.getLaneWhereOptionsByStatus = status => {

  function getOptions(status) {
    const options = {
      'owned':  {
        currentVolume: {
          [Op.gt]: 0
        }
      },
      'opportunities':   {
        opportunityVolume: {
          [Op.gte]: 0
        },
        currentVolume: {
          [Op.eq]: 0
        }
      },
      'potential':  {
        // Return all lanes
      }
    }

    if (options[status] !== undefined && options[status] !== null) {
      return options[status]
    } else {
      throw new Error ('No status or incorrect status passed into getWhereOptionsByStatus')
    }
  }

  return getOptions(status);
}