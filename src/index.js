import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { MIG } from "./classes/mig.js"

const __dirname = fileURLToPath(import.meta.url)
const filePath = join(__dirname, "../../circuit-descriptions/mig.json")

const jsonData = readFileSync(filePath, "utf8")
const circuit = new MIG()

circuit.parseCircuit(JSON.parse(jsonData), 1)
circuit.initializeCircuit(0)
// console.dir(circuit, { depth: null })

circuit.findAllPaths()
circuit.buildXDepthsDict()

const stateHistory = circuit.simulateCircuit(circuit.xDepthsDict)
console.log(stateHistory)
console.log("DELAY: ", circuit.calculateDelay(stateHistory))

// import { readFileSync } from "node:fs"
// import { join } from "node:path"
// import { fileURLToPath } from "node:url"
// import { Circuit } from "./classes/circuit.js"

// const __dirname = fileURLToPath(import.meta.url)
// const filePath = join(__dirname, "../../circuit-descriptions/fcircuit.json")

// const jsonData = readFileSync(filePath, "utf8")
// const circuit = new Circuit()
// circuit.parseCircuit(JSON.parse(jsonData), 1)
// circuit.initializeCircuit()
// // console.dir(circuit, { depth: null })

// circuit.findAllPaths()
// circuit.buildXDepthsDict()

// const stateHistory = circuit.simulateCircuit(circuit.xDepthsDict)
// console.log(stateHistory)
// // console.log("DELAY: ", circuit.calculateDelay(stateHistory))
