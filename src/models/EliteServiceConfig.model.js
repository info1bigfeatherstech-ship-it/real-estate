const mongoose = require('mongoose');

const eliteServiceConfigSchema = new mongoose.Schema(
  {
    roles: {
      type: [String],
      required: true,
      default: ['Plumber', 'Electrician', 'Carpenter', 'Painter'],
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: 'At least one role is required',
      },
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Singleton: Only one document ──────────────────────────────────────────
eliteServiceConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({
      roles: ['Plumber', 'Electrician', 'Carpenter', 'Painter'],
    });
  }
  return config;
};

// ─── Get roles for validation ──────────────────────────────────────────────
eliteServiceConfigSchema.statics.getRoles = async function () {
  const config = await this.getConfig();
  return config.roles;
};

// ─── Check if role exists ──────────────────────────────────────────────────
eliteServiceConfigSchema.statics.isValidRole = async function (roleName) {
  const roles = await this.getRoles();
  return roles.includes(roleName);
};

module.exports = mongoose.model('EliteServiceConfig', eliteServiceConfigSchema);