import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Configuração do Domínio Raiz
  const rootDomain = 'trustbank.xyz';
  
  // Páginas que devem ser acessadas APENAS pelo domínio principal (Admin/Editor)
  const appPages = ['/auth', '/dashboard', '/editor', '/planos', '/slugs', '/governance', '/api'];

  // 2. Ignorar arquivos estáticos, pastas do Next e Localhost (desenvolvimento)
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('.') ||
    hostname === 'localhost:3000'
  ) {
    return NextResponse.next();
  }

  // 3. Se estiver no domínio principal, segue o fluxo normal
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    return NextResponse.next();
  }

  // 4. Extrair o subdomínio (ex: jessica.trustbank.xyz -> jessica)
  const subdomain = hostname.replace(`.${rootDomain}`, '');

  // 5. Proteção: Se alguém tentar acessar /dashboard num subdomínio, manda pro principal
  if (appPages.some(page => url.pathname.startsWith(page))) {
    return NextResponse.redirect(new URL(`https://${rootDomain}${url.pathname}`, request.url));
  }

  // 6. REESCRITA INTERNA (A Mágica do Wildcard)
  // O Navegador mostra: jessica.trustbank.xyz
  // O Next.js entrega: /s/jessica
  return NextResponse.rewrite(new URL(`/s/${subdomain}${url.pathname}`, request.url));
}
