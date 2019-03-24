import makeState from './state'
import makeGetters from './getters'
import makeMutations from './mutations'
import makeActions from './actions'
import makeModel from './model'

const differencesToDocument = {
  apiPrefix: '', // Setting to 'api1/' will prefix the store moduleName, unless `namespace` is used, then this is ignored.
  modelName: '', // The location of this service's Model in the Vue plugin (globalModels object). Added in the servicePlugin method : NOW DERIVED FROM Model.name
  instanceDefaults: {}, // The default values for the instance when `const instance =new Model()`
  diffOnPatch: true // This is now true by default
}

export default function servicePluginInit(
  feathersClient,
  globalOptions = {},
  globalModels = {}
) {
  globalModels.byServicePath = globalModels.byServicePath || {}
  if (!feathersClient || !feathersClient.service) {
    throw new Error(
      'You must provide a Feathers Client instance to feathers-vuex'
    )
  }

  globalOptions = Object.assign({}, defaults, globalOptions)

  const serviceModule = function serviceModule(servicePath, options = {}) {
    options = Object.assign({}, globalOptions, options)
    const { debug, apiPrefix } = options

    if (typeof servicePath !== 'string') {
      throw new Error(
        'The first argument to setup a feathers-vuex service must be a string'
      )
    }

    const service = feathersClient.service(servicePath)
    if (!service) {
      throw new Error(
        'No service was found. Please configure a transport plugin on the Feathers Client. Make sure you use the client version of the transport, like `feathers-socketio/client` or `feathers-rest/client`.'
      )
    }
    const paginate =
      service.hasOwnProperty('paginate') &&
      service.paginate.hasOwnProperty('default')
    const stateOptions = Object.assign(options, { paginate })

    const defaultState = makeState(servicePath, stateOptions)
    const defaultGetters = makeGetters(servicePath)
    const defaultMutations = makeMutations(servicePath, {
      debug,
      globalModels,
      apiPrefix
    })
    const defaultActions = makeActions(service, { debug })
    const module = {
      namespaced: true,
      state: Object.assign({}, defaultState, options.state),
      getters: Object.assign({}, defaultGetters, options.getters),
      mutations: Object.assign({}, defaultMutations, options.mutations),
      actions: Object.assign({}, defaultActions, options.actions)
    }
    return module
  }

  const serviceModel = function serviceModel(options) {
    options = Object.assign({}, globalOptions, options, { globalModels })
    const Model = makeModel(options)

    return Model
  }

  const servicePlugin = function servicePlugin(module, Model, options = {}) {
    options = Object.assign({}, globalOptions, options)
    const { servicePath } = module.state

    module.state.modelName = modelInfo.path
    store.registerModule(namespace, module)
  }

  return createServicePlugin
}
