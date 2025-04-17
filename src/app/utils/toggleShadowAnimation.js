export function addShadowAnimation(element) {
    element.classList.add("animated-shadow")
}

export function removeShadowAnimation(element) {
    element.style.animation = "none"
    element.classList.remove("animated-shadow")
}
