export const calculateGamma = (velocity: number): number => {
  return 1 / Math.sqrt(1 - Math.pow(velocity, 2))
}

export const calculateScaleX = (velocity: number): number => {
  return 1 / calculateGamma(velocity)
}

export const calculateDopplerFactor = (velocity: number): number => {
  return Math.sqrt((1 + velocity) / (1 - velocity))
}

export const calculateHueShift = (velocity: number): number => {
  const D = calculateDopplerFactor(velocity)
  const k = 10 // constant for hue shift
  return (k * Math.log(D)) % 360
}

export const calculateBrightnessBoost = (velocity: number, value: number): number => {
  const D = calculateDopplerFactor(velocity)
  return Math.min(Math.max(value * D, 0), 1)
} 