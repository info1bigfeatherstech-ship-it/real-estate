const normalizeArrayField = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [trimmed];
      } catch {
        return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
      }
    }
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return value;
};

const normalizeInquiryMultipartBody = (req, _res, next) => {
  if (typeof req.body.location === 'string') {
    try {
      req.body.location = JSON.parse(req.body.location);
    } catch {
      // leave for validator to fail clearly
    }
  }

  const amenities = normalizeArrayField(req.body.amenitiesRequired);
  if (amenities !== undefined) {
    req.body.amenitiesRequired = amenities;
  }

  if (req.body.saveAsDraft !== undefined) {
    req.body.saveAsDraft = ['true', '1', true, 1].includes(req.body.saveAsDraft);
  }

  next();
};

module.exports = { normalizeInquiryMultipartBody };
