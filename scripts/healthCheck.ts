/**
 * RevenuePilot AI - Health Check Script
 * 
 * This script checks the health of all critical services:
 * - Gemini API connectivity
 * - Supabase database connectivity
 * - Environment variables
 * - API rate limits
 * 
 * Run with: npx tsx scripts/healthCheck.ts
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions
const log = (message: string, color: string = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const success = (message: string) => log(`✅ ${message}`, colors.green);
const error = (message: string) => log(`❌ ${message}`, colors.red);
const warning = (message: string) => log(`⚠️  ${message}`, colors.yellow);
const info = (message: string) => log(`ℹ️  ${message}`, colors.cyan);
const section = (message: string) => log(`\n${'='.repeat(60)}\n${message}\n${'='.repeat(60)}`, colors.bright);

// Health check results
interface HealthCheckResult {
  service: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const results: HealthCheckResult[] = [];

// Check environment variables
async function checkEnvironmentVariables(): Promise<HealthCheckResult> {
  section('🔍 Checking Environment Variables');
  
  const requiredVars = [
    'VITE_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missing: string[] = [];
  const present: string[] = [];
  
  for (const varName of requiredVars) {
    const value = process.env[varName] || (import.meta as any).env?.[varName];
    if (!value) {
      missing.push(varName);
      error(`${varName} is missing`);
    } else {
      present.push(varName);
      success(`${varName} is configured`);
    }
  }
  
  if (missing.length === 0) {
    return {
      service: 'Environment Variables',
      status: 'pass',
      message: 'All required environment variables are configured',
      details: { present, missing }
    };
  } else {
    return {
      service: 'Environment Variables',
      status: 'fail',
      message: `Missing ${missing.length} required variable(s)`,
      details: { present, missing }
    };
  }
}

// Check Gemini API
async function checkGeminiAPI(): Promise<HealthCheckResult> {
  section('🤖 Checking Gemini API');
  
  try {
    const apiKey = process.env.VITE_API_KEY || (import.meta as any).env?.VITE_API_KEY;
    
    if (!apiKey) {
      error('API key not found');
      return {
        service: 'Gemini API',
        status: 'fail',
        message: 'API key not configured'
      };
    }
    
    info('Testing API connectivity...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const startTime = Date.now();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Say "OK" if you can read this.' }] }],
      generationConfig: {
        maxOutputTokens: 10,
        temperature: 0
      }
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const text = result.response.text();
    
    if (text.toLowerCase().includes('ok')) {
      success(`API is responding (${responseTime}ms)`);
      
      if (responseTime < 2000) {
        success('Response time is excellent');
      } else if (responseTime < 5000) {
        warning('Response time is acceptable but could be better');
      } else {
        warning('Response time is slow');
      }
      
      return {
        service: 'Gemini API',
        status: 'pass',
        message: 'API is healthy and responding',
        details: { responseTime, model: 'gemini-2.0-flash-exp' }
      };
    } else {
      warning('API responded but with unexpected content');
      return {
        service: 'Gemini API',
        status: 'warning',
        message: 'API responding but output is unexpected',
        details: { responseTime, response: text }
      };
    }
  } catch (err: any) {
    error(`API check failed: ${err.message}`);
    
    if (err.message?.includes('503') || err.message?.includes('overloaded')) {
      return {
        service: 'Gemini API',
        status: 'warning',
        message: 'API is overloaded (temporary issue)',
        details: { error: err.message }
      };
    } else if (err.message?.includes('429')) {
      return {
        service: 'Gemini API',
        status: 'warning',
        message: 'Rate limit exceeded',
        details: { error: err.message }
      };
    } else if (err.message?.includes('API key')) {
      return {
        service: 'Gemini API',
        status: 'fail',
        message: 'Invalid API key',
        details: { error: err.message }
      };
    } else {
      return {
        service: 'Gemini API',
        status: 'fail',
        message: 'API check failed',
        details: { error: err.message }
      };
    }
  }
}

// Check Supabase connectivity
async function checkSupabase(): Promise<HealthCheckResult> {
  section('🗄️  Checking Supabase Database');
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      error('Supabase credentials not found');
      return {
        service: 'Supabase',
        status: 'fail',
        message: 'Supabase credentials not configured'
      };
    }
    
    info('Testing database connectivity...');
    
    // Simple fetch to check if Supabase is reachable
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok || response.status === 404) {
      success('Database is reachable');
      
      // Try to check if tables exist
      const tablesResponse = await fetch(`${supabaseUrl}/rest/v1/projects?limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (tablesResponse.ok) {
        success('Tables are accessible');
        return {
          service: 'Supabase',
          status: 'pass',
          message: 'Database is healthy and tables are accessible',
          details: { url: supabaseUrl }
        };
      } else if (tablesResponse.status === 404) {
        warning('Tables may not be created yet');
        return {
          service: 'Supabase',
          status: 'warning',
          message: 'Database is reachable but tables may not exist',
          details: { url: supabaseUrl, hint: 'Run database/schema.sql' }
        };
      } else {
        warning('Tables check returned unexpected status');
        return {
          service: 'Supabase',
          status: 'warning',
          message: 'Database is reachable but table access is unclear',
          details: { url: supabaseUrl, status: tablesResponse.status }
        };
      }
    } else {
      error(`Database returned status ${response.status}`);
      return {
        service: 'Supabase',
        status: 'fail',
        message: 'Database is not reachable',
        details: { url: supabaseUrl, status: response.status }
      };
    }
  } catch (err: any) {
    error(`Database check failed: ${err.message}`);
    return {
      service: 'Supabase',
      status: 'fail',
      message: 'Database connectivity check failed',
      details: { error: err.message }
    };
  }
}

// Check API rate limits
async function checkRateLimits(): Promise<HealthCheckResult> {
  section('⚡ Checking API Rate Limits');
  
  try {
    const apiKey = process.env.VITE_API_KEY || (import.meta as any).env?.VITE_API_KEY;
    
    if (!apiKey) {
      return {
        service: 'Rate Limits',
        status: 'fail',
        message: 'Cannot check rate limits without API key'
      };
    }
    
    info('Testing rate limit handling...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const requests = 3;
    const results: number[] = [];
    
    for (let i = 0; i < requests; i++) {
      const startTime = Date.now();
      await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Test ${i + 1}` }] }],
        generationConfig: { maxOutputTokens: 10 }
      });
      const endTime = Date.now();
      results.push(endTime - startTime);
      
      info(`Request ${i + 1}/${requests} completed in ${endTime - startTime}ms`);
    }
    
    const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
    
    success(`Completed ${requests} requests successfully`);
    info(`Average response time: ${avgTime.toFixed(0)}ms`);
    
    if (avgTime < 2000) {
      success('Rate limits are healthy');
    } else {
      warning('Response times are elevated, may be approaching limits');
    }
    
    return {
      service: 'Rate Limits',
      status: 'pass',
      message: 'Rate limits are healthy',
      details: { requests, avgTime: avgTime.toFixed(0), times: results }
    };
  } catch (err: any) {
    if (err.message?.includes('429')) {
      error('Rate limit exceeded');
      return {
        service: 'Rate Limits',
        status: 'fail',
        message: 'Rate limit exceeded',
        details: { error: err.message }
      };
    } else {
      error(`Rate limit check failed: ${err.message}`);
      return {
        service: 'Rate Limits',
        status: 'warning',
        message: 'Could not verify rate limits',
        details: { error: err.message }
      };
    }
  }
}

// Main health check
async function runHealthCheck() {
  log('\n' + '='.repeat(60), colors.bright);
  log('🏥 RevenuePilot AI - Health Check', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);
  
  info(`Started at: ${new Date().toLocaleString()}`);
  
  // Run all checks
  results.push(await checkEnvironmentVariables());
  results.push(await checkGeminiAPI());
  results.push(await checkSupabase());
  results.push(await checkRateLimits());
  
  // Summary
  section('📊 Health Check Summary');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  log('\nResults:', colors.bright);
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    const color = result.status === 'pass' ? colors.green : result.status === 'fail' ? colors.red : colors.yellow;
    log(`${icon} ${result.service}: ${result.message}`, color);
  });
  
  log('\nStatistics:', colors.bright);
  success(`Passed: ${passed}/${results.length}`);
  if (warnings > 0) warning(`Warnings: ${warnings}/${results.length}`);
  if (failed > 0) error(`Failed: ${failed}/${results.length}`);
  
  // Overall status
  log('\nOverall Status:', colors.bright);
  if (failed === 0 && warnings === 0) {
    success('🎉 All systems are healthy! Ready for production.');
  } else if (failed === 0) {
    warning('⚠️  Some warnings detected. Review before production.');
  } else {
    error('❌ Critical issues detected. Fix before production.');
  }
  
  log('\n' + '='.repeat(60), colors.bright);
  info(`Completed at: ${new Date().toLocaleString()}`);
  log('='.repeat(60) + '\n', colors.bright);
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runHealthCheck().catch(err => {
    error(`Health check failed: ${err.message}`);
    process.exit(1);
  });
}

export { runHealthCheck, checkEnvironmentVariables, checkGeminiAPI, checkSupabase, checkRateLimits };
