export function scrollToIdState(id: string) {
    document.querySelector(`#${id}`)?.scrollIntoView({behavior: 'smooth'});
}
