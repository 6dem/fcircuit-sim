import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { processAllCircuits } from "./services/process-circuits.js"

const __dirname = fileURLToPath(import.meta.url)
const filePath = join(__dirname, "../../circuit-descriptions/fcircuit.json")
const jsonData = JSON.parse(readFileSync(filePath, "utf8"))

processAllCircuits(jsonData)
