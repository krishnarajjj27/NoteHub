const fs = require('fs');
const path = require('path');

/**
 * Environment Variable Validator
 * Checks for required variables and validates their formats
 */

const validationRules = {
  NODE_ENV: {
    required: true,
    validate: (val) => ['development', 'production', 'test'].includes(val),
    message: 'Must be one of: development, production, test',
  },
  PORT: {
    required: false,
    validate: (val) => /^\d+$/.test(val) && val > 1024 && val < 65536,
    message: 'Must be a valid port number (1024-65535)',
    default: '5000',
  },
  MONGO_URI: {
    required: true,
    validate: (val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'),
    message: 'Must be a valid MongoDB connection string',
  },
  JWT_SECRET: {
    required: true,
    validate: (val) => val.length >= 32,
    message: 'Must be at least 32 characters long',
  },
  CLIENT_URL: {
    required: true,
    validate: (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Must be a valid URL',
  },
  EMAIL_USER: {
    required: true,
    validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    message: 'Must be a valid email address',
  },
  EMAIL_PASS: {
    required: true,
    validate: (val) => val.length > 0,
    message: 'Cannot be empty',
  },
};

function validateEnvironment() {
  const errors = [];
  const warnings = [];

  Object.entries(validationRules).forEach(([key, rule]) => {
    const value = process.env[key];

    if (!value) {
      if (rule.required) {
        errors.push(`✗ ${key}: Required but not set`);
      } else if (rule.default) {
        warnings.push(`⚠ ${key}: Using default value: ${rule.default}`);
        process.env[key] = rule.default;
      }
    } else if (!rule.validate(value)) {
      errors.push(`✗ ${key}: ${rule.message}`);
    }
  });

  // Additional checks
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      errors.push('✗ JWT_SECRET: Must be at least 32 characters in production');
    }
    if (process.env.CLIENT_URL === 'http://localhost:3000') {
      warnings.push('⚠ CLIENT_URL: Should not be localhost in production');
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ Environment Validation Failed:\n');
    errors.forEach(err => console.error(`  ${err}`));
    console.error('\nPlease fix these errors and restart the server.\n');
    return false;
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:\n');
    warnings.forEach(warn => console.warn(`  ${warn}`));
    console.warn('');
  }

  return true;
}

module.exports = { validateEnvironment };
