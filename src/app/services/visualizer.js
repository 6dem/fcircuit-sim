class Visualizer {
    constructor(container, circuitData, depthDict, stepTime = 1000) {
        this.container = container
        this.width = container.offsetWidth
        this.height = container.offsetHeight

        this.stage = new Konva.Stage({
            container: this.container,
            width: this.width,
            height: this.height,
        })

        this.layer = new Konva.Layer()
        this.stage.add(this.layer)

        this.elements = {}
        this.connections = {}
        this.circuitData = circuitData
        this.depthDict = depthDict
        this.stepTime = stepTime
        this.currentStep = 0
        this.stateHistory

        this.spacingX = 120
        this.spacingY = 150

        console.log("🚀 ~ Visualizer ~ constructor ~ this.stage:", this.stage)
    }

    showError() {
        this.layer.clear()
        const centerX = this.stage.width() / 2
        const centerY = this.stage.height() / 2

        const errorPath = new Konva.Path({
            x: this.stage.width() / 2 - 200,
            y: this.stage.height() / 2 - 200,
            data: "M2 18C2 9.16342 9.16345 1.99998 18 1.99998L386 2C394.837 2 402 9.16344 402 18L402 162.192L401.925 162.97C401.848 163.752 401.733 164.897 401.581 166.328C401.275 169.194 400.82 173.197 400.226 177.739C399.022 186.931 397.295 197.928 395.157 206.177C391.16 221.597 388.194 229.935 381.444 244.722C370.98 267.65 364.092 279.899 347.351 299.56C337.458 311.179 330.218 317.519 319.059 327.292C317.123 328.988 315.068 330.788 312.862 332.736C311.613 333.837 310.411 334.901 309.249 335.928C295.518 348.071 287.302 355.338 271.376 366.095C258.406 374.856 239.61 384.501 223.567 392.132C215.643 395.902 208.564 399.098 203.471 401.351C202.534 401.766 201.466 401.766 200.529 401.351C195.436 399.098 188.357 395.902 180.433 392.132C164.39 384.501 145.594 374.856 132.624 366.095C116.697 355.338 108.481 348.071 94.75 335.928C93.5886 334.9 92.3872 333.837 91.1386 332.736C88.9314 330.788 86.8772 328.989 84.9415 327.292C73.7814 317.519 66.5428 311.179 56.65 299.56C39.9086 279.899 33.02 267.65 22.5557 244.722C15.8057 229.935 12.84 221.597 8.84289 206.177C6.70431 197.928 4.97716 186.931 3.77431 177.739C3.18005 173.197 2.72433 169.194 2.42004 166.328C2.26717 164.897 2.15142 163.752 2.07427 162.97L1.99999 162.192L2 18Z",
            stroke: "white",
            strokeWidth: 4,
            scaleX: 1,
            scaleY: 1,
        })

        errorPath.fillLinearGradientStartPoint({
            x: centerX - 200,
            y: 0,
        })
        errorPath.fillLinearGradientEndPoint({
            x: 0,
            y: 0,
        })
        errorPath.fillLinearGradientColorStops([0, "#808080", 1, "#1a1a1a"])

        const line1 = new Konva.Path({
            x: centerX - 200,
            y: centerY - 200,
            data: "M322 322L7.99998 7.99998",
            stroke: "white",
            strokeWidth: 4,
            lineCap: "round",
        })

        const line2 = new Konva.Path({
            x: centerX - 200,
            y: centerY - 200,
            data: "M82 322L396 7.99998",
            stroke: "white",
            strokeWidth: 4,
            lineCap: "round",
        })

        this.layer.add(errorPath)
        this.layer.add(line1)
        this.layer.add(line2)
        this.layer.draw()
    }

    buildCircuit() {
        this.buildElements()
        this.buildConnections()
        const inititalScale = this.calculateInitialScale()
        this.scaleStage(inititalScale)
    }

    resetCanvas() {
        if (this.stage) {
            this.stage.destroy()
            this.stage = null
        }

        const container = document.getElementById("visualization-container")
        container.innerHTML = ""
    }

    buildElements() {
        Object.entries(this.depthDict).forEach(([depth, nodes]) => {
            const sortedNodes =
                depth === "0" ? [...nodes].sort((a, b) => a - b) : [...nodes]

            sortedNodes.forEach((nodeId, index) => {
                const elementType = this.getElementType(nodeId)
                const { x, y } = this.calculatePosition(
                    depth,
                    index,
                    sortedNodes.length
                )

                let element
                if (elementType === "ZeroElement") {
                    element = new ZeroElement(this.layer, x, y, nodeId)
                } else if (elementType === "InputElement") {
                    element = new InputElement(
                        this.layer,
                        x + 30,
                        y + 30,
                        nodeId
                    )
                } else {
                    element = new FunctionalElement(this.layer, x, y, nodeId)
                }

                this.elements[nodeId] = element
            })
        })
        this.layer.draw()
    }

    buildConnections() {
        Object.entries(this.circuitData.instancesFE).forEach(
            ([index, feData]) => {
                const feId = feData.id
                feData.inputsFE.forEach((inputId) => {
                    const fromElement = this.elements[inputId]
                    const toElement = this.elements[feId]

                    if (!fromElement || !toElement) return

                    const points = [
                        fromElement.outputCoords?.[0] ??
                            fromElement.centerCoords[0],
                        fromElement.outputCoords?.[1] ??
                            fromElement.centerCoords[1],
                        toElement.centerCoords[0],
                        toElement.centerCoords[1],
                    ]

                    const key = `${inputId}-${feId}`
                    this.connections[key] = new Connection(this.layer, points)
                })
            }
        )
        this.layer.draw()
    }

    getElementType(nodeId) {
        if (nodeId === 0) return "ZeroElement"
        if (this.depthDict["0"].has(nodeId)) return "InputElement"
        return "FunctionalElement"
    }

    calculatePosition(depth, index, total) {
        const centerX = this.stage.width() / 2

        return {
            x: centerX + (index - (total - 1) / 2) * this.spacingX,
            y: depth * this.spacingY + 50,
        }
    }

    calculateCircuitSize(depthDict) {
        if (!depthDict || Object.keys(depthDict).length === 0) {
            return [0, 0]
        }

        const depth = depthDict ? Object.keys(depthDict).length : 0
        const widths = []
        Object.values(depthDict).forEach((elemsPerDepth) => {
            widths.push(elemsPerDepth.size)
        })
        const width = widths.length > 0 ? Math.max(...widths) : 0

        const circuitWidth = width * this.spacingX
        const circuitHeight = depth * this.spacingY

        const circuitSize = [circuitWidth, circuitHeight]
        console.log(
            "🚀 ~ Visualizer ~ calculateCircuitSize ~ circuitSize:",
            circuitSize
        )
        return circuitSize
    }

    calculateInitialScale() {
        const [circuitWidth, circuitHeight] = this.calculateCircuitSize(
            this.depthDict
        )
        this.circuitWidth = circuitWidth
        this.circuitHeight = circuitHeight

        const scaleX = this.width / circuitWidth
        const scaleY = this.height / circuitHeight

        return Math.min(scaleX, scaleY, 1)
    }

    scaleStage(scale) {
        if (scale === 1) return
        const newWidth = this.circuitWidth * scale
        const newHeight = this.circuitHeight * scale

        const offsetX = (this.width - newWidth) / 2 - this.spacingX
        const offsetY = 0

        this.stage.scale({ x: scale, y: scale })
        this.stage.position({ x: offsetX, y: offsetY })
        this.stage.batchDraw()
    }
}

