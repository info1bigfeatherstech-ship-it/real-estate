const Property = require('../../models/Property.model');

const getDashboardStats = async () => {
  const [total, active, pending, draft, inactive, byListingType] = await Promise.all([
    Property.countDocuments({ isDeleted: false }),
    Property.countDocuments({ isDeleted: false, status: 'active' }),
    Property.countDocuments({ isDeleted: false, status: 'pending' }),
    Property.countDocuments({ isDeleted: false, status: 'draft' }),
    Property.countDocuments({ isDeleted: false, status: 'inactive' }),
    Property.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$listingType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    totalProperties: total,
    statusBreakdown: { active, pending, draft, inactive },
    listingTypeBreakdown: byListingType.map((item) => ({
      listingType: item._id,
      count: item.count,
    })),
  };
};

module.exports = { getDashboardStats };
