export function waitForElement(className: string, timeout = 10000): Promise<Element> {
    return new Promise((resolve, reject) => {
        const existing = document.getElementsByClassName(className)
        if (existing.length === 1) {
            resolve(existing[0])
            return
        }

        const observer = new MutationObserver(() => {
            const el = document.getElementsByClassName(className)
            if (el.length === 1) {
                observer.disconnect()
                resolve(el[0])
            }
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })

        setTimeout(() => {
            observer.disconnect()
            reject(new Error(`Timed out waiting for element: .${className}`))
        }, timeout)
    })
}