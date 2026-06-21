export default class Store extends EventTarget {
  state = {
    preferences: {
      theme: 'default',
    },
  }
  constructor() {
    super()
  }
}
