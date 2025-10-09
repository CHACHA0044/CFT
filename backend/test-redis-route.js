// // test-redis-cookies.js
// const axios = require('axios');
// const { wrapper } = require('axios-cookiejar-support');
// const { CookieJar } = require('tough-cookie');

// const BASE_URL = 'http://localhost:4950/api';

// // Wrap axios with cookie support
// const cookieJar = new CookieJar();
// const client = wrapper(axios.create({ jar: cookieJar, withCredentials: true }));

// // Colors
// const c = {
//   reset: '\x1b[0m',
//   bright: '\x1b[1m',
//   red: '\x1b[31m',
//   green: '\x1b[32m',
//   yellow: '\x1b[33m',
//   blue: '\x1b[34m',
//   magenta: '\x1b[35m',
//   cyan: '\x1b[36m',
// };

// const log = {
//   pass: (msg) => console.log(`${c.green}✓ ${msg}${c.reset}`),
//   fail: (msg) => console.log(`${c.red}✗ ${msg}${c.reset}`),
//   info: (msg) => console.log(`${c.cyan}ℹ ${msg}${c.reset}`),
//   warn: (msg) => console.log(`${c.yellow}⚠ ${msg}${c.reset}`),
//   header: (msg) => console.log(`\n${c.bright}${c.magenta}${'═'.repeat(70)}${c.reset}\n${c.bright}${c.blue}  ${msg}${c.reset}\n${c.bright}${c.magenta}${'═'.repeat(70)}${c.reset}`),
//   section: (msg) => console.log(`\n${c.cyan}${'─'.repeat(70)}\n${msg}\n${'─'.repeat(70)}${c.reset}`),
// };

// // TEST CONFIG
// const TEST_USER = {
//   email: 'a45@gmail.com',
//   password: 'gugvybiuh',
// };

// // ============================================
// // TEST 1: Basic Redis Connection
// // ============================================
// async function testRedisConnection() {
//   log.header('TEST 1: Redis Connection & Basic Operations');
  
//   try {
//     log.section('Testing /api/redis-test endpoint');
    
//     const res1 = await axios.get(`${BASE_URL}/redis-test`);
//     log.info(`First request - Visits: ${res1.data.visits}`);
//     log.pass('Redis GET/SET working');
    
//     const res2 = await axios.get(`${BASE_URL}/redis-test`);
//     log.info(`Second request - Visits: ${res2.data.visits}`);
    
//     if (res2.data.visits > res1.data.visits) {
//       log.pass('Redis increment working correctly');
//       return true;
//     } else {
//       log.fail('Redis increment not working');
//       return false;
//     }
    
//   } catch (err) {
//     log.fail(`Redis connection test failed: ${err.message}`);
//     if (err.response) console.error('Response:', err.response.data);
//     throw err;
//   }
// }

// // ============================================
// // TEST 2: User Profile Caching (30min TTL)
// // ============================================
// async function testUserProfileCache() {
//   log.header('TEST 2: User Profile Caching (30 minute TTL)');
  
//   // Create fresh cookie jar for this test
//   const jar = new CookieJar();
//   const testClient = wrapper(axios.create({ jar, withCredentials: true }));
  
//   try {
//     // Login
//     log.section('Step 1: Logging in with cookie authentication');
//     const loginRes = await testClient.post(`${BASE_URL}/auth/login`, TEST_USER);
//     log.pass(`Logged in successfully`);
//     log.info(`User: ${loginRes.data.user.name} (${loginRes.data.user.email})`);
    
//     // Check cookies were set
//     const cookies = await jar.getCookies(BASE_URL);
//     const tokenCookie = cookies.find(c => c.key === 'token');
//     if (tokenCookie) {
//       log.info(`Cookie set: token=${tokenCookie.value.substring(0, 30)}...`);
//     } else {
//       throw new Error('No token cookie received from login');
//     }
    
//     // First request (should hit database)
//     log.section('Step 2: First /token-info/me request (CACHE MISS expected)');
//     const start1 = Date.now();
//     const res1 = await testClient.get(`${BASE_URL}/auth/token-info/me`);
//     const time1 = Date.now() - start1;
    
//     log.info(`Name: ${res1.data.name}`);
//     log.info(`Email: ${res1.data.email}`);
//     log.info(`From cache: ${res1.data.fromCache}`);
//     log.info(`Response time: ${time1}ms`);
//     if (res1.data.dbQueryTime) log.info(`DB query time: ${res1.data.dbQueryTime}`);
    
//     if (res1.data.fromCache === false) {
//       log.pass('First request correctly hit DATABASE');
//     } else {
//       log.warn('First request came from cache (unexpected on first call)');
//     }
    
