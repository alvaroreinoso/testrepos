const { Op } = require("sequelize");
const Sequelize = require("sequelize");

module.exports.getLaneWhereOptionsByStatus = (status) => {

  function getOptions(status) {
    const options = {
      'owned':  {
        currentVolume: {
          [Op.gt]: 0
        }
      },
      'opportunities': {
        [Op.and]:[{
          opportunityVolume: {
            [Op.gte]: 0,
          },
          currentVolume: {
            [Op.ne]: Sequelize.col('potentialVolume') // currentVolume equals potentialVolume, then the lane is fully owned, with 0 opportunity 
          }
        }]
      },
      'potential':  {
        // Return all lanes
      }
    }

    if (options[status] !== undefined && options[status] !== null) {
      return options[status]
    } else {
      throw new Error ('No status or incorrect status passed into getLaneWhereOptionsByStatus')
    }
  }

  return getOptions(status);
}