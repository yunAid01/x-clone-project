import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class AppController {
  @MessagePattern({ cmd: "send_notice" })
  sendNotice(data: any) {
    return {
      status: "success",
      message: `Notification sent successfully.`,
      receivedData: data,
    };
  }
}
