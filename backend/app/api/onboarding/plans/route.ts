import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema
const createPlanSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  repository_url: z.string().url().optional(),
});

// GET /api/onboarding/plans - List all plans (optionally filtered by org)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organization_id');

    let query = supabaseAdmin
      .from('onboarding_plans')
      .select('*, organizations(name, slug)')
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data,
      count: data?.length || 0
    });
  } catch (error: any) {
    console.error('Error fetching onboarding plans:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch onboarding plans' },
      { status: 500 }
    );
  }
}

// POST /api/onboarding/plans - Create new onboarding plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createPlanSchema.parse(body);

    // Create plan
    const { data, error } = await supabaseAdmin
      .from('onboarding_plans')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating onboarding plan:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create onboarding plan' },
      { status: 500 }
    );
  }
}