class BaseElement {
    constructor(layer, x, y, id) {
        this.layer = layer
        this.id = id
        this.value = null
        this.x = x
        this.y = y
        this.width
        this.height
        this.centerCoords
    }

    calculateCenter() {
        this.centerCoords = [this.x + this.width / 2, this.y + this.height / 2]
    }

    createShape(x, y) {
        throw new Error("Method 'createShape' must be implemented.")
    }

    applyGradient() {
        this.shape.fillLinearGradientStartPoint({
            x: this.width,
            y: 0,
        })
        this.shape.fillLinearGradientEndPoint({
            x: 0,
            y: 0,
        })
        this.shape.fillLinearGradientColorStops([0, "#808080", 1, "#1a1a1a"])
    }

    applyShadow() {
        this.shape.shadowColor("rgba(255, 255, 255, 0.25)")
        this.shape.shadowBlur(30)
        this.shape.shadowOffset({ x: 3, y: 3 })
    }
}

class ZeroElement extends BaseElement {
    constructor(layer, x, y, id) {
        super(layer, x, y, id)
        this.width = 60
        this.height = 60
        this.calculateCenter()

        this.shape = this.createShape(this.x, this.y)
        this.applyGradient()
        this.layer.add(this.shape)
    }

    createShape(x, y) {
        return new Konva.Rect({
            x,
            y,
            width: this.width,
            height: this.height,
            cornerRadius: 16,
        })
    }
}

