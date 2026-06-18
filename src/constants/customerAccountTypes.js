const CUSTOMER_ACCOUNT_TYPES = Object.freeze(['seeker', 'owner', 'agent']);

const CUSTOMER_ACCOUNT_TYPE_LABELS = Object.freeze({
  seeker: 'Property Seeker',
  owner: 'Property Owner',
  agent: 'Agent / Broker',
});

/** Which inquiry form types each account type may submit. */
const FORM_ACCESS_BY_ACCOUNT_TYPE = Object.freeze({
  seeker: ['accommodation_requirement', 'buy_property'],
  owner: ['accommodation_listing', 'sell_property'],
  agent: ['accommodation_listing', 'sell_property'],
});

const canSubmitFormType = (accountType, formType) =>
  (FORM_ACCESS_BY_ACCOUNT_TYPE[accountType] || []).includes(formType);

module.exports = {
  CUSTOMER_ACCOUNT_TYPES,
  CUSTOMER_ACCOUNT_TYPE_LABELS,
  FORM_ACCESS_BY_ACCOUNT_TYPE,
  canSubmitFormType,
};
