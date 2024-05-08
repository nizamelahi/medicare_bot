import { apicall } from "@/features/chat-page/chat-services/chat-api/chat-api-plans-extension";

export async function POST(req: Request) {
  return apicall(req);
}
