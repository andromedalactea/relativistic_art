import {
  calculateGamma,
  calculateScaleX,
  calculateDopplerFactor,
} from './physics'

describe('Physics calculations', () => {
  test('v = 0 → γ = 1, scale_x = 1, D = 1', () => {
    const v = 0
    expect(calculateGamma(v)).toBeCloseTo(1, 2)
    expect(calculateScaleX(v)).toBeCloseTo(1, 2)
    expect(calculateDopplerFactor(v)).toBeCloseTo(1, 2)
  })

  test('v = 0.866 c → γ ≈ 2', () => {
    const v = 0.866
    expect(calculateGamma(v)).toBeCloseTo(2, 2)
    expect(calculateScaleX(v)).toBeCloseTo(0.5, 2)
    expect(calculateDopplerFactor(v)).toBeCloseTo(3.73, 2)
  })

  test('v = 0.99 c → γ ≈ 7', () => {
    const v = 0.99
    expect(calculateGamma(v)).toBeCloseTo(7.09, 2)
    expect(calculateScaleX(v)).toBeCloseTo(0.14, 2)
    expect(calculateDopplerFactor(v)).toBeCloseTo(14.1, 2)
  })
}) 