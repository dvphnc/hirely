
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function restoreRecord<T extends { [key: string]: any }>(
  tableName: string, 
  primaryKey: string,
  primaryKeyValue: string,
  queryClient: any,
  queryKey: string | string[]
): Promise<T | null> {
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
