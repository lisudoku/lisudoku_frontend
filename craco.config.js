module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.forEach((rule) => {
        (rule.oneOf || []).forEach((oneOf) => {
          // Exclude wasm files from loader with type 'asset/resource'
          if (oneOf.exclude && Array.isArray(oneOf.exclude)) {
            oneOf.exclude.push(/\.wasm$/)
          }
        })
      })

      // Enable experimental wasm features
      webpackConfig.experiments = {
        ...webpackConfig.experiments,
        asyncWebAssembly: true,
        syncWebAssembly: true
      }

      return webpackConfig
    },
  },
}