class InputElement extends BaseElement {
    constructor(layer, x, y, id) {
        super(layer, x, y, id)
        this.width = 62
        this.height = 62
        this.radius = this.width / 2
        this.calculateCenter()

        this.shape = this.createShape(this.x, this.y)
        this.applyGradient()
        this.layer.add(this.shape)
    }
    createShape(x, y) {
        return new Konva.Circle({
            x,
            y,
            radius: this.radius,
        })
    }

    calculateCenter() {
        this.centerCoords = [this.x, this.y]
    }

    applyGradient() {
        this.shape.fillLinearGradientStartPoint({
            x: this.width / 2,
            y: 0,
        })
        this.shape.fillLinearGradientEndPoint({
            x: -(this.width / 2),
            y: 0,
        })
        this.shape.fillLinearGradientColorStops([0, "#808080", 1, "#1a1a1a"])
    }
}

class FunctionalElement extends BaseElement {
    constructor(layer, x, y, id) {
        super(layer, x, y, id)
        this.width = 85 * 0.75
        this.height = 85 * 0.75
        this.calculateCenter()
        this.outputCoords = [this.centerCoords[0], this.y + this.height - 2]
        this.centerCoords = [
            this.centerCoords[0],
            this.centerCoords[1] - this.height / 4,
        ]

        this.shape = this.createShape(this.x, this.y)
        this.applyGradient()
        this.layer.add(this.shape)
    }
    createShape(x, y) {
        const shape = new Konva.Path({
            x: x,
            y: y,
            data: "M-6.99382e-07 16C-3.13124e-07 7.16344 7.16344 -3.40234e-06 16 -3.01609e-06L69 -6.99382e-07C77.8366 -3.13124e-07 85 7.16344 85 16L85 34.0408L84.9841 34.2061C84.9678 34.3723 84.9433 34.6157 84.9109 34.9197C84.8459 35.5287 84.7493 36.3793 84.623 37.3445C84.3672 39.2979 84.0002 41.6347 83.5459 43.3877C82.6964 46.6644 82.0661 48.4361 80.6319 51.5785C78.4082 56.4507 76.9445 59.0535 73.387 63.2316C71.2848 65.7005 69.7464 67.0478 67.375 69.1245C66.9636 69.4849 66.527 69.8674 66.0581 70.2814C65.7927 70.5154 65.5374 70.7414 65.2904 70.9596C62.3726 73.54 60.6267 75.0843 57.2423 77.3702C54.4862 79.2319 50.4921 81.2815 47.083 82.9031C45.3991 83.7042 43.8949 84.3834 42.8127 84.862C42.6136 84.9503 42.3864 84.9503 42.1873 84.862C41.1051 84.3834 39.6009 83.7042 37.917 82.9031C34.5079 81.2815 30.5138 79.2319 27.7577 77.3702C24.3731 75.0843 22.6273 73.54 19.7094 70.9596C19.4626 70.7412 19.2073 70.5154 18.942 70.2814C18.4729 69.8674 18.0364 69.4851 17.6251 69.1245C15.2536 67.0478 13.7154 65.7005 11.6131 63.2315C8.05557 59.0535 6.59175 56.4507 4.36809 51.5785C2.93371 48.4361 2.3035 46.6644 1.45411 43.3877C0.999662 41.6347 0.632651 39.2979 0.377043 37.3445C0.250761 36.3793 0.153914 35.5287 0.0892548 34.9197C0.0567764 34.6157 0.0321717 34.3723 0.0157837 34.2061L-1.48797e-06 34.0408L-6.99382e-07 16Z",
            scaleX: 0.75,
            scaleY: 0.75,
        })
        return shape
    }
}

class Connection {
    constructor(layer, points) {
        this.shape = new Konva.Line({
            points: points,
            strokeWidth: 3,
            closed: false,
            lineCap: "round",
            lineJoin: "round",
            opacity: 0.5,
            strokeLinearGradientStartPoint: { x: points[0], y: points[1] },
            strokeLinearGradientEndPoint: { x: points[2], y: points[3] },
            strokeLinearGradientColorStops: [0, "#808080", 1, "#1a1a1a"],
        })
        layer.add(this.shape)
        this.shape.moveToBottom()
    }
}

export { Visualizer }
