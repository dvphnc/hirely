
import { supabase } from "@/integrations/supabase/client";

// Define valid table names explicitly to avoid the type recursion issue
type ValidTableNames = 'employee' | 'job' | 'department' | 'jobhistory' | 'profiles' | 'user_permissions';

/**
 * Updates a record with audit trail information
 * @param tableName The name of the table to update
 * @param id The ID or primary key value of the record
 * @param primaryKeyField The name of the primary key field
 * @param userData Optional additional data to update along with audit information
 */
export const updateAuditTrail = async (
  tableName: ValidTableNames, 
  id: string | number, 
  primaryKeyField: string,
  userData?: Record<string, any>
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) return;
  
  const timestamp = new Date().toISOString();
  
  // Combine audit data with any additional user data
  const updateData = {
    updated_by: userId,
    updated_at: timestamp,
    ...(userData || {})
  };
  
  // For composite keys in jobhistory table
  if (tableName === 'jobhistory' && primaryKeyField === 'combined_id' && typeof id === 'string') {
    // Parse the composite key format "empno-jobcode-effdate"
    const parts = id.split('-');
    if (parts.length === 3) {
      const empno = parts[0];
      const jobcode = parts[1];
      const effdate = parts[2];
      
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('empno', empno)
        .eq('jobcode', jobcode)
        .eq('effdate', effdate);
        
      if (error) {
        console.error(`Error updating audit trail for ${tableName}:`, error);
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
