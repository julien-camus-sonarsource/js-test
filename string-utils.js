/**
 * Simple string manipulation utilities for form input processing.
 */

function sanitizeInput(input) {
  if (!input) return '';
  return input.trim().replace(/<[^>]*>/g, '');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

function truncate(str, maxLength = 100) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

module.exports = { sanitizeInput, capitalize, slugify, truncate };
