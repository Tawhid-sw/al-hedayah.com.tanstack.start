import { createFileRoute } from "@tanstack/react-router";
import { fakeDBSchema, getTodos } from "../index";
import z from "zod";

export const Route = createFileRoute("/server/result/")({
  component: RouteComponent,
  loader: async () => getTodos(),
});

const todoSchema = z.array(fakeDBSchema);

function RouteComponent() {
  const testData = Route.useLoaderData();
  const checkData = todoSchema.safeParse(testData);
  if (!checkData.success) {
    return <div>❌ Invalid data from server</div>;
  }
  return (
    <div>
      <pre>{JSON.stringify(checkData, null, 2)}</pre>
    </div>
  );
}
