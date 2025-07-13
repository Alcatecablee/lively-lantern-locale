/**
 * Master NeuroLint Orchestrator
 * Coordinates all 6 layers of code transformation with sophisticated error handling
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 NeuroLint Master Orchestrator - Sophisticated Code Transformation System');

// Import all layer processors
const layers = [
  { id: 1, name: 'Configuration Fixes', script: './fix-layer-1-config.js' },
  { id: 2, name: 'Pattern Fixes', script: './fix-layer-2-patterns.js' },
  { id: 3, name: 'Component Fixes', script: './fix-layer-3-components.js' },
  { id: 4, name: 'Hydration Fixes', script: './fix-layer-4-hydration.js' },
  { id: 5, name: 'Next.js Fixes', script: './fix-layer-5-nextjs.js' },
  { id: 6, name: 'Testing Fixes', script: './fix-layer-6-testing.js' }
];

class MasterOrchestrator {
  constructor(options = {}) {
    this.options = {
      verbose: true,
      failFast: false,
      validateEach: true,
      generateReport: true,
      ...options
    };
    this.executionReport = {
      startTime: Date.now(),
      layers: [],
      totalChanges: 0,
      errors: [],
      warnings: []
    };
  }

  async executeAllLayers() {
    console.log('📋 Executing sophisticated transformation pipeline...');
    
    for (const layer of layers) {
      await this.executeLayer(layer);
    }
    
    if (this.options.generateReport) {
      this.generateExecutionReport();
    }
    
    return this.executionReport;
  }

  async executeLayer(layer) {
    const startTime = Date.now();
    const layerResult = {
      id: layer.id,
      name: layer.name,
      startTime,
      endTime: null,
      success: false,
      changes: 0,
      errors: [],
      warnings: []
    };

    try {
      console.log(`\n🔧 Layer ${layer.id}: ${layer.name}`);
      console.log('─'.repeat(50));
      
      // Execute layer script
      const scriptPath = path.join(__dirname, layer.script);
      
      if (!fs.existsSync(scriptPath)) {
        throw new Error(`Layer script not found: ${scriptPath}`);
      }

      // Execute the layer script and capture output
      const result = execSync(`node "${scriptPath}"`, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Parse execution results from output
      const changeMatches = result.match(/(\d+)\s+fixes?\s+applied/gi);
      const changes = changeMatches ? 
        changeMatches.reduce((sum, match) => sum + parseInt(match.match(/\d+/)[0]), 0) : 0;

      layerResult.success = true;
      layerResult.changes = changes;
      this.executionReport.totalChanges += changes;

      console.log(`✅ Layer ${layer.id} completed: ${changes} changes applied`);

    } catch (error) {
      layerResult.errors.push(error.message);
      this.executionReport.errors.push({
        layer: layer.id,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      console.error(`❌ Layer ${layer.id} failed: ${error.message}`);

      if (this.options.failFast) {
        throw error;
      }
    } finally {
      layerResult.endTime = Date.now();
      layerResult.executionTime = layerResult.endTime - layerResult.startTime;
      this.executionReport.layers.push(layerResult);
    }
  }

  generateExecutionReport() {
    const totalTime = Date.now() - this.executionReport.startTime;
    const successfulLayers = this.executionReport.layers.filter(l => l.success).length;
    const failedLayers = this.executionReport.layers.filter(l => !l.success).length;

    console.log('\n📊 Execution Report');
    console.log('═'.repeat(60));
    console.log(`Total Execution Time: ${totalTime}ms`);
    console.log(`Successful Layers: ${successfulLayers}/${layers.length}`);
    console.log(`Failed Layers: ${failedLayers}`);
    console.log(`Total Changes Applied: ${this.executionReport.totalChanges}`);
    
    if (this.executionReport.errors.length > 0) {
      console.log('\n❌ Errors Encountered:');
      this.executionReport.errors.forEach(error => {
        console.log(`  Layer ${error.layer}: ${error.error}`);
      });
    }

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'neurolint-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      ...this.executionReport,
      totalExecutionTime: totalTime,
      timestamp: new Date().toISOString()
    }, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Execute if run directly
if (require.main === module) {
  const orchestrator = new MasterOrchestrator();
  
  orchestrator.executeAllLayers()
    .then(report => {
      if (report.errors.length === 0) {
        console.log('\n🎉 All layers executed successfully!');
        process.exit(0);
      } else {
        console.log('\n⚠️ Some layers encountered errors. Check the report for details.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Master orchestrator failed:', error.message);
      process.exit(1);
    });
}

export default MasterOrchestrator;
