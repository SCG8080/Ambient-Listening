import { formatTime } from '../../utils/formatTime'

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats seconds only', () => {
    expect(formatTime(45)).toBe('00:45')
  })

  it('formats one minute exactly', () => {
    expect(formatTime(60)).toBe('01:00')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('02:05')
  })

  it('formats large values', () => {
    expect(formatTime(3661)).toBe('61:01')
  })

  it('floors fractional seconds', () => {
    expect(formatTime(90.9)).toBe('01:30')
  })
})
