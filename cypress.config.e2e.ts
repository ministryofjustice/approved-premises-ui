import { defineConfig } from 'cypress'
import createBundler from '@bahmutov/cypress-esbuild-preprocessor'
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor'
import createEsbuildPlugin from '@badeball/cypress-cucumber-preprocessor/esbuild'
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill'
import NodeModulesPolyfillPlugin from '@esbuild-plugins/node-modules-polyfill'

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
): Promise<Cypress.PluginConfigOptions> {
  // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  await addCucumberPreprocessorPlugin(on, config)

  on(
    'file:preprocessor',
    createBundler({
      plugins: [NodeGlobalsPolyfillPlugin({ process: true }), NodeModulesPolyfillPlugin(), createEsbuildPlugin(config)],
    }),
  )

  // Make sure to return the config object as it might have been modified by the plugin.
  return config
}

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'cypress_shared/fixtures',
  screenshotsFolder: 'e2e/screenshots',
  videosFolder: 'e2e/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  videoUploadOnPasses: false,
  taskTimeout: 60000,
  e2e: {
    specPattern: 'e2e/tests/**/*.feature',
    setupNodeEvents,
    supportFile: false,
  },
  viewportHeight: 3000,
  viewportWidth: 660,
})