//     // Wait 2 seconds
//     log.info('\nWaiting 2 seconds before second request...');
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     // Second request (should hit cache)
//     log.section('Step 3: Second /token-info/me request (CACHE HIT expected)');
//     const start2 = Date.now();
//     const res2 = await testClient.get(`${BASE_URL}/auth/token-info/me`);
//     const time2 = Date.now() - start2;
    
//     log.info(`From cache: ${res2.data.fromCache}`);
//     log.info(`Cache TTL remaining: ${res2.data.cacheTTL}s (~${Math.floor(res2.data.cacheTTL / 60)} minutes)`);
//     log.info(`Response time: ${time2}ms`);
    
//     if (res2.data.fromCache === true) {
//       log.pass('Second request correctly served from CACHE');
//     } else {
//       log.fail('Second request did not use cache');
//       return false;
//     }
    
//     // Performance comparison
//     log.section('Performance Analysis');
//     const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
//     console.log(`Database request: ${time1}ms`);
//     console.log(`Cache request:    ${time2}ms`);
//     console.log(`Speed improvement: ${improvement}% faster`);
    
//     if (time2 < time1) {
//       log.pass(`Cache is ${improvement}% faster than database`);
//     } else {
//       log.warn('Cache was not faster (can happen with very fast DB queries)');
//     }
    
//     return true;
    
//   } catch (err) {
//     log.fail('User profile cache test failed');
//     console.error('Error:', err.response?.data || err.message);
//     throw err;
//   }
// }

// // ============================================
// // TEST 3: Login Rate Limiting (5 attempts/15min)
// // ============================================
// async function testLoginRateLimit() {
//   log.header('TEST 3: Login Rate Limiting (5 failed attempts per 15 minutes)');
  
//   const testEmail = 'rate-limit-test@example.com';
//   const wrongPassword = 'definitelywrong123';
  
//   log.info(`Testing email: ${testEmail}`);
//   log.info('Making 6 consecutive failed login attempts (limit is 5)\n');
  
//   let rateLimitHit = false;
  
//   for (let i = 1; i <= 6; i++) {
//     try {
//       log.section(`Attempt ${i}/6`);
      
//       await axios.post(`${BASE_URL}/auth/login`, {
//         email: testEmail,
//         password: wrongPassword
//       });
      
//       log.fail('Login succeeded (this should not happen!)');
//       return false;
      
//     } catch (err) {
//       if (err.response) {
//         const { status, data } = err.response;
        
//         if (status === 401) {
//           log.info('Invalid credentials (expected)');
//         } else if (status === 429) {
//           log.warn('⛔ RATE LIMIT TRIGGERED!');
//           console.log(`Message: ${data.error}`);
//           console.log(`Retry after: ${data.retryAfter}s (~${Math.floor(data.retryAfter / 60)} minutes)`);
//           log.pass('Login rate limiting is working correctly!');
//           rateLimitHit = true;
//           break;
//         } else {
//           log.fail(`Unexpected status code: ${status}`);
//           console.error('Response:', data);
//         }
//       } else {
//         log.fail(`Network error: ${err.message}`);
//         throw err;
//       }
//     }
    
//     if (i < 6) await new Promise(resolve => setTimeout(resolve, 1000));
//   }
  
//   return rateLimitHit;
// }

// // ============================================
// // TEST 4: Cache Invalidation on Login/Logout
// // ============================================
// async function testCacheInvalidation() {
//   log.header('TEST 4: Cache Invalidation After Logout/Login');
  
//   // Fresh cookie jar
//   const jar = new CookieJar();
//   const testClient = wrapper(axios.create({ jar, withCredentials: true }));
  
//   try {
//     // First login
//     log.section('Step 1: First login');
//     await testClient.post(`${BASE_URL}/auth/login`, TEST_USER);
//     log.pass('First login successful');
    
//     // Fetch to create cache
//     log.section('Step 2: Fetch user info (creates cache entry)');
//     const info1 = await testClient.get(`${BASE_URL}/auth/token-info/me`);
//     log.info(`From cache: ${info1.data.fromCache}`);
    
//     // Fetch again (should be cached)
//     log.section('Step 3: Fetch again (should hit cache)');
//     const info2 = await testClient.get(`${BASE_URL}/auth/token-info/me`);
//     log.info(`From cache: ${info2.data.fromCache}`);
    
//     if (!info2.data.fromCache) {
//       log.warn('Cache not working before logout - skipping invalidation test');
//       return false;
//     }
//     log.pass('Cache is working before logout');
    
//     // Logout
//     log.section('Step 4: Logout (should invalidate cache)');
//     await testClient.post(`${BASE_URL}/auth/logout`);
//     log.pass('Logged out successfully');
    
//     // Login again
//     log.section('Step 5: Login again');
//     await testClient.post(`${BASE_URL}/auth/login`, TEST_USER);
//     log.pass('Second login successful');
    
