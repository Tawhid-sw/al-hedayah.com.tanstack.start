import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { insertTodoSchema, selectTodoSchema, todoTable } from "@/db/schema";
import { db } from "@/db";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";

import { useQueryClient } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

export type TodoDataProps = z.infer<typeof selectTodoSchema>;
export const TodoDataIdSchema = z.number().nonnegative();

export const postNewTodo = createServerFn({ method: "POST" })
  .inputValidator(insertTodoSchema)
  .handler(async ({ data }) => {
    await db.insert(todoTable).values(data);
    return { ok: true, message: "New todo added" };
  });

export const getTodos = createServerFn({ method: "GET" }).handler(async () => {
  return await db.select().from(todoTable);
});

export const completedTodos = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number(),
    })
  )
  .handler(async ({ data }) => {
    const updateTodo = await db
      .update(todoTable)
      .set({ completed: true })
      .where(eq(todoTable.id, data.id));
    if (!updateTodo) throw new Error("Todo not found");
    return { ok: true, message: "Todo updated" };
  });

export const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number(),
    })
  )
  .handler(async ({ data }) => {
    await db.delete(todoTable).where(eq(todoTable.id, data.id));
    return { message: "The task is deleted" };
  });

export const Route = createFileRoute("/server/")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      title: "",
    },
    validators: {
      onChange: insertTodoSchema,
    },
    onSubmit: async ({ value }) => {
      const newTodo = {
        title: value.title,
      };
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      queryClient.setQueryData(["todos"], (old: TodoDataProps[] | undefined) =>
        old ? [...old, newTodo] : [newTodo]
      );
      try {
        const res = await postNewTodo({ data: newTodo });
        console.log(res.message, value);
        if (res.ok) {
          form.reset();
          navigate({ to: "/server/result" });
        }
      } catch (err) {
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        console.error("Failed to post:", err);
      }
    },
  });
  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Add New Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="bug-report-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="title"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Todo title</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Todo title"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  form="bug-report-form"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Submit"}
                </Button>
              )}
            />
          </Field>
        </CardFooter>
      </Card>

      <Link to="/server/result">
        <Button className="m-16 ">Goto to server result</Button>
      </Link>
    </div>
  );
}
