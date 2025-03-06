import { InvertElement } from "./ig-nodes.js"

class AndInvertElement extends InvertElement {
    constructor(inputs, index, inverses) {
        super(8, inputs, index)
        this.inverses = inverses
    }
}

export { AndInvertElement }