//     // Fetch user info (cache should be invalidated)
//     log.section('Step 6: Fetch user info (cache should be cleared)');
//     const info3 = await testClient.get(`${BASE_URL}/auth/token-info/me`);
//     log.info(`From cache: ${info3.data.fromCache}`);
    
//     if (info3.data.fromCache === false) {
//       log.pass('Cache was properly invalidated after logout/login!');
//       return true;
//     } else {
//       log.fail('Cache was NOT invalidated (potential issue)');
//       return false;
//     }
    
//   } catch (err) {
//     log.fail('Cache invalidation test failed');
//     console.error('Error:', err.response?.data || err.message);
//     throw err;
//   }
// }

// // ============================================
// // TEST 5: Feedback Rate Limiting (3 per hour)
// // ============================================
// async function testFeedbackRateLimit() {
//   log.header('TEST 5: Feedback Submission Rate Limiting (3 per hour)');
  
//   const jar = new CookieJar();
//   const testClient = wrapper(axios.create({ jar, withCredentials: true }));
  
//   try {
//     // Login
//     log.section('Step 1: Login');
//     await testClient.post(`${BASE_URL}/auth/login`, TEST_USER);
//     log.pass('Logged in successfully');
    
//     log.info('\nSubmitting 4 feedback messages (limit is 3)\n');
    
//     let rateLimitHit = false;
    
//     for (let i = 1; i <= 4; i++) {
//       try {
//         log.section(`Feedback Submission ${i}/4`);
        
//         const res = await testClient.post(
//           `${BASE_URL}/auth/feedback/submit`,
//           { feedback: `Test feedback message #${i} - ${Date.now()}` }
//         );
        
//         log.pass(`Feedback ${i} submitted successfully`);
//         console.log(res.data.message);
        
//       } catch (err) {
//         if (err.response?.status === 429) {
//           log.warn('⛔ RATE LIMIT TRIGGERED!');
//           console.log(`Message: ${err.response.data.error}`);
//           console.log(`Retry after: ${err.response.data.retryAfter}s`);
//           log.pass('Feedback rate limiting is working correctly!');
//           rateLimitHit = true;
//           break;
//         } else {
//           log.fail(`Error: ${err.response?.data?.error || err.message}`);
//           throw err;
//         }
//       }
      
//       if (i < 4) await new Promise(resolve => setTimeout(resolve, 1000));
//     }
    
//     return rateLimitHit;
    
//   } catch (err) {
//     log.fail('Feedback rate limit test failed');
//     console.error('Error:', err.response?.data || err.message);
//     throw err;
//   }
// }

// // ============================================
// // TEST 6: Weather/AQI Caching (30min TTL)
// // ============================================
// async function testWeatherCache() {
//   log.header('TEST 6: Weather/AQI Data Caching (30 minute TTL)');
  
//   try {
//     // First request (cache miss)
//     log.section('Step 1: First weather request (CACHE MISS expected)');
//     const start1 = Date.now();
//     const res1 = await axios.get(`${BASE_URL}/auth/weather-aqi?lat=26.8467&lon=80.9462`);
//     const time1 = Date.now() - start1;
    
//     log.info(`Source: ${res1.data.source}`);
//     log.info(`From cache: ${res1.data.fromCache}`);
//     log.info(`Temperature: ${res1.data.weather.temperature_2m}°C`);
//     log.info(`Response time: ${time1}ms`);
    
//     if (res1.data.fromCache === false) {
//       log.pass('First request correctly fetched from API');
//     }
    
//     // Second request (cache hit)
//     log.section('Step 2: Second weather request (CACHE HIT expected)');
//     const start2 = Date.now();
//     const res2 = await axios.get(`${BASE_URL}/auth/weather-aqi?lat=26.8467&lon=80.9462`);
//     const time2 = Date.now() - start2;
    
//     log.info(`From cache: ${res2.data.fromCache}`);
//     log.info(`TTL remaining: ${res2.data.ttl}s (~${Math.floor(res2.data.ttl / 60)} minutes)`);
//     log.info(`Response time: ${time2}ms`);
    
//     if (res2.data.fromCache !== true) {
//       log.fail('Second request did not use cache');
//       return false;
//     }
//     log.pass('Second request correctly served from cache');
    
//     // Performance
//     log.section('Performance Analysis');
//     const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
//     console.log(`API request:   ${time1}ms`);
//     console.log(`Cache request: ${time2}ms`);
//     console.log(`Speed improvement: ${improvement}% faster`);
    
//     if (parseFloat(improvement) > 0) {
//       log.pass(`Cache provided ${improvement}% performance improvement`);
//     }
    
