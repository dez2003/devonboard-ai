import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if environment variables are configured
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
    const hasComposioKey = !!process.env.COMPOSIO_API_KEY;

    const supabaseStatus = hasSupabaseUrl && hasSupabaseKey ? 'configured' : 'not_configured';
    const claudeStatus = hasClaudeKey ? 'configured' : 'not_configured';
    const composioStatus = hasComposioKey ? 'configured' : 'not_configured';

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        supabase: supabaseStatus,
        claude: claudeStatus,
        composio: composioStatus
      },
      version: '0.1.0',
      message: supabaseStatus === 'not_configured'
        ? 'API is running! Configure environment variables to enable all features.'
        : 'All services configured and ready!'
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Service unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
