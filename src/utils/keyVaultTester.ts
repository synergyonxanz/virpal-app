/**
 * VirPal App - AI Assistant with Azure Functions
 * Copyright (c) 2025 Achmad Reihan Alfaiz. All rights reserved.
 *
 * This file is part of VirPal App, a proprietary software application.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This source code is the exclusive property of Achmad Reihan Alfaiz.
 * No part of this software may be reproduced, distributed, or transmitted
 * in any form or by any means, including photocopying, recording, or other
 * electronic or mechanical methods, without the prior written permission
 * of the copyright holder, except in the case of brief quotations embodied
 * in critical reviews and certain other noncommercial uses permitted by
 * copyright law.
 *
 * For licensing inquiries: reihan3000@gmail.com
 */

/**
 * Key Vault Connection Tester
 *
 * Utility untuk testing koneksi ke Azure Key Vault via Azure Functions
 * Membantu debugging issues dengan akses secrets
 */

import { frontendKeyVaultService } from '../services/frontendKeyVaultService';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  duration?: number;
}

interface KeyVaultTestSuite {
  overall: 'PASS' | 'FAIL' | 'WARN';
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export class KeyVaultTester {
  /**
   * Run comprehensive Key Vault connectivity tests
   */
  static async runTests(): Promise<KeyVaultTestSuite> {
    console.log('🔐 Starting Key Vault connectivity tests...\n');

    const results: TestResult[] = [];

    // Test 1: Service Configuration
    results.push(await this.testServiceConfiguration());

    // Test 2: Azure Function Health Check
    results.push(await this.testAzureFunctionHealth());

    // Test 3: Test Secret Access (Speech Service)
    results.push(await this.testSecretAccess('azure-speech-service-key'));

    // Test 4: Test Secret Access (Speech Region)
    results.push(await this.testSecretAccess('azure-speech-service-region'));

    // Test 5: Test Invalid Secret (should fail gracefully)
    results.push(await this.testInvalidSecret());

    // Test 6: Test OpenAI Secret (should have fallback)
    results.push(await this.testSecretAccess('OPENAI-API-KEY'));

    // Test 7: Circuit Breaker Functionality
    results.push(await this.testCircuitBreaker());

    // Test 8: Circuit Breaker Recovery
    results.push(await this.testCircuitBreakerRecovery());

    // Calculate summary
    const summary = {
      total: results.length,
      passed: results.filter((r) => r.status === 'PASS').length,
      failed: results.filter((r) => r.status === 'FAIL').length,
      warnings: results.filter((r) => r.status === 'WARN').length,
    };

    const overall =
      summary.failed > 0 ? 'FAIL' : summary.warnings > 0 ? 'WARN' : 'PASS';

    // Display results
    this.displayResults(results, summary, overall);

    return { overall, results, summary };
  }

  private static async testServiceConfiguration(): Promise<TestResult> {
    const startTime = performance.now();

    try {
      const isConfigured = frontendKeyVaultService.isConfigured();
      const status = frontendKeyVaultService.getStatus();

      const duration = performance.now() - startTime;

      if (!isConfigured) {
        return {
          test: 'Service Configuration',
          status: 'FAIL',
          message: 'Frontend Key Vault Service is not configured',
          duration,
        };
      }

      return {
        test: 'Service Configuration',
        status: 'PASS',
        message: `Service configured. Function URL: ${status.functionUrl}`,
        duration,
      };
    } catch (error) {
      return {
        test: 'Service Configuration',
        status: 'FAIL',
        message: `Configuration error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        duration: performance.now() - startTime,
      };
    }
  }

  private static async testAzureFunctionHealth(): Promise<TestResult> {
    const startTime = performance.now();

    try {
      const healthCheck = await frontendKeyVaultService.healthCheck();
      const duration = performance.now() - startTime;

      return {
        test: 'Azure Function Health',
        status: healthCheck.isHealthy ? 'PASS' : 'FAIL',
        message: healthCheck.message,
        duration,
      };
    } catch (error) {
      return {
        test: 'Azure Function Health',
        status: 'FAIL',
        message: `Health check failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        duration: performance.now() - startTime,
      };
    }
  }

  private static async testSecretAccess(
    secretName: string
  ): Promise<TestResult> {
    const startTime = performance.now();

    try {
      const secret = await frontendKeyVaultService.getSecret(secretName);
      const duration = performance.now() - startTime;

      if (secret === null) {
        return {
          test: `Secret Access: ${secretName}`,
          status: 'WARN',
          message:
            'Secret not found or access denied (using fallback if available)',
          duration,
        };
      }

      if (secret && secret.trim() !== '') {
        return {
          test: `Secret Access: ${secretName}`,
          status: 'PASS',
          message: `Secret retrieved successfully (length: ${secret.length})`,
          duration,
        };
      }

      return {
        test: `Secret Access: ${secretName}`,
        status: 'WARN',
        message: 'Secret retrieved but is empty',
        duration,
      };
    } catch (error) {
      return {
        test: `Secret Access: ${secretName}`,
        status: 'FAIL',
        message: `Failed to retrieve secret: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        duration: performance.now() - startTime,
      };
    }
  }

  private static async testInvalidSecret(): Promise<TestResult> {
    const startTime = performance.now();

    try {
      const secret = await frontendKeyVaultService.getSecret(
        'invalid-secret-name-test'
      );
      const duration = performance.now() - startTime;

      if (secret === null) {
        return {
          test: 'Invalid Secret Handling',
          status: 'PASS',
          message: 'Invalid secret handled gracefully (returned null)',
          duration,
        };
      }

      return {
        test: 'Invalid Secret Handling',
        status: 'WARN',
        message: 'Invalid secret returned a value (unexpected)',
        duration,
      };
    } catch (error) {
      return {
        test: 'Invalid Secret Handling',
        status: 'PASS',
        message: `Invalid secret handled with error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        duration: performance.now() - startTime,
      };
    }
  }
  private static async testCircuitBreaker(): Promise<TestResult> {
    const startTime = performance.now();

    try {
      // Get current circuit breaker status
      const initialMetrics = frontendKeyVaultService.getCircuitBreakerMetrics();
      const status = frontendKeyVaultService.getStatus();

      console.log(`🔌 Circuit breaker state: ${initialMetrics.state}`);
      console.log(`🔌 Failure count: ${initialMetrics.failureCount}`);
      console.log(`🔌 Is configured: ${status.isConfigured}`);

      // Test that circuit breaker is properly initialized
      if (
        initialMetrics.state === 'closed' ||
        initialMetrics.state === 'open' ||
        initialMetrics.state === 'half-open'
      ) {
        return {
          test: 'Circuit Breaker Functionality',
          status: 'PASS',
          message: `Circuit breaker is active in '${initialMetrics.state}' state with ${initialMetrics.failureCount} failures`,
          duration: performance.now() - startTime,
        };
      } else {
        return {
          test: 'Circuit Breaker Functionality',
          status: 'WARN',
          message:
            'Circuit breaker state is unknown or not properly initialized',
          duration: performance.now() - startTime,
        };
      }
    } catch (error) {
      return {
        test: 'Circuit Breaker Functionality',
        status: 'FAIL',
        message: `Circuit breaker test failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        duration: performance.now() - startTime,
      };
    }
  }

  private static async testCircuitBreakerRecovery(): Promise<TestResult> {
    const startTime = performance.now();

    try {
      // Test manual circuit breaker reset functionality
      const beforeReset = frontendKeyVaultService.getCircuitBreakerMetrics();

      // Reset the circuit breaker
      frontendKeyVaultService.resetCircuitBreaker();

      // Get metrics after reset
      const afterReset = frontendKeyVaultService.getCircuitBreakerMetrics();

      console.log(
        `🔄 Circuit breaker reset: ${beforeReset.failureCount} -> ${afterReset.failureCount} failures`
      );

      if (afterReset.failureCount === 0 && afterReset.state === 'closed') {
        return {
          test: 'Circuit Breaker Recovery',
          status: 'PASS',
          message: `Circuit breaker successfully reset from ${beforeReset.failureCount} failures to closed state`,
          duration: performance.now() - startTime,
        };
      } else {
        return {
          test: 'Circuit Breaker Recovery',
          status: 'WARN',
          message: `Circuit breaker reset but state is '${afterReset.state}' with ${afterReset.failureCount} failures`,
          duration: performance.now() - startTime,
        };
      }
    } catch (error) {
      return {
        test: 'Circuit Breaker Recovery',
        status: 'FAIL',
        message: `Circuit breaker recovery test failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        duration: performance.now() - startTime,
      };
    }
  }

  private static displayResults(
    results: TestResult[],
    summary: any,
    overall: string
  ): void {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(80));

    results.forEach((result, index) => {
      const icon =
        result.status === 'PASS'
          ? '✅'
          : result.status === 'WARN'
          ? '⚠️'
          : '❌';
      const duration = result.duration
        ? ` (${result.duration.toFixed(0)}ms)`
        : '';

      console.log(
        `${index + 1}. ${icon} ${result.test}: ${result.message}${duration}`
      );
    });

    console.log('\n' + '='.repeat(80));
    console.log(
      `Overall Status: ${
        overall === 'PASS'
          ? '✅ PASS'
          : overall === 'WARN'
          ? '⚠️ WARNINGS'
          : '❌ FAIL'
      }`
    );
    console.log(
      `Total Tests: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed} | Warnings: ${summary.warnings}`
    );

    if (overall !== 'PASS') {
      console.log('\n🔧 Troubleshooting Tips:');

      if (summary.failed > 0) {
        console.log(
          '• Check if Azure Functions is running: npm run watch (functions)'
        );
        console.log(
          '• Verify Azure Function endpoint in environment variables'
        );
        console.log('• Check Azure authentication status');
        console.log('• Verify Key Vault permissions and configuration');
      }

      if (summary.warnings > 0) {
        console.log('• Some secrets may not be configured in Key Vault');
        console.log('• Check fallback values for development secrets');
        console.log(
          '• Review authentication requirements for production secrets'
        );
      }
    } else {
      console.log(
        '\n🎉 All tests passed! Key Vault integration is working correctly.'
      );
    }

    console.log('\n📝 Debug Information:');
    const status = frontendKeyVaultService.getStatus();
    console.log(`Function URL: ${status.functionUrl}`);
    console.log(`Cache Size: ${status.cacheSize} entries`);
    console.log(`Warnings Shown: ${status.warningsCount}`);
    console.log(`Service Configured: ${status.isConfigured}`);
  }

