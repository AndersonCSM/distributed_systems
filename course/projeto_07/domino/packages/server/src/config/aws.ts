import { SQSClient } from '@aws-sdk/client-sqs';

/**
 * Configuração do cliente AWS SQS
 * Utiliza variáveis de ambiente para credenciais
 */
const awsCredentials: Record<string, string> = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
};

// Credenciais temporárias (STS/AWS Educate) exigem session token
if (process.env.AWS_SESSION_TOKEN) {
  awsCredentials.sessionToken = process.env.AWS_SESSION_TOKEN;
}

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: awsCredentials,
});

export const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL || '';

/**
 * Validar configuração AWS antes de iniciar
 */
export function validateAwsConfig(): boolean {
  if (!process.env.SQS_QUEUE_URL) {
    console.warn('⚠️ SQS_QUEUE_URL não configurada. Modo offline (em memória).');
    return false;
  }

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn('⚠️ Credenciais AWS não configuradas. Modo offline (em memória).');
    return false;
  }

  return true;
}
