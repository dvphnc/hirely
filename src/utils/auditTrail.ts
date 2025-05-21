
import { supabase } from "@/integrations/supabase/client";

// Define valid table names as a union type to avoid type recursion issues
type ValidTableName = 'employee' | 'job' | 'department' | 'jobhistory' | 'profiles' | 'user_permissions' | 
                      'customer' | 'payment' | 'sales' | 'pricehist' | 'product' | 'salesdetail';

/**
 * Updates a record with audit trail information
 * @param tableName The name of the table to update
 * @param id The ID or primary key value of the record
 * @param primaryKeyField The name of the primary key field
 * @param userData Optional additional data to update along with audit information
 */
export const updateAuditTrail = async (
  tableName: ValidTableName, 
  id: string | number, 
  primaryKeyField: string,
  userData: Record<string, any> = {}
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) return;
  
  const timestamp = new Date().toISOString();
  
  // Combine audit data with any additional user data
  const updateData: Record<string, any> = {
    updated_by: userId,
    updated_at: timestamp,
    ...userData
  };
  
  // For composite keys in jobhistory table
  if (tableName === 'jobhistory' && primaryKeyField === 'combined_id' && typeof id === 'string') {
    // Parse the composite key format "empno-jobcode-effdate"
    const parts = id.split('-');
    if (parts.length === 3) {
      const empno = parts[0];
      const jobcode = parts[1];
      const effdate = parts[2];
      
      try {
        const { error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('empno', empno)
          .eq('jobcode', jobcode)
          .eq('effdate', effdate);
          
        if (error) {
          console.error(`Error updating audit trail for ${tableName}:`, error);
        }
      } catch (error) {
        console.error(`Exception while updating audit trail for ${tableName}:`, error);
      }
      return;
    }
  }
  
  // Standard update for non-composite keys
  try {
    const { error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq(primaryKeyField, id);
      
    if (error) {
      console.error(`Error updating audit trail for ${tableName}:`, error);
    }
  } catch (error) {
    console.error(`Exception while updating audit trail for ${tableName}:`, error);
  }
};
