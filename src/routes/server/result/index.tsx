import { createFileRoute } from "@tanstack/react-router";
import { getTodos } from "../index";
import z from "zod";
import { selectTodoSchema } from "@/db/schema";

export const Route = createFileRoute("/server/result/")({
  component: RouteComponent,
  loader: async () => getTodos(),
});

const todoSchema = z.array(selectTodoSchema);

function RouteComponent() {
  const testData = Route.useLoaderData();
  const checkData = todoSchema.safeParse(testData);
  if (!checkData.success) {
    return <div>❌ Invalid data from server</div>;
  }
  return <pre>{JSON.stringify(checkData, null, 2)}</pre>;
}
