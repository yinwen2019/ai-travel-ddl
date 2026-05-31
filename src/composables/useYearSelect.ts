import { ref } from 'vue'

const currentYear = ref(new Date().getFullYear())

export function useYearSelect() {
  function setYear(year: number) {
    currentYear.value = year
  }

  return { currentYear, setYear }
}
