import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Admin para ignorar RLS no backend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verifica se o pagamento foi bem-sucedido na Helio
    const isSuccess = body.status === 'SUCCESS' || body.transactionStatus === 'SUCCESS';

    if (isSuccess && body.metaData) {
      const { user_id, type, item_id } = body.metaData;

      if (!user_id) {
        console.error('Webhook: user_id não encontrado no metaData');
        return NextResponse.json({ error: 'No user_id' }, { status: 400 });
      }

      // 1. Desbloqueio de Vídeo (Tabela: paywall_unlocks)
      if (type === 'video') {
        await supabaseAdmin.from('paywall_unlocks').insert({
          user_id: user_id,
          video_id: item_id,
          amount_paid: body.amount ? Number(body.amount) / 100 : 0,
          // Define expiração para 24h (ajustado de 12h para melhor experiência)
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      // 2. Venda de Slug ou Leilão (Tabela: mini_sites)
      // Transfere a propriedade do site/slug para o comprador
      if (type === 'slug_sale' || type === 'slug_auction') {
        await supabaseAdmin
          .from('mini_sites')
          .update({ 
            user_id: user_id, 
            published: true,
            updated_at: new Date().toISOString()
          })
          .eq('slug', item_id);
          
        // Atualiza também o registro na tabela de slugs
        await supabaseAdmin
          .from('slug_registrations')
          .update({ 
            user_id: user_id,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() 
          })
          .eq('slug', item_id);
      }

      // 3. Assinaturas PRO (Tabela: subscriptions)
      if (type === 'subscription') {
        await supabaseAdmin
          .from('subscriptions')
          .upsert({ 
            user_id: user_id, 
            plan: 'pro',
            price: body.amount ? Number(body.amount) / 100 : 29.90,
            status: 'active',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }, { onConflict: 'user_id' });
      }

      // 4. Desbloqueio de CV (Tabela: mini_sites)
      if (type === 'cv') {
        // No seu banco, o CV é controlado pela coluna cv_locked
        await supabaseAdmin
          .from('mini_sites')
          .update({ cv_locked: false })
          .eq('id', item_id);
      }
      
      console.log(`[TrustBank Webhook] Sucesso: ${type} processado para o user ${user_id}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[TrustBank Webhook Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
