'use client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: {
    nav: { properties:'Properties', cars:'Cars', slugs:'Slugs', plans:'Plans', signIn:'Sign In', editor:'Editor', cart:'Cart' },
    editor: { save:'Save', saving:'Saving...', preview:'Preview', publish:'💳 Publish', viewSite:'🟢 View Site' },
    cart: { title:'Cart', empty:'Cart is empty', total:'Total', pay:'Continue →', confirmed:'Payment confirmed!', close:'Close' },
    common: { loading:'Loading...', save:'Save', cancel:'Cancel', add:'Add', search:'Search' },
  }},
  es: { translation: {
    nav: { properties:'Propiedades', cars:'Coches', slugs:'Slugs', plans:'Planes', signIn:'Iniciar Sesión', editor:'Editor', cart:'Carrito' },
    editor: { save:'Guardar', saving:'Guardando...', preview:'Vista Previa', publish:'💳 Publicar', viewSite:'🟢 Ver Sitio' },
    cart: { title:'Carrito', empty:'Carrito vacío', total:'Total', pay:'Continuar →', confirmed:'¡Pago confirmado!', close:'Cerrar' },
    common: { loading:'Cargando...', save:'Guardar', cancel:'Cancelar', add:'Añadir', search:'Buscar' },
  }},
  pt: { translation: {
    nav: { properties:'Imóveis', cars:'Carros', slugs:'Slugs', plans:'Planos', signIn:'Entrar', editor:'Editor', cart:'Carrinho' },
    editor: { save:'Salvar', saving:'Salvando...', preview:'Preview', publish:'💳 Publicar', viewSite:'🟢 Ver Site' },
    cart: { title:'Carrinho', empty:'Carrinho vazio', total:'Total', pay:'Continuar →', confirmed:'Pagamento confirmado!', close:'Fechar' },
    common: { loading:'Carregando...', save:'Salvar', cancel:'Cancelar', add:'Adicionar', search:'Buscar' },
  }},
  de: { translation: {
    nav: { properties:'Immobilien', cars:'Autos', slugs:'Slugs', plans:'Pläne', signIn:'Anmelden', editor:'Editor', cart:'Warenkorb' },
    editor: { save:'Speichern', saving:'Speichern...', preview:'Vorschau', publish:'💳 Veröffentlichen', viewSite:'🟢 Ansehen' },
    cart: { title:'Warenkorb', empty:'Leer', total:'Gesamt', pay:'Weiter →', confirmed:'Zahlung bestätigt!', close:'Schließen' },
    common: { loading:'Laden...', save:'Speichern', cancel:'Abbrechen', add:'Hinzufügen', search:'Suchen' },
  }},
  it: { translation: {
    nav: { properties:'Proprietà', cars:'Auto', slugs:'Slugs', plans:'Piani', signIn:'Accedi', editor:'Editor', cart:'Carrello' },
    editor: { save:'Salva', saving:'Salvataggio...', preview:'Anteprima', publish:'💳 Pubblica', viewSite:'🟢 Vedi Sito' },
    cart: { title:'Carrello', empty:'Vuoto', total:'Totale', pay:'Continua →', confirmed:'Pagamento confermato!', close:'Chiudi' },
    common: { loading:'Caricamento...', save:'Salva', cancel:'Annulla', add:'Aggiungi', search:'Cerca' },
  }},
  ja: { translation: {
    nav: { properties:'不動産', cars:'車', slugs:'スラッグ', plans:'プラン', signIn:'ログイン', editor:'編集', cart:'カート' },
    editor: { save:'保存', saving:'保存中...', preview:'プレビュー', publish:'💳 公開', viewSite:'🟢 表示' },
    cart: { title:'カート', empty:'空', total:'合計', pay:'続ける →', confirmed:'支払い確認！', close:'閉じる' },
    common: { loading:'読込中...', save:'保存', cancel:'キャンセル', add:'追加', search:'検索' },
  }},
  zh: { translation: {
    nav: { properties:'房产', cars:'汽车', slugs:'短链', plans:'套餐', signIn:'登录', editor:'编辑', cart:'购物车' },
    editor: { save:'保存', saving:'保存中...', preview:'预览', publish:'💳 发布', viewSite:'🟢 查看' },
    cart: { title:'购物车', empty:'空', total:'总计', pay:'继续 →', confirmed:'付款确认！', close:'关闭' },
    common: { loading:'加载中...', save:'保存', cancel:'取消', add:'添加', search:'搜索' },
  }},
};

// Only init once, safely (no browser detector to avoid SSR issues)
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    lng: typeof window !== 'undefined' ? (localStorage.getItem('i18n-lang') || navigator.language.slice(0,2) || 'en') : 'en',
  });
}

export { i18n };
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];
