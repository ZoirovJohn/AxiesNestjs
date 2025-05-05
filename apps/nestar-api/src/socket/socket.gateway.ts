import { Logger } from "@nestjs/common";
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "ws";
import * as WebSocket from "ws";

interface MessagePayload {
  event: string;
  text: string;
}

interface InfoPayload {
  event: string;
  totalClients: number;
}

@WebSocketGateway({ transports: ["websocket"], secure: false }) // secure bolmaligi kk va transportsni websocket qilib olamz
export class SocketGateway implements OnGatewayInit {
  private logger: Logger = new Logger("SocketGateway"); // loggerni class ichida ishlatish uchun private qilib olamiz va instisni => logger
  private summaryClient: number = 0; // clientlar sonini saqlab turadi

  @WebSocketServer()
  server: Server;

  public afterInit(server: Server) {
    this.logger.verbose(
      `WebSocket server initialized & total [${this.summaryClient}]`
    );
  }

  handleConnection(client: WebSocket, ...args: any) {
    // yangi client websocketga ulanganida ishga tushadi, ...args => argumetlar
    this.summaryClient++; // clientlar sonini oshiramiz
    this.logger.verbose(`Connection & total [${this.summaryClient}]`);

    const infoMsg: InfoPayload = {
      event: "info",
      totalClients: this.summaryClient,
    };
    this.emitMessage(infoMsg);
  }

  handleDisconnect(client: WebSocket) {
    // client websocketdan chqb ketganda ishga tushadi
    this.summaryClient--; // clientlar sonini kamaytiramiz
    this.logger.verbose(`Disconnection & total [${this.summaryClient}]`);

    const infoMsg: InfoPayload = {
      event: "info",
      totalClients: this.summaryClient,
    };
    // client - disconnect
    this.broadcastMessage(client, infoMsg);
  }

  @SubscribeMessage("message")
  public async handleMessage(
    client: WebSocket,
    payload: string
  ): Promise<void> {
    const newMessage: MessagePayload = { event: "message", text: payload };

    this.logger.verbose(`NEW MESSAGE: ${payload}`);
    this.emitMessage(newMessage);
  }

  private broadcastMessage(
    sender: WebSocket,
    message: InfoPayload | MessagePayload
  ) {
    this.server.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private emitMessage(message: InfoPayload | MessagePayload) {
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
