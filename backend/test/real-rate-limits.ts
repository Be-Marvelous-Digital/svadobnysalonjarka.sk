/**
 * The suite runs with the limiters wide open so ordinary tests are not throttled.
 * The two files that assert on throttling import this first to put the production
 * numbers back; each test file is its own process, so nothing else is affected.
 */
process.env.LOGIN_RATE_LIMIT = '10';
process.env.RESERVATION_RATE_LIMIT = '8';
process.env.API_RATE_LIMIT = '120';
