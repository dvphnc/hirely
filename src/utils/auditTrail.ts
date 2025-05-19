
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates a record with audit trail information
 * @param tableName The name of the table to update
 * @param id The ID or primary key value of the record
 * @param primaryKeyField The name of the primary key field
 * @param userData Optional additional data to update along with audit information
 */
export const updateAuditTrail = async (
  tableName: 'employee' | 'job' | 'department' | 'jobhistory' | 'profiles' | 'user_permissions', 
  id: string | number, 
  primaryKeyField: string,
  userData?: Record<string, unknown>
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) return;
  
  const timestamp = new Date().toISOString();
  
  // Combine audit data with any additional user data
  const updateData: Record<string, unknown> = {
    updated_by: userId,
    updated_at: timestamp,
    ...(userData || {})
  };
  
  // Update the record with audit information
  const { error } = await supabase
    .from(tableName)
    .update(updateData)
    .eq(primaryKeyField, id);
    
  if (error) {
    console.error(`Error updating audit trail for ${tableName}:`, error);
  }
};
