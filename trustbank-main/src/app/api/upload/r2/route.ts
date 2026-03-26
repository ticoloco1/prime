import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { supabase } from '@/lib/supabase'; 

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: Request) {
  try {
    // 1. Verificar sessão usando o seu cliente Supabase existente
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // 2. Criar a chave única do arquivo no Cloudflare R2
    const key = `uploads/${session.user.id}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({ 
      signedUrl, 
      key,
      publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}` 
    });

  } catch (error) {
    console.error("Erro no R2 Upload:", error);
    return NextResponse.json({ error: "Falha ao gerar upload" }, { status: 500 });
  }
}