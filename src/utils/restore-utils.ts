
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

// Define more specific types
type TableName = keyof Database['public']['Tables'];

export async function restoreRecord<T extends TableName>(
  tableName: T, 
  primaryKey: string,
  primaryKeyValue: string,
  queryClient: any,
  queryKey: string | string[]
): Promise<any | null> {
  try {
    // Get the record
    const { data: record, error: getError } = await supabase
      .from(tableName)
      .select('*')
      .eq(primaryKey, primaryKeyValue)
      .single();

    if (getError) throw getError;

    // Update the record to set status to restored
    const { data: updatedRecord, error: updateError } = await supabase
      .from(tableName)
      .update({
        status: 'restored',
        stamp: new Date().toISOString()
      } as any)  // Using 'any' since we can't easily type this across all tables
      .eq(primaryKey, primaryKeyValue)
      .select()
      .single();

    if (updateError) throw updateError;

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey });

    toast.success(`${tableName} record restored successfully`);
    return updatedRecord;
  } catch (error: any) {
    toast.error(`Error restoring ${tableName}: ${error.message}`);
    return null;
  }
}