  /**
   * Quick test for a specific secret
   */
  static async testSecret(secretName: string): Promise<void> {
    console.log(`🔍 Testing secret: ${secretName}`);

    try {
      const startTime = performance.now();
      const secret = await frontendKeyVaultService.getSecret(secretName);
      const duration = performance.now() - startTime;

      if (secret === null) {
        console.log(`❌ Secret '${secretName}' not found or access denied`);
      } else if (secret.trim() === '') {
        console.log(`⚠️ Secret '${secretName}' is empty`);
      } else {
        console.log(
          `✅ Secret '${secretName}' retrieved successfully (length: ${
            secret.length
          }, ${duration.toFixed(0)}ms)`
        );
      }
    } catch (error) {
      console.log(
        `❌ Error retrieving secret '${secretName}': ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
  /**
   * Clear all caches and reset service state
   */
  static resetService(): void {
    console.log('🔄 Resetting Key Vault service...');

    frontendKeyVaultService.clearCache();
    frontendKeyVaultService.clearWarningCache();
    frontendKeyVaultService.resetCircuitBreaker();

    console.log('✅ Service reset complete (including circuit breaker)');
  }

  /**
   * Test circuit breaker behavior with detailed monitoring
   */
  static async testCircuitBreakerBehavior(): Promise<void> {
    console.log('🔌 Starting comprehensive circuit breaker behavior test...\n');

    try {
      // Reset circuit breaker to start clean
      frontendKeyVaultService.resetCircuitBreaker();

      // Test 1: Normal operation (closed state)
      console.log('📊 Test 1: Normal operation (circuit closed)');
      let metrics = frontendKeyVaultService.getCircuitBreakerMetrics();
      console.log(`State: ${metrics.state}, Failures: ${metrics.failureCount}`);

      // Test 2: Try to access a valid secret
      console.log('\n📊 Test 2: Valid secret access');
      try {
        const secret = await frontendKeyVaultService.getSecret(
          'azure-speech-service-key'
        );
        metrics = frontendKeyVaultService.getCircuitBreakerMetrics();
        console.log(
          `✅ Secret access result: ${secret ? 'Found' : 'Not found'}`
        );
        console.log(
          `Circuit state after success: ${metrics.state}, Failures: ${metrics.failureCount}`
        );
      } catch (error) {
        console.log(
          `⚠️ Secret access failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
        metrics = frontendKeyVaultService.getCircuitBreakerMetrics();
        console.log(
          `Circuit state after failure: ${metrics.state}, Failures: ${metrics.failureCount}`
        );
      }

      // Test 3: Service health check
      console.log(
        '\n📊 Test 3: Service health check with circuit breaker status'
      );
      const health = await frontendKeyVaultService.healthCheck();
      console.log(
        `Health: ${health.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`
      );
      console.log(`Message: ${health.message}`);
      console.log(`Circuit breaker in health check:`);
      console.log(`  - Open: ${health.circuitBreaker.isOpen}`);
      console.log(`  - Half-Open: ${health.circuitBreaker.isHalfOpen}`);
      console.log(`  - Failures: ${health.circuitBreaker.failureCount}`);

      // Test 4: Simulate failure scenario
      console.log('\n📊 Test 4: Simulate failure scenario');
      console.log('Attempting to access non-existent service...');

      // Temporarily modify function URL to cause failures
      const originalStatus = frontendKeyVaultService.getStatus();
      console.log(`Original function URL: ${originalStatus.functionUrl}`);

      // Test with invalid secrets that should cause failures
      for (let i = 1; i <= 4; i++) {
        console.log(`\nFailure attempt ${i}:`);
        try {
          await frontendKeyVaultService.getSecret(`non-existent-secret-${i}`);
        } catch (error) {
          // Expected to fail
        }

        const currentMetrics =
          frontendKeyVaultService.getCircuitBreakerMetrics();
        console.log(
          `  State: ${currentMetrics.state}, Failures: ${currentMetrics.failureCount}`
        );

        if (currentMetrics.state === 'open') {
          console.log(
            `🔴 Circuit breaker opened after ${currentMetrics.failureCount} failures!`
          );
          break;
        }
      }

      // Test 5: Verify circuit breaker is blocking requests
      console.log(
        '\n📊 Test 5: Verify circuit breaker blocks requests when open'
      );
      const finalMetrics = frontendKeyVaultService.getCircuitBreakerMetrics();
      if (finalMetrics.state === 'open') {
        try {
          await frontendKeyVaultService.getSecret('test-secret-blocked');
          console.log(
            `⚠️ Unexpected: Request succeeded when circuit should be open`
          );
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes('circuit breaker is open')
          ) {
            console.log(
              `✅ Circuit breaker correctly blocked request: ${error.message}`
            );
          } else {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            console.log(
              `⚠️ Request failed but not due to circuit breaker: ${errorMessage}`
            );
          }
        }
      }

      // Test 6: Manual reset
      console.log('\n📊 Test 6: Manual circuit breaker reset');
      frontendKeyVaultService.resetCircuitBreaker();
      const resetMetrics = frontendKeyVaultService.getCircuitBreakerMetrics();
      console.log(
        `✅ Circuit breaker reset: State=${resetMetrics.state}, Failures=${resetMetrics.failureCount}`
      );
    } catch (error) {
      console.error('❌ Circuit breaker test failed:', error);
    }

    console.log('\n🎯 Circuit breaker behavior test completed!');
  }

  /**
   * Monitor circuit breaker metrics in real-time
   */
  static startCircuitBreakerMonitoring(
    intervalMs: number = 5000
  ): NodeJS.Timeout {
    console.log(
      `📊 Starting circuit breaker monitoring (${intervalMs}ms intervals)...`
    );
    console.log('Use clearInterval(intervalId) to stop monitoring\n');

    return setInterval(() => {
      const metrics = frontendKeyVaultService.getCircuitBreakerMetrics();
      const timestamp = new Date().toLocaleTimeString();

      console.log(`[${timestamp}] Circuit Breaker Status:`);
      console.log(`  State: ${metrics.state}`);
      console.log(`  Failures: ${metrics.failureCount}`);
      console.log(
        `  Time since last failure: ${metrics.timeSinceLastFailure}ms`
      );
      console.log(`  Consecutive successes: ${metrics.consecutiveSuccesses}`);
      console.log('---');
    }, intervalMs);
  }
}

// Export for console use
(window as any).KeyVaultTester = KeyVaultTester;

export default KeyVaultTester;
