import {
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ListQueuesCommand
} from '@aws-sdk/client-sqs';
import { sqsClient, SQS_QUEUE_URL, validateAwsConfig } from '../config/aws.js';

export interface SqsMessage {
  type: 'room_created' | 'player_joined' | 'player_left' | 'game_started' | 'game_ended' | 'move_played';
  roomCode: string;
  timestamp: number;
  data: Record<string, unknown>;
}

/**
 * Serviço para integração com AWS SQS
 * Gerencia envio e recebimento de mensagens para sincronização distribuída
 */
export class SqsService {
  private isAwsConfigured: boolean;

  constructor() {
    this.isAwsConfigured = validateAwsConfig();
  }

  /**
   * Enviar mensagem para fila SQS
   */
  async sendMessage(message: SqsMessage): Promise<string | null> {
    if (!this.isAwsConfigured) {
      console.log(`📤 [SQS-OFFLINE] ${message.type} em ${message.roomCode}`);
      return null;
    }

    try {
      const command = new SendMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        MessageBody: JSON.stringify(message),
        MessageAttributes: {
          MessageType: {
            StringValue: message.type,
            DataType: 'String',
          },
          RoomCode: {
            StringValue: message.roomCode,
            DataType: 'String',
          },
          Timestamp: {
            StringValue: message.timestamp.toString(),
            DataType: 'Number',
          },
        },
      });

      const response = await sqsClient.send(command);
      console.log(`📤 Mensagem SQS enviada: ${message.type} (ID: ${response.MessageId})`);
      return response.MessageId || null;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem SQS:', error);
      return null;
    }
  }

  /**
   * Receber mensagens da fila SQS
   */
  async receiveMessages(maxMessages: number = 10): Promise<SqsMessage[]> {
    if (!this.isAwsConfigured) {
      return [];
    }

    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: 1,
        MessageAttributeNames: ['All'],
      });

      const response = await sqsClient.send(command);
      const messages: SqsMessage[] = [];

      for (const msg of response.Messages || []) {
        if (msg.Body) {
          messages.push(JSON.parse(msg.Body));

          // Deletar mensagem da fila após processar
          if (msg.ReceiptHandle) {
            await this.deleteMessage(msg.ReceiptHandle);
          }
        }
      }

      return messages;
    } catch (error) {
      console.error('❌ Erro ao receber mensagens SQS:', error);
      return [];
    }
  }

  /**
   * Deletar mensagem da fila
   */
  private async deleteMessage(receiptHandle: string): Promise<void> {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        ReceiptHandle: receiptHandle,
      });

      await sqsClient.send(command);
    } catch (error) {
      console.error('❌ Erro ao deletar mensagem SQS:', error);
    }
  }

  /**
   * Listar filas disponíveis
   */
  async listQueues(): Promise<string[]> {
    if (!this.isAwsConfigured) {
      return [];
    }

    try {
      const command = new ListQueuesCommand({});
      const response = await sqsClient.send(command);
      return response.QueueUrls || [];
    } catch (error) {
      console.error('❌ Erro ao listar filas SQS:', error);
      return [];
    }
  }
}

export const sqsService = new SqsService();
