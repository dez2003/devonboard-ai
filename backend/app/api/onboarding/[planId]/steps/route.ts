import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema
const createStepSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  order_index: z.number().int().min(0),
  step_type: z.enum(['setup', 'documentation', 'task', 'verification']),
  content: z.object({
    instructions: z.string(),
    code: z.string().optional(),
    commands: z.array(z.string()).optional(),
    verificationSteps: z.array(z.string()).optional(),
  }),
  dependencies: z.array(z.string().uuid()).optional().default([]),
  estimated_duration: z.number().int().min(1).optional().default(30),
});

// GET /api/onboarding/:planId/steps - Get all steps for a plan
export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_steps')
      .select('*')
      .eq('plan_id', params.planId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      data,
      count: data?.length || 0
    });
  } catch (error: any) {
    console.error('Error fetching onboarding steps:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch onboarding steps' },
      { status: 500 }
    );
  }
}

// POST /api/onboarding/:planId/steps - Create new step
export async function POST(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createStepSchema.parse(body);

    // Create step
    const { data, error } = await supabaseAdmin
      .from('onboarding_steps')
      .insert({
        ...validatedData,
        plan_id: params.planId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating onboarding step:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create onboarding step' },
      { status: 500 }
    );
  }
}
