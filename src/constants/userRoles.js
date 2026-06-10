const USER_ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  AGENT: 'agent',
  USER: 'user',
});

const ADMIN_ROLES = Object.freeze([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]);

module.exports = { USER_ROLES, ADMIN_ROLES };
