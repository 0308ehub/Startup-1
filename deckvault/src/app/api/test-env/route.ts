import { NextResponse } from 'next/server';

export async function GET() {
  const publicKey = process.env.TCGPLAYER_PUBLIC_KEY;
  const privateKey = process.env.TCGPLAYER_PRIVATE_KEY;
  
  return NextResponse.json({
    hasPublicKey: !!publicKey,
    hasPrivateKey: !!privateKey,
    publicKeyLength: publicKey ? publicKey.length : 0,
    privateKeyLength: privateKey ? privateKey.length : 0,
    publicKeyPreview: publicKey ? `${publicKey.substring(0, 10)}...` : 'Not set',
    privateKeyPreview: privateKey ? `${privateKey.substring(0, 10)}...` : 'Not set',
  });
}
