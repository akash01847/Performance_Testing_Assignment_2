import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// Create a custom trend to log custom statistics
const myCustomTrend = new Trend('my_custom_trend');

// Configure the load profile in ramp-up and ramp-down fashion
export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 virtual users over 10 seconds
    { duration: '30s', target: 10 }, // Maintain 10 virtual users for 30 seconds
    { duration: '10s', target: 0 },  // Ramp down to 0 virtual users over 10 seconds
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
  },
};

// Main function for the performance test
export default function () {
  // Send a GET request to the API
  const res = http.get('https://reqres.in');

  // Check if the response status was 200
  check(res, { 'status was 200': (r) => r.status === 200 });

  // Log custom statistics to the custom trend
  myCustomTrend.add(res.timings.duration);

  // Additional assertions and checks
  check(res, {
    'is status 200': (r) => r.status === 200,
    'body size is 11,105 bytes': (r) => r.body.length === 11105,
  });

  // Pause for 1 second before making the next request
  sleep(1);
}
