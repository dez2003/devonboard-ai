import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DocumentationSource } from '@/types';

/**
 * GET /api/sources
 *
 * Get all documentation sources for an organization
 *
 * Query params:
 *  - orgId: organization ID (required)
 *  - planId: filter by plan ID (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');
    const planId = searchParams.get('planId');

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    let query = supabase
      .from('documentation_sources')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (planId) {
      query = query.eq('plan_id', planId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[sources] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch sources' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as DocumentationSource[],
    });
  } catch (error: any) {
    console.error('[sources] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sources
 *
 * Add a new documentation source
 *
 * Body:
 * {
 *   organizationId: string,
 *   planId: string,
 *   sourceType: 'github' | 'notion' | 'confluence' | 'gdocs' | 'slack' | 'linear',
 *   sourceUrl: string,
 *   sourceName?: string,
 *   filePaths: string[],
 *   filterConfig?: object,
 *   syncFrequency?: 'realtime' | 'hourly' | 'daily'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      planId,
      sourceType,
      sourceUrl,
      sourceName,
      filePaths = [],
      filterConfig,
      syncFrequency = 'daily',
    } = body;

    // Validation
    if (!organizationId || !planId || !sourceType || !sourceUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: organizationId, planId, sourceType, sourceUrl',
        },
        { status: 400 }
      );
    }

    const validSourceTypes = ['github', 'notion', 'confluence', 'gdocs', 'slack', 'linear'];
    if (!validSourceTypes.includes(sourceType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid source type. Must be one of: ${validSourceTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('documentation_sources')
      .insert({
        organization_id: organizationId,
        plan_id: planId,
        source_type: sourceType,
        source_url: sourceUrl,
        source_name: sourceName,
        file_paths: filePaths,
        filter_config: filterConfig,
        sync_frequency: syncFrequency,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[sources] Failed to create source:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create documentation source' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as DocumentationSource,
    });
  } catch (error: any) {
    console.error('[sources] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sources?id=...
 *
 * Delete a documentation source
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sourceId = searchParams.get('id');

    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: 'Source ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('documentation_sources')
      .delete()
      .eq('id', sourceId);

    if (error) {
      console.error('[sources] Failed to delete source:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete documentation source' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Documentation source deleted successfully',
    });
  } catch (error: any) {
    console.error('[sources] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sources?id=...
 *
 * Update a documentation source
 */
export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sourceId = searchParams.get('id');

    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: 'Source ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: Partial<DocumentationSource> = {};

    // Only allow specific fields to be updated
    const allowedFields = [
      'source_name',
      'source_url',
      'file_paths',
      'filter_config',
      'sync_frequency',
      'is_active',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        (updates as any)[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('documentation_sources')
      .update(updates)
      .eq('id', sourceId)
      .select()
      .single();

    if (error) {
      console.error('[sources] Failed to update source:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update documentation source' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as DocumentationSource,
    });
  } catch (error: any) {
    console.error('[sources] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
