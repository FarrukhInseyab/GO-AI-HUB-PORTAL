import { supabase } from './supabase';

export interface MarketInsightsUpdateStatus {
  lastUpdated: Date;
  nextUpdate: Date;
  frequency: string;
  daysUntilNextUpdate: number;
  updateNeeded: boolean;
}

/**
 * Get the current market insights update status
 * @returns The update status including last update date, next update date, and if an update is needed
 */
export async function getMarketInsightsUpdateStatus(): Promise<MarketInsightsUpdateStatus> {
  try {
    const { data, error } = await supabase.rpc('get_market_insights_update_status');
    
    if (error) {
      console.error('Error getting market insights update status:', error);
      // Return default values if there's an error
      return {
        lastUpdated: new Date('2025-05-15'),
        nextUpdate: new Date('2025-05-22'),
        frequency: 'Weekly',
        daysUntilNextUpdate: 7,
        updateNeeded: false
      };
    }
    
    // Handle case where data is an array - take the first element
    const responseData = Array.isArray(data) ? data[0] : data;
    
    // Ensure we have valid dates
    if (!responseData || !responseData.last_updated || !responseData.next_update) {
      console.error('Invalid dates received from server:', data);
      return {
        lastUpdated: new Date('2025-05-15'),
        nextUpdate: new Date('2025-05-22'),
        frequency: responseData?.frequency || 'Weekly',
        daysUntilNextUpdate: responseData?.days_until_next_update || 7,
        updateNeeded: responseData?.update_needed || false
      };
    }
    
    return {
      lastUpdated: new Date(responseData.last_updated),
      nextUpdate: new Date(responseData.next_update),
      frequency: responseData.frequency,
      daysUntilNextUpdate: responseData.days_until_next_update,
      updateNeeded: responseData.update_needed
    };
  } catch (error) {
    console.error('Error in getMarketInsightsUpdateStatus:', error);
    // Return default values if there's an exception
    return {
      lastUpdated: new Date('2025-05-15'),
      nextUpdate: new Date('2025-05-22'),
      frequency: 'Weekly',
      daysUntilNextUpdate: 7,
      updateNeeded: false
    };
  }
}

/**
 * Update the market insights data
 * @param frequency The frequency of updates (Weekly, Monthly, Daily)
 * @returns Result of the update operation
 */
export async function updateMarketInsights(frequency: string = 'Weekly'): Promise<{
  success: boolean;
  message: string;
  lastUpdated?: Date;
  nextUpdate?: Date;
}> {
  try {
    const { data, error } = await supabase.rpc('update_market_insights', {
      frequency_param: frequency
    });
    
    if (error) {
      console.error('Error updating market insights:', error);
      return {
        success: false,
        message: error.message || 'Failed to update market insights'
      };
    }
    
    // Handle case where data is an array - take the first element
    const responseData = Array.isArray(data) ? data[0] : data;
    
    // Ensure we have valid dates
    if (!responseData || !responseData.last_updated || !responseData.next_update) {
      console.error('Invalid dates received from server after update:', data);
      return {
        success: responseData?.success || false,
        message: responseData?.message || 'Update completed',
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 7 days from now
      };
    }
    
    return {
      success: responseData.success,
      message: responseData.message,
      lastUpdated: responseData.last_updated ? new Date(responseData.last_updated) : undefined,
      nextUpdate: responseData.next_update ? new Date(responseData.next_update) : undefined
    };
  } catch (error) {
    console.error('Error in updateMarketInsights:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Check if market insights data needs to be updated
 * @returns True if an update is needed, false otherwise
 */
export async function checkUpdateNeeded(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_update_needed');
    
    if (error) {
      console.error('Error checking if update is needed:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkUpdateNeeded:', error);
    return false;
  }
}