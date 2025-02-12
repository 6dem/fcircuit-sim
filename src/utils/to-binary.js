export function toBinary(num, length) {
    return num.toString(2).padStart(length, "0")
}
