
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

// Define more specific types
type TableName = keyof Database['public']['Tables'];

export async function restoreRecord(
  tableName: string, // Changed from generic parameter to string
  primaryKey: string,
  primaryKeyValue: string,
  queryClient: any,
  queryKey: string | string[]
): Promise<any | null> {
  try {
    // Get the record
    // Using `from` with a string parameter and type assertion for better compatibility
    const { data: record, error: getError } = await supabase
      .from(tableName as any)
      .select('*')
      .eq(primaryKey, primaryKeyValue)
      .single();

    if (getError) throw getError;

    // Update the record to set status to restored
    const { data: updatedRecord, error: updateError } = await supabase
      .from(tableName as any)
      .update({
        status: 'restored',
        stamp: new Date().toISOString()
      })
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
