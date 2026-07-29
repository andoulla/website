class FailedTestsReporter {
  onTestResult(test, testResult) {
    if (!testResult.success && testResult.testResults.length > 0) {
      const failedTests = testResult.testResults
        .filter((result) => result.status === 'failed')
        .map((result) => result.fullName);

      if (failedTests.length > 0) {
        testResult.failedTests = failedTests;
      }
    }
  }

  onRunComplete(contexts, results) {
    const allFailedTests = [];

    results.testResults.forEach((testResult) => {
      if (testResult.failedTests) {
        allFailedTests.push(...testResult.failedTests.map((test) => `  ✕ ${test}`));
      }
    });

    if (allFailedTests.length > 0) {
      console.log('\n\n━━━ FAILED TESTS ━━━\n');
      console.log(allFailedTests.join('\n'));
      console.log('\n');
    }
  }
}

module.exports = FailedTestsReporter;
