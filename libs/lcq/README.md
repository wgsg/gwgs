# Limited Concurrency Queue

## Abstract

```
Javascript is single threaded
Code executes until it hits an async operation, then it goes back on the event loop
The next executable bit of code runs
Hence why it's important to not block the event loop

In certain contexts you may want to limit the number of concurrent async operations

  Case: Batch API Request Processing
  Goal: Programatically send a thousand http requests to an endpoint
  Problem: Sending all thousand at once could cause DoS on server
  Solution: Limit number of concurrent requests
```
