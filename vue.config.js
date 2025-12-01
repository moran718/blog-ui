const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '拾光'
      return args
    })
  },
  devServer: {
    port: 8888,
    client: {
      overlay: false
    }
  }
})
