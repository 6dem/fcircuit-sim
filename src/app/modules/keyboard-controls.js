const keyBindings = [
    {
        code: "Escape",
        action: () => document.getElementById("modal-overlay")?.click(),
    },
    {
        code: "KeyF",
        action: () => document.getElementById("attach-file-button")?.click(),
    },
    {
        code: "KeyV",
        action: () => document.getElementById("visualize-button")?.click(),
    },
    {
        code: "KeyP",
        action: () => document.getElementById("perform-button")?.click(),
    },
    {
        code: "ArrowLeft",
        shift: true,
        action: () => document.getElementById("arrow-button-left")?.click(),
    },
    {
        code: "ArrowRight",
        shift: true,
        action: () => document.getElementById("arrow-button-right")?.click(),
    },
    {
        code: "ArrowUp",
        shift: true,
        action: () => document.getElementById("button--increase")?.click(),
    },
    {
        code: "ArrowDown",
        shift: true,
        action: () => document.getElementById("button--decrease")?.click(),
    },
    {
        code: "KeyP",
        shift: true,
        action: () => document.getElementById("visual-perform-button")?.click(),
    },
    {
        code: "KeyD",
        shift: true,
        action: () => document.getElementById("duration__input")?.focus(),
    },
    {
        code: "Space",
        shift: true,
        action: () => {
            const playButton = document.getElementById("play-button")
            const pauseButton = document.getElementById("pause-button")

            if (playButton && pauseButton.disabled) {
                playButton.click()
            } else if (pauseButton) {
                pauseButton.click()
            }
        },
    },
    {
        code: "KeyR",
        shift: true,
        action: () => document.getElementById("restart-button")?.click(),
    },
    {
        code: "KeyR",
        action: () => document.getElementById("button--results")?.click(),
    },
    {
        code: "KeyS",
        action: () => document.getElementById("save-button")?.click(),
    },
]

function handleKeydown(event) {
    const matchingBindings = keyBindings.filter(
        (binding) => binding.code === event.code
    )

    matchingBindings.sort((a, b) => {
        const aHasModifiers =
            a.ctrl !== undefined || a.shift !== undefined || a.alt !== undefined
        const bHasModifiers =
            b.ctrl !== undefined || b.shift !== undefined || b.alt !== undefined
        return bHasModifiers - aHasModifiers
    })

    for (const binding of matchingBindings) {
        if (
            (binding.ctrl === undefined || binding.ctrl === event.ctrlKey) &&
            (binding.shift === undefined || binding.shift === event.shiftKey) &&
            (binding.alt === undefined || binding.alt === event.altKey)
        ) {
            event.preventDefault()
            binding.action()
            break
        }
    }
}

export function initKeyboardControls() {
    document.addEventListener("keydown", handleKeydown)
}

export function removeKeyboardControls() {
    document.removeEventListener("keydown", handleKeydown)
}
