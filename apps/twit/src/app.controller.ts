import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class AppController {
  @MessagePattern({ cmd: "get_tweets" })
  getTweets() {
    console.log("🐦 [Tweet] 트윗 목록 요청받음");
    return [
      { id: 1, content: "오늘 날씨 좋네요", writer: "user1" },
      { id: 2, content: "MSA 공부 중!", writer: "wangchobo" },
    ];
  }
}
