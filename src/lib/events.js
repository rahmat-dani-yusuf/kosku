export const EVENT_DATA_BERUBAH = 'kosku:data-berubah'

export function umumkanDataBerubah() {
  window.dispatchEvent(new Event(EVENT_DATA_BERUBAH))
}

export function dengarDataBerubah(handler) {
  window.addEventListener(EVENT_DATA_BERUBAH, handler)
  return () => window.removeEventListener(EVENT_DATA_BERUBAH, handler)
}
