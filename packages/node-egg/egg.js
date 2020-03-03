const path = require('path')
const globby = require('globby')

module.exports = app => {
  const appFolder = path.resolve(__dirname, 'app')
  const context = app.context;

  const folderList = {
    config: path.resolve(appFolder, 'config'),
    middleware: path.resolve(appFolder, 'middleware'),
    service: path.resolve(appFolder, 'service'),
  }

  Object.keys(folderList).forEach(key => {
    const folderPath = folderList[key]
    const files = globby.sync('**/*.js', {
      cwd: folderPath
    })
    const prop = key;

    if (prop !== 'middleware') {
      context[prop] = {}
    }

    files.forEach(file => {
      const fileName = path.parse(file).name;
      const content = require(path.join(folderPath, fileName))
      if (prop === 'middleware') {
        if (fileName in context['config']) {
          const plugin = content(context['config'][fileName])
          app.use(plugin)
        }
        return;
      }

      if (prop === 'config' && content) {
        context[prop] = Object.assign({}, context[prop], content)
        return;
      }

      context[prop][fileName] = content
    })
  })
}