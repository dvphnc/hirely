
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

type TableName = keyof Database['public']['Tables'];

// Helper type to get the row type for a specific table
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];

export async function restoreRecord<T extends TableName>(
  tableName: T, 
  primaryKey: string,
  primaryKeyValue: string,
  queryClient: any,
  queryKey: string | string[]
): Promise<Row<T> | null> {
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
      } as any) // Using 'any' here since we can't easily type this across all tables
      .eq(primaryKey, primaryKeyValue)
      .select()
      .single();

    if (updateError) throw updateError;

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey });

    toast.success(`${tableName} record restored successfully`);
    return updatedRecord as Row<T>;
  } catch (error: any) {
    toast.error(`Error restoring ${tableName}: ${error.message}`);
    return null;
  }
}
