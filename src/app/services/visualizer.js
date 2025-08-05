import Konva from "konva"
import { removeDuplicateComputedElements } from "../../utils/stateHistoryNormilize.js"
import { toBinary } from "../../utils/to-binary.js"
class Visualizer {
    constructor(container, circuitData, depthDict, isIndexShow = false) {
        this.container = container
        this.width = container.offsetWidth
        this.height = container.offsetHeight

        this.stage = new Konva.Stage({
            container: this.container,
            width: this.width,
            height: this.height,
        })

        this.ringLayer = new Konva.Layer()
        this.stage.add(this.ringLayer)
        this.layer = new Konva.Layer()
        this.stage.add(this.layer)

        this.elements = {}
        this.connections = {}
        this.circuitData = circuitData
        this.depthDict = depthDict
        this.stateHistory

        this.spacingX = 120
        this.spacingY = 150

        this.currentAnimation = null
        this.isAnimationComplete = false
        this.isRestart = false

        this.isIndexShow = isIndexShow
    }

    setField(field, value) {
        this[field] = value
    }

    showError() {
        this.ringLayer.clear()
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

    initializeCircuit(inputSetNumber, inputCount) {
        const inputSet = toBinary(inputSetNumber, inputCount)

        if (this.elements.hasOwnProperty(0)) {
            this.applyFillAndShadow(this.elements[0].shape, 0)
            if (this.isIndexShow) {
                this.elements[0].showIndex()
            }
        }

        for (let i = 1; i < inputCount + 1; i++) {
            const value = inputSet[i - 1]
            this.elements[i].value = +value

            if (this.elements[i]) {
                this.applyFillAndShadow(this.elements[i].shape, +value)
                if (this.isIndexShow) {
                    this.elements[i].hideIndex()
                    this.elements[i].showIndex()
                }
            }
        }
    }

    stopAnimation() {
        if (this.currentAnimation) {
            this.currentAnimation.stop()
        }
    }

    resumeAnimation() {
        if (this.currentAnimation) {
            this.currentAnimation.start()
        }
    }

    animateCircuit(stateHistory, stepTime) {
        this.isAnimationComplete = false
        this.isRestart = false
        this.stepTime = stepTime
        this.initializeZeroStep(stateHistory)
        removeDuplicateComputedElements(stateHistory)
        const steps = Object.keys(stateHistory)
            .map(Number)
            .sort((a, b) => a - b)

        const animateStep = (stepIndex) => {
            if (this.isRestart) return
            if (stepIndex >= steps.length) {
                this.isAnimationComplete = true
                return
            }

            const depth = steps[stepIndex]
            const elements = stateHistory[depth]
            const connectionsToAnimate = []

            Object.entries(elements).forEach(([id, { state, outputValue }]) => {
                const element = this.elements[id]
                if (!element) return

                if (state === "uncertain") {
                    this.applyFillAndShadow(element.shape, outputValue)
                } else if (state === "computed") {
                    if (element.id > this.circuitData.countInputs) {
                        element.value = outputValue
                        this.applyFillAndShadow(element.shape, outputValue)
                        if (element.isOutput) {
                            this.applyOutputStyle(element, outputValue)
                        }
                        if (this.isIndexShow) {
                            element.showIndex()
                        }
                    }
                    Object.entries(this.connections).forEach(([key, conn]) => {
                        if (key.startsWith(`${id}-`)) {
                            connectionsToAnimate.push(conn)
                        }
                    })
                }
            })

            if (connectionsToAnimate.length === 0) {
                animateStep(stepIndex + 1)
                return
            }

            if (stepTime === 0) {
                connectionsToAnimate.forEach((conn) => this.updateConnectionGradient(conn, 1))
                animateStep(stepIndex + 1)
                return
            }

            const duration = stepTime * 1000
            let startTime = null
            const anim = new Konva.Animation((frame) => {
                if (startTime === null) startTime = frame.time
                const elapsedTime = frame.time - startTime
                const progress = Math.min(elapsedTime / duration, 1)

                connectionsToAnimate.forEach((conn) => {
                    this.updateConnectionGradient(conn, progress)
                })

                if (progress >= 1) {
                    anim.stop()
                    animateStep(stepIndex + 1)
                }
            }, this.layer)
            this.currentAnimation = anim
            anim.start()
        }

        animateStep(0)
    }

    updateConnectionGradient(conn, progress) {
        const { fromColor, toColor } = this.calculateConnectionColors(conn)

        if (this.stepTime === 0) {
            conn.shape.attrs.strokeLinearGradientColorStops = [0, fromColor, 0.59, fromColor, 0.61, toColor]
            return
        }

        let fromStop = progress
        let inverseStart = progress

        if (progress >= 0.6) {
            fromStop = 0.6 - progress * 0.01
            inverseStart = 0.6 + progress * 0.01
        }

        const gradientStops = [
            0,
            fromColor,
            fromStop,
            fromColor,
            inverseStart,
            toColor,
            progress,
            toColor,
            Math.min(progress + 0.01, 1),
            "#808080",
            1,
            "#1a1a1a",
        ]

        conn.shape.attrs.strokeLinearGradientColorStops = gradientStops
    }

    initializeZeroStep(stateHistory) {
        stateHistory[0] = this.circuitData.format === "mig" ? { 0: { state: "computed" } } : {}

        for (let i = 1; i <= this.circuitData.countInputs; i++) {
            stateHistory[0][i] = { state: "computed" }
        }
    }

    calculateConnectionColors(conn) {
        const [fromId, inputIndex, toId] = conn.key?.split("-") ?? conn.split("-")
        const value = this.elements[fromId].value
        let fromColor = value === 1 ? "white" : "black"
        let toColor = fromColor

        if (this.circuitData.format === "mig" || this.circuitData.format === "aig") {
            const fe = this.circuitData.instancesFE.find((fe) => fe.id == toId)
            const inverseValue = value ^ fe.inverses[inputIndex]
            toColor = inverseValue === 1 ? "white" : "black"
        }

        return { fromColor, toColor }
    }

    applyStroke(shape) {
        shape.stroke("#48319d")
        shape.strokeWidth(4)
    }

    hideStroke(shape) {
        shape.stroke(0)
    }

    applyFillAndShadow(shape, value) {
        let elemColor
        switch (value) {
            case 1:
                elemColor = "white"
                break
            case 0:
                elemColor = "black"
                break
        }

        if (elemColor) {
            shape.fill(elemColor)
        }

        let shadowColor = "rgba(255, 255, 255, 0.5)"

        shape.shadowColor(shadowColor)
        shape.shadowBlur(25)
        shape.shadowOffset({ x: 0, y: 0 })
        shape.shadowOpacity(1)
    }

    applyOutputStyle(element, value) {
        this.applyStroke(element.shape)
        if (this.circuitData.inversion !== undefined) {
            const outputCircle = new Konva.Circle({
                x: element.outputCoords[0],
                y: element.outputCoords[1] + 2,
                radius: 5,
            })
            const outputValue = value ^ this.circuitData.inversion
            this.applyFillAndShadow(outputCircle, outputValue)
            this.layer.add(outputCircle)
            outputCircle.moveToBottom()
        }
    }

    buildElements() {
        const elemShift = 30

        Object.entries(this.depthDict).forEach(([depth, nodes]) => {
            const sortedNodes = depth === "0" ? [...nodes].sort((a, b) => a - b) : [...nodes]

            sortedNodes.forEach((nodeId, index) => {
                const elementType = this.getElementType(nodeId)
                const { x, y } = this.calculatePosition(depth, index, sortedNodes.length)

                let element
                switch (elementType) {
                    case "ZeroElement":
                        element = new ZeroElement(this.layer, x - elemShift, y, nodeId, this.isIndexShow)
                        break
                    case "InputElement":
                        element = new InputElement(this.layer, x, y + elemShift, nodeId, this.isIndexShow)
                        break
                    case "FunctionalElement":
                        const outputId = this.circuitData.output || this.circuitData.outputNums
                        const isOutput = outputId.includes(nodeId)
                        element = new FunctionalElement(
                            this.layer,
                            x - elemShift,
                            y,
                            nodeId,
                            this.isIndexShow,
                            isOutput
                        )
                        break
                }

                this.elements[nodeId] = element
            })
        })
        this.layer.draw()
    }

    buildConnections() {
        Object.entries(this.circuitData.instancesFE).forEach(([index, feData]) => {
            const feId = feData.id
            feData.inputsFE.forEach((inputId, index) => {
                const fromElement = this.elements[inputId]
                const toElement = this.elements[feId]

                if (!fromElement || !toElement) return

                const x1 = fromElement.outputCoords?.[0] ?? fromElement.centerCoords[0]
                const y1 = fromElement.outputCoords?.[1] ?? fromElement.centerCoords[1]
                const x2 = toElement.centerCoords[0]
                const y2 = toElement.centerCoords[1]

                const points = [x1, y1, x2, y2]

                const key = `${inputId}-${index}-${feId}`
                this.connections[key] = new Connection(this.layer, points, key)

                if (this.circuitData.format === "mig" || this.circuitData.format === "aig") {
                    const fe = this.circuitData.instancesFE.find((fe) => fe.id == feId)
                    const isInverse = !!fe.inverses[index]

                    if (isInverse) {
                        const yTarget = y2 - 25
                        let xRing,
                            yRing = yTarget

                        const t = (yTarget - y1) / (y2 - y1)
                        xRing = x1 + t * (x2 - x1)

                        const ring = new Konva.Ring({
                            x: xRing,
                            y: yRing,
                            innerRadius: 3,
                            outerRadius: 4,
                            fill: "#808080",
                            stroke: "#808080",
                            strokeWidth: 1,
                            opacity: 0.5,
                        })

                        this.ringLayer.add(ring)
                    }
                }
            })
        })
        this.ringLayer.draw()
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
            y: depth * this.spacingY + 30,
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

        return circuitSize
    }

    calculateInitialScale() {
        const [circuitWidth, circuitHeight] = this.calculateCircuitSize(this.depthDict)
        this.circuitWidth = circuitWidth
        this.circuitHeight = circuitHeight

        const scaleX = this.width / circuitWidth
        const scaleY = this.height / circuitHeight

        return Math.min(scaleX, scaleY, 1)
    }

    scaleStage(scale) {
        if (scale === 1) return
        const newWidth = this.width * scale
        const newHeight = this.width * scale

        const offsetX = (this.width - newWidth) / 2
        const offsetY = 0

        this.stage.scale({ x: scale, y: scale })
        this.stage.position({ x: offsetX, y: offsetY })
        this.stage.batchDraw()
    }

    showSignChains(signChains) {
        for (const [key, value] of Object.entries(signChains)) {
            key.split("-").forEach((elemIndex) => {
                this.applyStroke(this.elements[elemIndex].shape)
            })
            value.forEach((path) => {
                path.split("_").forEach((conn) => {
                    delete this.connections[conn].shape.attrs.strokeLinearGradientColorStops
                    this.connections[conn].shape.opacity(1)
                    this.connections[conn].shape.stroke("#48319d")
                })
            })
        }
    }

    hideSignChains(signChains) {
        for (const [key, value] of Object.entries(signChains)) {
            key.split("-").forEach((elemIndex) => {
                if (!this.elements[elemIndex].isOutput) {
                    this.hideStroke(this.elements[elemIndex].shape)
                }
            })
            value.forEach((path) => {
                path.split("_").forEach((conn) => {
                    this.connections[conn].shape.opacity(0.5)
                    const { fromColor, toColor } = this.calculateConnectionColors(conn)

                    this.connections[conn].shape.attrs.strokeLinearGradientColorStops = [
                        0,
                        fromColor,
                        0.59,
                        fromColor,
                        0.61,
                        toColor,
                    ]
                })
            })
        }
    }

    showIndexes() {
        this.isIndexShow = true
        Object.values(this.elements).forEach((element) => {
            element.showIndex()
        })
    }

    hideIndexes() {
        this.isIndexShow = false
        Object.values(this.elements).forEach((element) => {
            element.hideIndex()
        })
    }
}

class BaseElement {
    constructor(layer, x, y, id, isIndexShow = false) {
        this.layer = layer
        this.id = id
        this.value = null
        this.x = x
        this.y = y
        this.isIndexShow = isIndexShow
        this.width
        this.height
        this.centerCoords
    }

