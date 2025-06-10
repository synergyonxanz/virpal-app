# Circuit Breaker Pattern Implementation - Azure Best Practices

## Overview

The `frontendKeyVaultService.ts` now implements a comprehensive Circuit Breaker pattern following Azure resilience best practices. This prevents cascading failures and provides graceful degradation when the Azure Functions backend is experiencing issues.

## Circuit Breaker States

### 1. **Closed State** (Normal Operation)
- All requests are allowed through
- Failure count is tracked
- Moves to **Open** state when failure threshold is reached

### 2. **Open State** (Service Protection)
- All requests are immediately rejected 
- Prevents overwhelming a failing service
- Development fallbacks are used when available
- Moves to **Half-Open** state after timeout period

### 3. **Half-Open State** (Testing Recovery)
- Limited requests are allowed to test service recovery
- Success moves back to **Closed** state
- Failure moves back to **Open** state

## Configuration Parameters

```typescript
// Azure best practices configuration
private circuitBreakerThreshold = 3;     // failures before opening circuit
private circuitBreakerTimeout = 30000;   // 30 seconds before retry
private halfOpenMaxRetries = 1;          // single retry in half-open state
```

### Why These Values?

- **Threshold (3)**: Balances quick failure detection with avoiding false positives
- **Timeout (30 seconds)**: Gives Azure Functions time to recover from cold starts
- **Half-Open Retries (1)**: Minimal testing to avoid re-overwhelming the service

## Implementation Features

### 🔄 **State Management**
```typescript
// Track circuit breaker state
private isHalfOpen = false;
private consecutiveSuccesses = 0;
private failureCount = 0;
private lastFailureTime = 0;
```

### ⚡ **Failure Detection**
- HTTP 4xx/5xx responses
- Network connectivity errors
- Request timeouts
- JSON parsing failures

### 🎯 **Success Recovery**
- Successful HTTP responses (200-299)
- Successful JSON parsing
- Valid secret retrieval

### 📊 **Monitoring & Metrics**
```typescript
// Get detailed circuit breaker metrics
const metrics = frontendKeyVaultService.getCircuitBreakerMetrics();
console.log(metrics);
// Output: { state: 'closed', failureCount: 0, timeSinceLastFailure: 0, ... }
```

## Usage Examples

### Basic Secret Retrieval
```typescript
try {
  const secret = await frontendKeyVaultService.getSecret('azure-speech-service-key');
  if (secret) {
    // Use the secret
  } else {
    // Handle unavailable secret (circuit may be open)
  }
} catch (error) {
  // Handle circuit breaker or other errors
  console.error('Secret retrieval failed:', error.message);
}
```

### Health Check with Circuit Breaker Status
```typescript
const health = await frontendKeyVaultService.healthCheck();
console.log(`Service healthy: ${health.isHealthy}`);
console.log(`Circuit breaker open: ${health.circuitBreaker.isOpen}`);
```

### Manual Circuit Breaker Management
```typescript
// Get current status
const status = frontendKeyVaultService.getStatus();
console.log('Circuit breaker state:', status.circuitBreaker);

// Reset circuit breaker (for testing or admin purposes)
frontendKeyVaultService.resetCircuitBreaker();
```

## Azure Best Practices Applied

### 1. **Resilience Patterns**
- ✅ Circuit Breaker for service protection
- ✅ Timeout handling with AbortController
- ✅ Exponential backoff via state transitions
- ✅ Graceful degradation with fallbacks

### 2. **Monitoring & Observability**
- ✅ Structured logging for circuit breaker state changes
- ✅ Metrics collection for failure rates
- ✅ Health checks with circuit breaker status
- ✅ Administrative reset capabilities

### 3. **Performance Optimization**
- ✅ Fail-fast when circuit is open
- ✅ Caching to reduce backend load
- ✅ Minimal retries in half-open state
- ✅ Efficient state tracking

### 4. **Security Considerations**
- ✅ No sensitive data in logs
- ✅ Fallback values only in development
- ✅ Authentication preserved through circuit states
- ✅ Error messages don't expose internals

## Fallback Strategy

### Development Environment
- Circuit breaker open → Try development fallbacks
- Network errors → Use environment variables
- Authentication failures → Graceful degradation

### Production Environment
- Circuit breaker open → Return null gracefully
- No fallbacks for Azure Speech Service (security requirement)
- Maintain service availability through circuit protection

## Debugging & Troubleshooting

### Common Scenarios

#### Circuit Breaker Opens Frequently
```typescript
const metrics = frontendKeyVaultService.getCircuitBreakerMetrics();
if (metrics.state === 'open') {
  console.log(`Circuit opened after ${metrics.failureCount} failures`);
  console.log(`Time since last failure: ${metrics.timeSinceLastFailure}ms`);
  
  // Check Azure Function health
  const health = await frontendKeyVaultService.healthCheck();
  console.log('Function status:', health.message);
}
```

#### Service Recovery Testing
```typescript
// Monitor circuit breaker recovery
setInterval(async () => {
  const metrics = frontendKeyVaultService.getCircuitBreakerMetrics();
  console.log(`Circuit state: ${metrics.state}`);
  
  if (metrics.state === 'half-open') {
    console.log(`Testing recovery... successes: ${metrics.consecutiveSuccesses}`);
  }
}, 5000);
```

### Performance Monitoring
```typescript
// Track circuit breaker effectiveness
const before = performance.now();
try {
  const secret = await frontendKeyVaultService.getSecret('test-secret');
  const after = performance.now();
  console.log(`Request completed in ${after - before}ms`);
} catch (error) {
  console.log(`Request failed quickly due to circuit breaker: ${error.message}`);
}
```

## Integration with KeyVaultTester

The circuit breaker is now integrated with the KeyVaultTester utility:

```typescript
// Test circuit breaker functionality
KeyVaultTester.testCircuitBreaker();

// Monitor circuit breaker during tests
KeyVaultTester.runTests(); // Will show circuit breaker state changes
```

## References

- [Azure Architecture Center - Circuit Breaker Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)
- [Azure Well-Architected Framework - Reliability](https://docs.microsoft.com/en-us/azure/architecture/framework/resiliency/)
- [Polly Resilience Library](https://github.com/App-vNext/Polly) - Similar patterns for .NET

## Conclusion

This circuit breaker implementation provides enterprise-grade resilience for the frontend Key Vault service, following Azure best practices for:

- **Service protection** against cascading failures
- **Graceful degradation** when backend services are unavailable  
- **Quick recovery** when services become healthy again
- **Comprehensive monitoring** for operational visibility
- **Development flexibility** with appropriate fallbacks

The implementation ensures that temporary Azure Function issues don't impact the entire application while maintaining security and performance requirements.
