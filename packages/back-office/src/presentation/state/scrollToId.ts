export function scrollToId(id: string) {
    document.querySelector(`#${id}`)?.scrollIntoView({behavior: 'smooth'});
}
