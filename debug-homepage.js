// Debug script for homepage issues
// Run this in browser console to diagnose issues

console.log('🔍 Homepage Debug Tool');

// Clear all cached data
function clearHomepageCache() {
  console.log('🧹 Clearing homepage cache...');
  
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('homepage_products') || key.includes('hero_slides') || key.includes('api_cache'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`  ✅ Removed: ${key}`);
  });
  
  console.log('🎉 Cache cleared!');
}

// Check API endpoints
async function checkAPIEndpoints() {
  console.log('🌐 Checking API endpoints...');
  
  const endpoints = [
    '/products/featured',
    '/products/new',
    '/settings/categories',
    '/settings/home-sections',
    '/settings/hero-slides',
    '/offers/active'
  ];
  
  const baseURL = 'https://sbflorist.in/api';
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint}`);
      console.log(`  ${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`    Error details: ${errorText}`);
      } else {
        const data = await response.json();
        console.log(`    Data length: ${Array.isArray(data) ? data.length : 'Object'}`);
      }
    } catch (error) {
      console.log(`  ❌ ${endpoint}: Network error - ${error.message}`);
    }
  }
}

// Check component loading
function checkComponents() {
  console.log('🧩 Checking components...');
  
  const components = [
    { name: 'Categories', selector: '[data-testid="categories"], .grid.grid-cols-2.sm\\:grid-cols-3.lg\\:grid-cols-6' },
    { name: 'ProductGrid (Featured)', selector: '[data-testid="featured-products"], .grid.grid-cols-1.xs\\:grid-cols-2' },
    { name: 'OffersSection', selector: '[data-testid="offers"], .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3' },
    { name: 'HomeHero', selector: '[data-testid="hero"], .relative.h-\\[50vh\\]' }
  ];
  
  components.forEach(({ name, selector }) => {
    const element = document.querySelector(selector);
    console.log(`  ${element ? '✅' : '❌'} ${name}: ${element ? 'Found' : 'Not found'}`);
    
    if (element) {
      const children = element.children.length;
      console.log(`    Children: ${children}`);
    }
  });
}

// Check React context data
function checkContextData() {
  console.log('📊 Checking React context data...');
  
  // Try to access React DevTools if available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('  ✅ React DevTools detected');
  } else {
    console.log('  ⚠️ React DevTools not found');
  }
  
  // Check for common React error patterns
  const errorElements = document.querySelectorAll('[data-testid*="error"], .error, .alert-destructive');
  if (errorElements.length > 0) {
    console.log(`  ❌ Found ${errorElements.length} error element(s):`);
    errorElements.forEach((el, index) => {
      console.log(`    ${index + 1}. ${el.textContent?.substring(0, 100)}...`);
    });
  } else {
    console.log('  ✅ No visible errors found');
  }
}

// Check loading states
function checkLoadingStates() {
  console.log('⏳ Checking loading states...');
  
  const loadingElements = document.querySelectorAll('.animate-spin, [data-testid*="loading"]');
  console.log(`  Found ${loadingElements.length} loading element(s)`);
  
  if (loadingElements.length > 0) {
    console.log('  ⚠️ Components still loading. Wait a moment and run checkComponents() again.');
  } else {
    console.log('  ✅ No loading indicators found');
  }
}

// Main diagnostic function
function diagnoseHomepage() {
  console.log('🏥 Running complete homepage diagnosis...');
  console.log('================================');
  
  clearHomepageCache();
  console.log('');
  
  checkLoadingStates();
  console.log('');
  
  checkComponents();
  console.log('');
  
  checkContextData();
  console.log('');
  
  console.log('🌐 Checking API endpoints (this may take a moment)...');
  checkAPIEndpoints().then(() => {
    console.log('');
    console.log('🎯 Diagnosis complete!');
    console.log('💡 If issues persist:');
    console.log('   1. Refresh the page');
    console.log('   2. Check Network tab for failed requests');
    console.log('   3. Check Console for React errors');
    console.log('   4. Run diagnoseHomepage() again');
  });
}

// Make functions available globally
window.clearHomepageCache = clearHomepageCache;
window.checkAPIEndpoints = checkAPIEndpoints;
window.checkComponents = checkComponents;
window.checkContextData = checkContextData;
window.checkLoadingStates = checkLoadingStates;
window.diagnoseHomepage = diagnoseHomepage;

console.log('🔧 Debug tools loaded!');
console.log('Available commands:');
console.log('  clearHomepageCache() - Clear all cached data');
console.log('  checkAPIEndpoints() - Test API connectivity');
console.log('  checkComponents() - Check if components are rendered');
console.log('  checkContextData() - Check React context');
console.log('  checkLoadingStates() - Check loading indicators');
console.log('  diagnoseHomepage() - Run complete diagnosis');
console.log('');
console.log('🚀 Run: diagnoseHomepage()'); 