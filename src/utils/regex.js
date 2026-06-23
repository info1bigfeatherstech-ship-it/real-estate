/**
 * Escape special regex characters for safe regex usage
 */
const escapeRegex = (value) => {
  if (!value) return '';
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = {
  escapeRegex,
};