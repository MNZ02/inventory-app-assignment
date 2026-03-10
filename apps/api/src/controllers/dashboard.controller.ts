import { Context } from 'hono'
import { dashboardService } from '../services/dashboard.service'

export const dashboardController = {
  async getStats(c: Context) {
    const stats = await dashboardService.getStats()
    return c.json({ data: stats })
  },
}
