/**
 * Chart utilities for consistent styling across the app
 */

export const getChartColors = (isDark: boolean) => {
  if (isDark) {
    return [
      'hsl(203 100% 80%)',  // Light Blue #9AD3FF
      'hsl(142 76% 56%)',   // Light Green
      'hsl(38 92% 60%)',    // Light Orange
      'hsl(262 83% 70%)',   // Light Purple
      'hsl(340 82% 65%)',   // Light Pink
      'hsl(180 70% 50%)',   // Light Teal
      'hsl(25 95% 65%)',    // Light Red-Orange
      'hsl(220 70% 65%)',   // Light Indigo
    ]
  }

  return [
    'hsl(204 100% 41%)',  // Blue #0075CF
    'hsl(142 71% 45%)',   // Green
    'hsl(38 92% 50%)',    // Orange
    'hsl(262 83% 58%)',   // Purple
    'hsl(340 82% 52%)',   // Pink
    'hsl(180 100% 35%)',  // Teal
    'hsl(25 95% 53%)',    // Red-Orange
    'hsl(220 70% 50%)',   // Indigo
  ]
}

export const getChartColor = (index: number, isDark: boolean) => {
  const colors = getChartColors(isDark)
  return colors[index % colors.length]
}

export const formatNumber = (n: number) => n.toLocaleString('en-US')

export const formatPercent = (n: number) => `${n.toFixed(1)}%`

export const formatCompact = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

export const chartMargins = {
  top: 20,
  right: 30,
  left: 0,
  bottom: 5,
}
