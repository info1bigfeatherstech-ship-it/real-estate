const toPublicEliteService = (service) => ({
  _id: service._id,
  role: service.role,
  providerName: service.providerName,
  address: service.address,
  primaryMobile: service.primaryMobile,
  secondaryMobile: service.secondaryMobile ?? null,
  status: service.status,
});

module.exports = {
  toPublicEliteService,
};
