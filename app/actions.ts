'use server';

import { getCompanyOverview } from '@/lib/sectors';

export async function checkProviderHealth() {
  try {
    const overview = await getCompanyOverview('BBCA');
    return {
      sectors: Boolean(overview.symbol || overview.company_name || overview.name),
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      sectors: false,
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