//     // Test refresh rate limiting
//     log.section('Step 3: Testing refresh rate limiting');
//     try {
//       await axios.get(`${BASE_URL}/auth/weather-aqi?lat=26.8467&lon=80.9462&refresh=true`);
//       log.warn('Refresh succeeded (might be allowed if 10+ min passed)');
//     } catch (err) {
//       if (err.response?.status === 429) {
//         log.pass('Refresh rate limiting is working (must wait 10 minutes)');
//         log.info(`Refresh allowed in: ${err.response.data.refreshAllowedIn}s`);
//       }
//     }
    
//     return true;
    
//   } catch (err) {
//     log.fail('Weather cache test failed');
//     console.error('Error:', err.response?.data || err.message);
//     throw err;
//   }
// }

// // ============================================
// // MAIN TEST RUNNER
// // ============================================
// async function runAllTests() {
//   console.log('\n');
//   console.log(c.bright + c.cyan + '╔════════════════════════════════════════════════════════════════════╗');
//   console.log('║     REDIS CACHING & RATE LIMITING - COMPREHENSIVE TEST SUITE      ║');
//   console.log('║                  (Cookie-based Authentication)                    ║');
//   console.log('╚════════════════════════════════════════════════════════════════════╝' + c.reset);
//   console.log(`\n${c.cyan}Server URL: ${BASE_URL}${c.reset}`);
//   console.log(`${c.yellow}⚠ Ensure server is running on localhost:4950${c.reset}`);
//   console.log(`${c.yellow}⚠ Ensure Redis is connected and working${c.reset}`);
//   console.log(`${c.yellow}⚠ Update TEST_USER credentials in this file${c.reset}\n`);
  
//   const tests = [
//     { name: 'Redis Connection', fn: testRedisConnection },
//     { name: 'User Profile Caching', fn: testUserProfileCache },
//     { name: 'Login Rate Limiting', fn: testLoginRateLimit },
//     { name: 'Cache Invalidation', fn: testCacheInvalidation },
//     { name: 'Feedback Rate Limiting', fn: testFeedbackRateLimit },
//     { name: 'Weather/AQI Caching', fn: testWeatherCache },
//   ];
  
//   let passed = 0;
//   let failed = 0;
  
//   for (let i = 0; i < tests.length; i++) {
//     try {
//       const result = await tests[i].fn();
//       if (result !== false) {
//         passed++;
//         log.pass(`${tests[i].name} - PASSED\n`);
//       } else {
//         failed++;
//         log.fail(`${tests[i].name} - FAILED (returned false)\n`);
//       }
//     } catch (error) {
//       failed++;
//       log.fail(`${tests[i].name} - FAILED: ${error.message}\n`);
//     }
    
//     // Pause between tests
//     if (i < tests.length - 1) {
//       log.info('Waiting 3 seconds before next test...');
//       await new Promise(resolve => setTimeout(resolve, 3000));
//     }
//   }
  
//   // Summary
//   console.log('\n');
//   const summaryColor = failed === 0 ? c.green : c.yellow;
//   console.log(c.bright + summaryColor + '╔════════════════════════════════════════════════════════════════════╗');
//   console.log(`║                       TEST SUITE COMPLETED                         ║`);
//   console.log(`║                  Passed: ${passed}/${tests.length}  |  Failed: ${failed}/${tests.length}                         ║`);
//   console.log('╚════════════════════════════════════════════════════════════════════╝' + c.reset);
//   console.log('\n');
  
//   process.exit(failed === 0 ? 0 : 1);
// }

// // CLI Arguments
// const args = process.argv.slice(2);

// if (args.length === 0 || args[0] === 'all') {
//   runAllTests();
// } else {
//   const testMap = {
//     '1': testRedisConnection,
//     'redis': testRedisConnection,
//     '2': testUserProfileCache,
//     'cache': testUserProfileCache,
//     '3': testLoginRateLimit,
//     'login': testLoginRateLimit,
//     '4': testCacheInvalidation,
//     'invalidation': testCacheInvalidation,
//     '5': testFeedbackRateLimit,
//     'feedback': testFeedbackRateLimit,
//     '6': testWeatherCache,
//     'weather': testWeatherCache,
//   };
  
//   const test = testMap[args[0]];
//   if (test) {
//     test().then(result => {
//       process.exit(result !== false ? 0 : 1);
//     }).catch(() => {
//       process.exit(1);
//     });
//   } else {
//     console.log('Usage:');
//     console.log('  node test-redis-cookies.js              # Run all tests');
//     console.log('  node test-redis-cookies.js 1|redis      # Test Redis connection');
//     console.log('  node test-redis-cookies.js 2|cache      # Test user profile caching');
//     console.log('  node test-redis-cookies.js 3|login      # Test login rate limiting');
//     console.log('  node test-redis-cookies.js 4|invalidation  # Test cache invalidation');
//     console.log('  node test-redis-cookies.js 5|feedback      # Test feedback rate limiting');
//     console.log('  node test-redis-cookies.js 6|weather       # Test weather caching');
//   }
// }