    handleHover() {
        this.shape.on("mouseover", () => {
            this.showIndex()
        })

        this.shape.on("mouseout", () => {
            this.hideIndex()
        })
    }

    showIndex() {
        if (this.idText) {
            this.idText.destroy()
        }
        this.idText = new Konva.Text({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            align: "center",
            verticalAlign: "middle",
            text: `${this.id}`,
            fontSize: 30,
            fontFamily: "Roboto",
            fontStyle: "bold",
            fill: this.getIdColor(this.value) ?? "white",
        })

        this.layer.add(this.idText)
    }

    hideIndex() {
        if (this.idText) {
            this.idText.destroy()
        }
    }

    getIdColor(value) {
        return value === 1 ? "black" : "white"
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
    constructor(layer, x, y, id, isIndexShow) {
        super(layer, x, y, id, isIndexShow)

        this.value = 0

        this.width = 60
        this.height = 60
        this.calculateCenter()

        this.shape = this.createShape(this.x, this.y)
        this.applyGradient()
        this.layer.add(this.shape)
        if (this.isIndexShow) {
            this.showIndex()
        }
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
    constructor(layer, x, y, id, isIndexShow) {
        super(layer, x, y, id, isIndexShow)
        this.width = 62
        this.height = 62
        this.radius = this.width / 2
        this.calculateCenter()

        this.shape = this.createShape(this.x, this.y)
        this.applyGradient()
        this.layer.add(this.shape)
        if (this.isIndexShow) {
            this.showIndex()
        }
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

    showIndex() {
        this.idText = new Konva.Text({
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height,
            align: "center",
            verticalAlign: "middle",
            text: `${this.id}`,
            fontSize: 30,
            fontFamily: "Roboto",
            fontStyle: "bold",
            fill: this.getIdColor(this.value) ?? "white",
        })

        this.layer.add(this.idText)
    }
}

class FunctionalElement extends BaseElement {
    constructor(layer, x, y, id, isIndexShow, isOutput) {
        super(layer, x, y, id, isIndexShow)
        this.isOutput = isOutput
        this.width = 85 * 0.75
        this.height = 85 * 0.75
        this.calculateCenter()
        this.outputCoords = [this.centerCoords[0], this.y + this.height - 2]
        this.centerCoords = [this.centerCoords[0], this.centerCoords[1] - this.height / 4]

        this.shape = this.createShape(this.x, this.y)
        this.applyGradient()
        this.layer.add(this.shape)
        if (this.isIndexShow) {
            this.showIndex()
        }
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
    constructor(layer, points, key) {
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
        this.key = key
        layer.add(this.shape)
        this.shape.moveToBottom()
    }
}

export { Visualizer }

