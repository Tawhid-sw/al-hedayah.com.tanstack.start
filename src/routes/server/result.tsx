import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { z } from "zod";

// UI Components
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Logic Imports
import {
  getTodos,
  FakeDataSchema,
  deleteTodo,
  completedTodos,
  type fakeDataProps,
} from "./index";
import { useEffect } from "react";

export const Route = createFileRoute("/server/result")({
  component: RouteComponent,
  loader: async () => {
    const todos = await getTodos();
    return z.array(FakeDataSchema).parse(todos);
  },
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const loaderData = Route.useLoaderData();
  const bc = new BroadcastChannel("todo_channel");

  const { data: todos = [] } = useQuery({
    queryKey: ["todos"],
    queryFn: () => getTodos(),
    initialData: loaderData,
    staleTime: Infinity,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => completedTodos({ data: { id } }),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previous = queryClient.getQueryData<fakeDataProps[]>(["todos"]);
      queryClient.setQueryData(
        ["todos"],
        (old: fakeDataProps[] | undefined) => {
          old?.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          );
        }
      );
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["todos"], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      bc.postMessage("update_list");
    },
  });

  useEffect(() => {
    bc.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    };
  }, []);

  const handleDelete = async (id: number) => {
    await deleteTodo({ data: { id } });
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  };

  return (
    <div className="container mx-auto py-10 flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>

      <div className="w-full max-w-2xl grid gap-4">
        {todos.map((todo) => (
          <Card key={todo.id} className="transition-all hover:shadow-md">
            <div className="flex items-center justify-between p-4">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={() => toggleMutation.mutate(todo.id)}
                />
                <div className="grid gap-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    ID: #{todo.id}
                  </span>
                  <p
                    className={`text-lg font-semibold leading-none ${todo.completed ? "line-through text-muted-foreground/50" : ""}`}
                  >
                    {todo.title}
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                <Badge variant={todo.completed ? "secondary" : "outline"}>
                  {todo.completed ? "Done" : "Pending"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(todo.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {todos.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            No tasks found.
          </p>
        )}
      </div>
    </div>
  );
}
