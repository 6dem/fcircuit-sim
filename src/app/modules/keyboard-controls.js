import { hideElement, showElement } from "../utils/show-hide-element.js"

const shortcutsButton = document.getElementById("shortcuts-button")
const shortcutsField = document.getElementById("shortcuts-field")

const keyBindings = [
    {
        code: "Slash",
        action: () => document.getElementById("shortcuts-button")?.click(),
    },
    {
        code: "Escape",
        action: () => document.getElementById("modal-overlay")?.click(),
    },
    {
        code: "KeyF",
        action: () => document.getElementById("attach-file-button")?.click(),
    },
    {
        code: "KeyU",
        action: () => document.getElementById("load-sample-button")?.click(),
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
        code: "KeyS",
        shift: true,
        action: () => document.getElementById("sign-checkbox")?.click(),
    },
    {
        code: "KeyI",
        shift: true,
        action: () => document.getElementById("index-checkbox")?.click(),
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
        code: "KeyZ",
        shift: true,
        action: () => document.getElementById("input-set")?.click(),
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
    {
        code: "KeyA",
        action: () => document.getElementById("checkbox-arrow")?.click(),
    },
    {
        code: "KeyF",
        alt: true,
        action: () => document.getElementById("analyze-attach-button")?.click(),
    },
    {
        code: "KeyC",
        alt: true,
        action: () => document.getElementById("radio-1")?.click(),
    },
    {
        code: "KeyA",
        alt: true,
        action: () => document.getElementById("radio-2")?.click(),
    },
    {
        code: "KeyM",
        alt: true,
        action: () => document.getElementById("radio-3")?.click(),
    },
    {
        code: "KeyR",
        alt: true,
        action: () => document.getElementById("analyze-reset-button")?.click(),
    },
]

function handleKeydown(event) {
    const matchingBindings = keyBindings.filter((binding) => binding.code === event.code)

    matchingBindings.sort((a, b) => {
        const aHasModifiers = a.ctrl !== undefined || a.shift !== undefined || a.alt !== undefined
        const bHasModifiers = b.ctrl !== undefined || b.shift !== undefined || b.alt !== undefined
        return bHasModifiers - aHasModifiers
    })

    for (const binding of matchingBindings) {
        const ctrl = !!binding.ctrl
        const shift = !!binding.shift
        const alt = !!binding.alt
        if (event.ctrlKey === ctrl && event.shiftKey === shift && event.altKey === alt) {
            event.preventDefault()
            binding.action()
            break
        }
    }
}

function initKeyboardControls() {
    document.addEventListener("keydown", handleKeydown)
}

function removeKeyboardControls() {
    document.removeEventListener("keydown", handleKeydown)
}

function handleShortcutsClick() {
    const isHidden = shortcutsField.classList.contains("hidden")

    if (isHidden) {
        showElement(shortcutsField)
        shortcutsButton.setAttribute("title", "Hide shortcuts")
        shortcutsButton.setAttribute("aria-label", "Hide keyboard shortcuts")
    } else {
        hideElement(shortcutsField)
        shortcutsButton.setAttribute("title", "Show shortcuts")
        shortcutsButton.setAttribute("aria-label", "Show keyboard shortcuts")
    }
}

function initShortcutsToggle() {
    if (!shortcutsButton || !shortcutsField) return

    shortcutsButton.addEventListener("click", handleShortcutsClick)
}

export { initKeyboardControls, initShortcutsToggle, removeKeyboardControls }
