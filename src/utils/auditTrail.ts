
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { PostgrestError } from "@supabase/supabase-js";

// Define a ValidTableName type to avoid "Type instantiation is excessively deep"
type ValidTableName = 
  | "employee"
  | "job"
  | "department"
  | "jobhistory"
  | "profiles"
  | "user_permissions"
  | "customer"
  | "payment"
  | "sales"
  | "pricehist"
  | "product"
  | "salesdetail";

/**
 * Create an audit trail record
 * @param data The row data that was affected
 * @param action 'INSERT' | 'UPDATE' | 'DELETE'
 * @param tableName The name of the table that was affected
 * @returns Promise<{ error: PostgrestError | null }>
 */
export const createAuditTrail = async <T extends Record<string, any>>(
  data: T,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  tableName: ValidTableName
): Promise<{ error: PostgrestError | null }> => {
  try {
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      console.error('No user ID found for audit trail');
      return { error: { message: 'No user ID found', details: '', hint: '', code: '403' } as PostgrestError };
    }

    // Create the audit trail record
    const { error } = await supabase
      .from('audit_trail')
      .insert({
        table_name: tableName,
        record_id: JSON.stringify(extractRecordId(data, tableName)),
        action: action,
        old_data: null, // We don't track old data in this simplified version
        new_data: action === 'DELETE' ? null : data,
        created_by: userId
      });

    if (error) {
      console.error('Error creating audit trail:', error);
    }

    return { error };
  } catch (error) {
    console.error('Unexpected error in createAuditTrail:', error);
    return { error: { message: 'Unexpected error', details: '', hint: '', code: '500' } as PostgrestError };
  }
};

// Function to extract the record ID from the data based on table name
function extractRecordId<T extends Record<string, any>>(data: T, tableName: ValidTableName): string | number | Record<string, any> {
  switch (tableName) {
    case 'employee':
      return { empno: data.empno };
    case 'job':
      return { jobcode: data.jobcode };
    case 'department':
      return { deptcode: data.deptcode };
    case 'jobhistory':
      return { 
        empno: data.empno,
        jobcode: data.jobcode,
        effdate: data.effdate
      };
    case 'profiles':
      return { id: data.id };
    case 'user_permissions':
      return { user_id: data.user_id };
    case 'customer':
      return { custno: data.custno };
    case 'payment':
      return { 
        custno: data.custno,
        paydate: data.paydate
      };
    case 'sales':
      return { invno: data.invno };
    case 'pricehist':
      return { 
        prodcode: data.prodcode,
        effdate: data.effdate
      };
    case 'product':
      return { prodcode: data.prodcode };
    case 'salesdetail':
      return { 
        invno: data.invno,
        prodcode: data.prodcode
      };
    default:
      // Return the full data for unknown tables - this should not happen with our type definition
      return data;
  }
}
