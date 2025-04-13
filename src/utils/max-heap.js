class MaxHeap {
    constructor(capacity) {
        this.capacity = capacity
        this.heap = []
    }

    isWorse(a, b) {
        return (
            a.metric > b.metric || (a.metric === b.metric && a.depth < b.depth)
        )
    }

    push(item) {
        if (this.heap.length < this.capacity) {
            this.heap.push(item)
            this.heapifyUp()
        } else if (this.isWorse(this.heap[0], item)) {
            this.heap[0] = item
            this.heapifyDown()
        }
    }

    heapifyUp() {
        let index = this.heap.length - 1
        while (index > 0) {
            const parent = (index - 1) >> 1
            if (!this.isWorse(this.heap[index], this.heap[parent])) break
            ;[this.heap[parent], this.heap[index]] = [
                this.heap[index],
                this.heap[parent],
            ]
            index = parent
        }
    }

    heapifyDown() {
        let index = 0
        const length = this.heap.length
        while (true) {
            const left = 2 * index + 1
            const right = 2 * index + 2
            let worst = index

            if (
                left < length &&
                this.isWorse(this.heap[left], this.heap[worst])
            ) {
                worst = left
            }
            if (
                right < length &&
                this.isWorse(this.heap[right], this.heap[worst])
            ) {
                worst = right
            }
            if (worst === index) break
            ;[this.heap[index], this.heap[worst]] = [
                this.heap[worst],
                this.heap[index],
            ]
            index = worst
        }
    }

    getSorted() {
        return this.heap.sort(
            (a, b) => a.metric - b.metric || b.depth - a.depth
        )
    }
}

export { MaxHeap }
